import { TextExtractor } from './text-extractor';
import { SimplifyStatus } from '../shared/types';

export class SimplifierManager {
  private textExtractor: TextExtractor;
  private originalContentMap = new Map<HTMLElement, string>();
  private simplifiedContentMap = new Map<HTMLElement, string>();
  private currentViewMode: 'original' | 'simplified' = 'original';
  private status: SimplifyStatus = 'idle';
  private lastError: string | null = null;

  constructor() {
    this.textExtractor = new TextExtractor();
  }

  public getStatus(): SimplifyStatus {
    return this.status;
  }

  public getLastError(): string | null {
    return this.lastError;
  }

  public getCurrentViewMode(): 'original' | 'simplified' {
    return this.currentViewMode;
  }

  public hasSimplifiedText(): boolean {
    return this.simplifiedContentMap.size > 0 || Boolean(document.getElementById('dr-simplified-overlay'));
  }

  /**
   * Triggers AI simplification flow for full page or PDF text.
   */
  public async simplifyPage(backendUrl: string = 'http://localhost:3000/api/simplify'): Promise<boolean> {
    this.status = 'extracting';
    this.lastError = null;

    const { fullText, blocks } = this.textExtractor.extractPageText();
    const readableElements = this.textExtractor.getReadableElements();

    if (!fullText || fullText.trim().length < 5) {
      this.status = 'error';
      this.lastError = 'No readable text content found on this page. If this is a PDF, please highlight text with your mouse and click Simplify Selection!';
      return false;
    }

    // Save original HTML content for target elements
    for (const el of readableElements) {
      if (!this.originalContentMap.has(el)) {
        this.originalContentMap.set(el, el.innerHTML);
      }
    }

    const chunks = this.textExtractor.chunkText(fullText, 3000);
    this.status = 'simplifying';

    try {
      // Fetch all chunks in parallel for maximum speed
      const requests = chunks.map(async (chunk, index) => {
        const response = await fetch(backendUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            text: chunk,
            chunkIndex: index,
            totalChunks: chunks.length
          })
        });

        if (!response.ok) {
          const errJson = await response.json().catch(() => ({}));
          throw new Error(errJson.error || `Server responded with status ${response.status}`);
        }

        const data = await response.json();
        if (!data.simplifiedText) {
          throw new Error('Backend returned empty simplified response.');
        }

        return { index, text: this.cleanAiOutput(data.simplifiedText) };
      });

      const results = await Promise.all(requests);
      results.sort((a, b) => a.index - b.index);

      const combinedSimplifiedText = results.map((r) => r.text).join('\n\n');

      // If standard DOM elements exist, map back to elements
      if (readableElements.length > 0) {
        const simplifiedParagraphs = combinedSimplifiedText.split(/\n\n+/);
        let pIndex = 0;
        for (const el of readableElements) {
          if (pIndex < simplifiedParagraphs.length) {
            const simplifiedText = simplifiedParagraphs[pIndex].trim();
            if (simplifiedText) {
              this.simplifiedContentMap.set(el, simplifiedText);
            }
            pIndex++;
          }
        }
        this.showSimplified();
      }

      // Always display floating Card Overlay for PDFs or documents
      this.showSimplifiedOverlay(combinedSimplifiedText);

      this.status = 'success';
      return true;
    } catch (err: any) {
      console.error('[DyslexiaReader] Simplification error:', err);
      this.status = 'error';
      this.lastError = err.message || 'Failed to simplify page text. Make sure backend server is running.';
      return false;
    }
  }

  /**
   * Simplifies ONLY the user selected text range.
   */
  public async simplifySelectedText(selectedText?: string, backendUrl: string = 'http://localhost:3000/api/simplify'): Promise<boolean> {
    const textToSimplify = selectedText || window.getSelection()?.toString().trim();
    if (!textToSimplify || textToSimplify.length < 3) {
      return this.simplifyPage(backendUrl);
    }

    this.status = 'simplifying';
    this.lastError = null;

    try {
      const response = await fetch(backendUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: textToSimplify })
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({}));
        throw new Error(errJson.error || `Server responded with status ${response.status}`);
      }

      const data = await response.json();
      if (!data.simplifiedText) {
        throw new Error('Backend returned empty simplified response.');
      }

      const cleanedText = this.cleanAiOutput(data.simplifiedText);

      // Insert simplified text into selection if DOM allows, or show floating overlay card
      const selection = window.getSelection();
      let insertedInline = false;

      if (selection && selection.rangeCount > 0 && selection.toString().trim()) {
        try {
          const range = selection.getRangeAt(0);
          const container = document.createElement('mark');
          container.className = 'dr-simplified-selection';
          container.title = '✨ Simplified with Dyslexia Reader';
          container.innerText = cleanedText;

          range.deleteContents();
          range.insertNode(container);
          selection.removeAllRanges();
          insertedInline = true;
        } catch (e) {
          // Range mutation not allowed (e.g. PDF canvas viewer), fallback to floating overlay card
          insertedInline = false;
        }
      }

      // Always show floating overlay card if inline replacement failed or on PDF
      if (!insertedInline) {
        this.showSimplifiedOverlay(cleanedText);
      }

      this.status = 'success';
      return true;
    } catch (err: any) {
      console.error('[DyslexiaReader] Selection simplify error:', err);
      this.status = 'error';
      this.lastError = err.message || 'Failed to simplify selected text.';
      return false;
    }
  }

  /**
   * Displays floating Card Overlay with OpenDyslexic / Lexend font for PDFs & Webpages
   */
  public showSimplifiedOverlay(text: string): void {
    let overlay = document.getElementById('dr-simplified-overlay');
    if (!overlay) {
      overlay = document.createElement('div');
      overlay.id = 'dr-simplified-overlay';
      overlay.className = 'dr-floating-overlay';
      (document.body || document.documentElement).appendChild(overlay);
    }

    const formattedHtml = text
      .split(/\n\n+/)
      .map((p) => `<p style="margin-bottom: 12px;">${p}</p>`)
      .join('');

    overlay.innerHTML = `
      <div class="dr-overlay-card">
        <div class="dr-overlay-header">
          <span>✨ Dyslexia Reader — Simplified Content</span>
          <button type="button" class="dr-overlay-close" onclick="document.getElementById('dr-simplified-overlay').remove()">✕ Close</button>
        </div>
        <div class="dr-overlay-body">
          ${formattedHtml}
        </div>
      </div>
    `;

    overlay.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }

  /**
   * Cleans raw AI markdown output (removes intros like "Here is a simplified version", "---", "#", etc.)
   */
  private cleanAiOutput(text: string): string {
    if (!text) return '';
    return text
      .replace(/^#+\s+/gm, '')
      .replace(/^---+$/gm, '')
      .replace(/^(Here is|Here's|For easier reading:?|Simplified version:?).*?\n+/i, '')
      .replace(/^\*\s+/gm, '')
      .trim();
  }

  /**
   * Displays the AI simplified version of readable DOM nodes.
   */
  public showSimplified(): void {
    if (this.simplifiedContentMap.size === 0) return;

    for (const [el, simplifiedText] of this.simplifiedContentMap.entries()) {
      el.innerText = simplifiedText;
      el.classList.add('dr-simplified-content');
    }

    this.currentViewMode = 'simplified';
  }

  /**
   * Restores the page DOM nodes back to their original unmodified HTML.
   */
  public restoreOriginal(): void {
    const overlay = document.getElementById('dr-simplified-overlay');
    if (overlay) {
      overlay.remove();
    }

    if (this.originalContentMap.size === 0) return;

    for (const [el, originalHtml] of this.originalContentMap.entries()) {
      el.innerHTML = originalHtml;
      el.classList.remove('dr-simplified-content');
    }

    document.querySelectorAll('.dr-simplified-selection').forEach((mark) => {
      const parent = mark.parentNode;
      if (parent) {
        while (mark.firstChild) {
          parent.insertBefore(mark.firstChild, mark);
        }
        parent.removeChild(mark);
        parent.normalize();
      }
    });

    this.currentViewMode = 'original';
  }

  /**
   * Complete reset of all simplifier state memory.
   */
  public reset(): void {
    this.restoreOriginal();
    this.originalContentMap.clear();
    this.simplifiedContentMap.clear();
    this.currentViewMode = 'original';
    this.status = 'idle';
    this.lastError = null;
  }
}
