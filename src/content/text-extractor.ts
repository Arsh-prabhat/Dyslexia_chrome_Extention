const EXCLUDED_TAGS = new Set([
  'SCRIPT',
  'STYLE',
  'SVG',
  'CANVAS',
  'INPUT',
  'TEXTAREA',
  'SELECT',
  'BUTTON',
  'CODE',
  'PRE',
  'NOSCRIPT',
  'IFRAME',
  'OBJECT',
  'EMBED'
]);

export interface ReadableBlock {
  element: HTMLElement;
  text: string;
  tag: string;
}

export class TextExtractor {
  /**
   * Identifies and returns all readable HTML elements on the current webpage or PDF.
   */
  public getReadableElements(root: Element = document.body): HTMLElement[] {
    if (!root) return [];

    const elements: HTMLElement[] = [];
    const walker = document.createTreeWalker(
      root,
      NodeFilter.SHOW_ELEMENT,
      {
        acceptNode: (node: Node) => {
          const el = node as HTMLElement;
          if (this.isExcludedElement(el)) {
            return NodeFilter.FILTER_REJECT;
          }
          if (this.isReadableElement(el)) {
            return NodeFilter.FILTER_ACCEPT;
          }
          return NodeFilter.FILTER_SKIP;
        }
      }
    );

    let currentNode = walker.nextNode();
    while (currentNode) {
      elements.push(currentNode as HTMLElement);
      currentNode = walker.nextNode();
    }

    // PDF / Canvas Text Layer Fallback: If no standard HTML tags found (e.g. PDF viewer)
    if (elements.length === 0) {
      const pdfSpans = Array.from(
        document.querySelectorAll('.textLayer span, [role="document"] span, div.page span, embed[type="application/pdf"]')
      ) as HTMLElement[];

      if (pdfSpans.length > 0) {
        return pdfSpans.filter((el) => (el.innerText || el.textContent || '').trim().length > 2);
      }
    }

    return elements;
  }

  /**
   * Extracts clean, structured plain text from the webpage or PDF for AI processing.
   */
  public extractPageText(): { fullText: string; blocks: ReadableBlock[] } {
    const readableElements = this.getReadableElements();
    const blocks: ReadableBlock[] = [];
    const textParts: string[] = [];

    for (const el of readableElements) {
      const text = el.innerText ? el.innerText.trim() : el.textContent?.trim() || '';
      if (text.length > 0) {
        blocks.push({
          element: el,
          text,
          tag: el.tagName.toLowerCase()
        });
        textParts.push(text);
      }
    }

    // Fallback: If elements array was empty, extract plain body text (e.g. PDF canvas viewer)
    let fullText = textParts.join('\n\n');
    if (!fullText.trim() && typeof document !== 'undefined') {
      const bodyText = (document.body ? document.body.innerText : document.documentElement.innerText) || '';
      fullText = bodyText.trim();
    }

    return { fullText, blocks };
  }

  /**
   * Splits a long text string into safe chunks (e.g. ~3000 chars) preserving paragraph boundaries.
   */
  public chunkText(text: string, maxChunkLength: number = 3000): string[] {
    if (!text || text.length <= maxChunkLength) {
      return text ? [text] : [];
    }

    const paragraphs = text.split('\n\n');
    const chunks: string[] = [];
    let currentChunk = '';

    for (const para of paragraphs) {
      if ((currentChunk + '\n\n' + para).length > maxChunkLength) {
        if (currentChunk.trim().length > 0) {
          chunks.push(currentChunk.trim());
        }
        
        // If a single paragraph exceeds maxChunkLength, split by sentences
        if (para.length > maxChunkLength) {
          const sentences = para.match(/[^.!?]+[.!?]+(\s|$)/g) || [para];
          let sentenceChunk = '';
          for (const sentence of sentences) {
            if ((sentenceChunk + sentence).length > maxChunkLength) {
              if (sentenceChunk.trim().length > 0) {
                chunks.push(sentenceChunk.trim());
              }
              sentenceChunk = sentence;
            } else {
              sentenceChunk += sentence;
            }
          }
          if (sentenceChunk.trim().length > 0) {
            currentChunk = sentenceChunk;
          } else {
            currentChunk = '';
          }
        } else {
          currentChunk = para;
        }
      } else {
        currentChunk = currentChunk ? currentChunk + '\n\n' + para : para;
      }
    }

    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks;
  }

  /**
   * Checks whether an element should be excluded from typography & reading processing.
   */
  public isExcludedElement(el: HTMLElement): boolean {
    if (!el || !el.tagName) return true;

    const tagName = el.tagName.toUpperCase();
    if (EXCLUDED_TAGS.has(tagName)) return true;

    if (el.isContentEditable) return true;
    if (el.getAttribute('aria-hidden') === 'true') return true;
    if (el.classList.contains('dr-ignore')) return true;

    // Skip navigation menus, header bars, search widgets, and footers for extraction
    if (el.closest('nav, header, footer, .menu, .nav, .site-header, .header-wrap')) {
      return true;
    }

    // Check style visibility
    if (typeof window !== 'undefined') {
      const style = window.getComputedStyle(el);
      if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') {
        return true;
      }
    }

    return false;
  }

  /**
   * Determines if an element contains primary readable content.
   */
  private isReadableElement(el: HTMLElement): boolean {
    const tag = el.tagName.toUpperCase();
    const readableTags = new Set(['P', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'LI', 'DT', 'DD', 'BLOCKQUOTE', 'ARTICLE', 'SECTION', 'SPAN']);

    if (readableTags.has(tag)) {
      const text = el.innerText ? el.innerText.trim() : el.textContent?.trim() || '';
      return text.length > 2;
    }

    return false;
  }
}
