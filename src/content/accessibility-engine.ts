import { DyslexiaReaderSettings } from '../shared/types';
import { FONT_OPTIONS } from '../shared/constants';
import { injectStyles, removeStyles } from './styles';
import { TextExtractor } from './text-extractor';

export class AccessibilityEngine {
  private textExtractor: TextExtractor;
  private isEnabled: boolean = false;

  constructor() {
    this.textExtractor = new TextExtractor();
  }

  /**
   * Applies user settings to the current webpage typography.
   */
  public applySettings(settings: DyslexiaReaderSettings): void {
    injectStyles();

    const htmlEl = document.documentElement;
    htmlEl.classList.add('dyslexia-reader-enabled');

    // Map font family ID to CSS font stack
    const fontOpt = FONT_OPTIONS.find((f) => f.id === settings.fontFamily);
    const fontFamilyCss = fontOpt ? fontOpt.fontFamily : 'inherit';

    htmlEl.style.setProperty('--dr-font-family', fontFamilyCss);
    htmlEl.style.setProperty('--dr-font-size', `${settings.fontSize}px`);
    htmlEl.style.setProperty('--dr-line-height', `${settings.lineHeight}`);
    htmlEl.style.setProperty('--dr-letter-spacing', `${settings.letterSpacing}px`);
    htmlEl.style.setProperty('--dr-word-spacing', `${settings.wordSpacing}px`);

    // Tag readable elements with helper class
    this.markReadableElements();

    this.isEnabled = true;
  }

  /**
   * Scans document for readable text elements and adds dr-readable-text class.
   */
  public markReadableElements(): void {
    const elements = this.textExtractor.getReadableElements();
    for (const el of elements) {
      if (!el.classList.contains('dr-readable-text')) {
        el.classList.add('dr-readable-text');
      }
    }
  }

  /**
   * Disables typography engine and restores page to original appearance.
   */
  public reset(): void {
    const htmlEl = document.documentElement;
    htmlEl.classList.remove('dyslexia-reader-enabled');

    htmlEl.style.removeProperty('--dr-font-family');
    htmlEl.style.removeProperty('--dr-font-size');
    htmlEl.style.removeProperty('--dr-line-height');
    htmlEl.style.removeProperty('--dr-letter-spacing');
    htmlEl.style.removeProperty('--dr-word-spacing');

    const marked = document.querySelectorAll('.dr-readable-text');
    marked.forEach((el) => el.classList.remove('dr-readable-text'));

    removeStyles();
    this.isEnabled = false;
  }

  public getIsActive(): boolean {
    return this.isEnabled;
  }
}
