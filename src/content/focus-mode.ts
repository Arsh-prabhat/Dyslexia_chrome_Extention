import { FocusUnit } from '../shared/types';
import { TextExtractor } from './text-extractor';

export interface ReadingUnit {
  text: string;
  element: HTMLElement;
  textNode: Text;
  startOffset: number;
  endOffset: number;
  unitType: FocusUnit;
}

export class FocusModeManager {
  private textExtractor: TextExtractor;
  private readingUnits: ReadingUnit[] = [];
  private currentIndex: number = -1;
  private isActive: boolean = false;
  private currentUnitType: FocusUnit = 'sentence';
  private currentHighlightMark: HTMLElement | null = null;
  private observer: MutationObserver | null = null;
  private processedNodes = new WeakSet<Node>();

  constructor() {
    this.textExtractor = new TextExtractor();
  }

  /**
   * Enables Focus Mode on the page with specified unit type (word/sentence/paragraph).
   */
  public enable(unitType: FocusUnit = 'sentence'): void {
    this.currentUnitType = unitType;
    this.isActive = true;
    this.buildReadingSequence(unitType);
    this.setupMutationObserver();

    if (this.readingUnits.length > 0 && this.currentIndex === -1) {
      this.highlightIndex(0);
    }
  }

  /**
   * Disables Focus Mode and cleans up any active DOM highlights.
   */
  public disable(): void {
    this.removeCurrentHighlight();
    this.readingUnits = [];
    this.currentIndex = -1;
    this.isActive = false;

    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
  }

  public setFocusUnit(unitType: FocusUnit): void {
    const wasActive = this.isActive;
    this.disable();
    if (wasActive) {
      this.enable(unitType);
    }
  }

  /**
   * Builds the sequence of readable units (word, sentence, paragraph) from page text nodes.
   */
  public buildReadingSequence(unitType: FocusUnit): ReadingUnit[] {
    const elements = this.textExtractor.getReadableElements();
    const units: ReadingUnit[] = [];

    for (const el of elements) {
      const textNodes = this.getTextNodes(el);

      for (const textNode of textNodes) {
        const text = textNode.nodeValue || '';
        if (!text.trim()) continue;

        if (unitType === 'paragraph') {
          units.push({
            text: text.trim(),
            element: el,
            textNode,
            startOffset: 0,
            endOffset: text.length,
            unitType
          });
        } else if (unitType === 'sentence') {
          // Split by sentence ending punctuation (. ! ?)
          const sentenceRegex = /[^.!?]+[.!?]+(?:\s|$)|[^.!?]+$/g;
          let match: RegExpExecArray | null;

          while ((match = sentenceRegex.exec(text)) !== null) {
            const sentenceText = match[0].trim();
            if (sentenceText.length > 0) {
              units.push({
                text: sentenceText,
                element: el,
                textNode,
                startOffset: match.index,
                endOffset: match.index + match[0].length,
                unitType
              });
            }
          }
        } else if (unitType === 'word') {
          // Split by words
          const wordRegex = /\b[\w'-]+\b/g;
          let match: RegExpExecArray | null;

          while ((match = wordRegex.exec(text)) !== null) {
            const wordText = match[0];
            if (wordText.length > 0) {
              units.push({
                text: wordText,
                element: el,
                textNode,
                startOffset: match.index,
                endOffset: match.index + match[0].length,
                unitType
              });
            }
          }
        }
      }
    }

    this.readingUnits = units;
    return units;
  }

  /**
   * Highlights the reading unit at the given index.
   */
  public highlightIndex(index: number): ReadingUnit | null {
    if (index < 0 || index >= this.readingUnits.length) {
      return null;
    }

    this.removeCurrentHighlight();
    this.currentIndex = index;
    const unit = this.readingUnits[index];

    try {
      // Create DOM Range to surround target text
      const range = document.createRange();
      range.setStart(unit.textNode, Math.min(unit.startOffset, unit.textNode.length));
      range.setEnd(unit.textNode, Math.min(unit.endOffset, unit.textNode.length));

      const mark = document.createElement('mark');
      mark.className = 'dr-focus-highlight';
      range.surroundContents(mark);

      this.currentHighlightMark = mark;

      // Scroll element smoothly into view if needed
      mark.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    } catch (e) {
      // Fallback if node structure shifted
      console.warn('[DyslexiaReader] Focus highlight range error:', e);
      unit.element.classList.add('dr-focus-active-container');
      unit.element.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }

    return unit;
  }

  public nextUnit(): ReadingUnit | null {
    if (this.currentIndex < this.readingUnits.length - 1) {
      return this.highlightIndex(this.currentIndex + 1);
    }
    return null;
  }

  public previousUnit(): ReadingUnit | null {
    if (this.currentIndex > 0) {
      return this.highlightIndex(this.currentIndex - 1);
    }
    return null;
  }

  public getCurrentUnit(): ReadingUnit | null {
    if (this.currentIndex >= 0 && this.currentIndex < this.readingUnits.length) {
      return this.readingUnits[this.currentIndex];
    }
    return null;
  }

  public getCurrentIndex(): number {
    return this.currentIndex;
  }

  public getTotalUnits(): number {
    return this.readingUnits.length;
  }

  public getIsActive(): boolean {
    return this.isActive;
  }

  /**
   * Removes current highlight element and restores original DOM node structure.
   */
  private removeCurrentHighlight(): void {
    if (this.currentHighlightMark && this.currentHighlightMark.parentNode) {
      const parent = this.currentHighlightMark.parentNode;
      while (this.currentHighlightMark.firstChild) {
        parent.insertBefore(this.currentHighlightMark.firstChild, this.currentHighlightMark);
      }
      parent.removeChild(this.currentHighlightMark);
      parent.normalize(); // Merge adjacent text nodes
      this.currentHighlightMark = null;
    }

    // Remove active container classes
    document.querySelectorAll('.dr-focus-active-container').forEach((el) => {
      el.classList.remove('dr-focus-active-container');
    });
  }

  private getTextNodes(node: Node): Text[] {
    const textNodes: Text[] = [];
    const walker = document.createTreeWalker(node, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => {
        if (!n.nodeValue || !n.nodeValue.trim()) return NodeFilter.FILTER_REJECT;
        if (n.parentElement && this.textExtractor.isExcludedElement(n.parentElement)) {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let curr = walker.nextNode();
    while (curr) {
      textNodes.push(curr as Text);
      curr = walker.nextNode();
    }
    return textNodes;
  }

  private setupMutationObserver(): void {
    if (this.observer) return;

    this.observer = new MutationObserver((mutations) => {
      let hasNewReadable = false;
      for (const mut of mutations) {
        if (mut.addedNodes.length > 0) {
          for (const added of Array.from(mut.addedNodes)) {
            if (added.nodeType === Node.ELEMENT_NODE && !this.processedNodes.has(added)) {
              this.processedNodes.add(added);
              hasNewReadable = true;
            }
          }
        }
      }
      if (hasNewReadable && this.isActive) {
        // Rebuild sequence without resetting active reading index
        const currIndex = this.currentIndex;
        this.buildReadingSequence(this.currentUnitType);
        if (currIndex >= 0 && currIndex < this.readingUnits.length) {
          this.currentIndex = currIndex;
        }
      }
    });

    this.observer.observe(document.body, { childList: true, subtree: true });
  }
}
