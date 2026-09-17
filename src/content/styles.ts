export const DYSLEXIA_READER_STYLE_ID = 'dyslexia-reader-styles';

export function injectStyles(): void {
  let styleEl = document.getElementById(DYSLEXIA_READER_STYLE_ID) as HTMLStyleElement;
  if (!styleEl) {
    styleEl = document.createElement('style');
    styleEl.id = DYSLEXIA_READER_STYLE_ID;
    (document.head || document.documentElement).appendChild(styleEl);
  }

  // Get extension URL for font assets if chrome.runtime is available
  const extensionUrl = typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.getURL
    ? chrome.runtime.getURL('')
    : '';

  styleEl.textContent = `
    /* Font definitions */
    @font-face {
      font-family: 'OpenDyslexic';
      src: url('${extensionUrl}fonts/OpenDyslexic/OpenDyslexic-Regular.otf') format('opentype'),
           url('${extensionUrl}fonts/OpenDyslexic/OpenDyslexic-Regular.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }

    @font-face {
      font-family: 'Lexend';
      src: url('${extensionUrl}fonts/Lexend/Lexend-Regular.ttf') format('truetype'),
           url('${extensionUrl}fonts/Lexend/Lexend-Regular.woff2') format('woff2');
      font-weight: normal;
      font-style: normal;
      font-display: swap;
    }

    /* Core typography layer applied directly to content elements when enabled */
    :root {
      --dr-font-family: inherit;
      --dr-font-size: 18px;
      --dr-line-height: 1.6;
      --dr-letter-spacing: 1px;
      --dr-word-spacing: 2px;
    }

    /* Target readable text content elements and nested spans/links directly on any webpage */
    html.dyslexia-reader-enabled p,
    html.dyslexia-reader-enabled p *,
    html.dyslexia-reader-enabled h1,
    html.dyslexia-reader-enabled h1 *,
    html.dyslexia-reader-enabled h2,
    html.dyslexia-reader-enabled h2 *,
    html.dyslexia-reader-enabled h3,
    html.dyslexia-reader-enabled h3 *,
    html.dyslexia-reader-enabled h4,
    html.dyslexia-reader-enabled h4 *,
    html.dyslexia-reader-enabled h5,
    html.dyslexia-reader-enabled h5 *,
    html.dyslexia-reader-enabled h6,
    html.dyslexia-reader-enabled h6 *,
    html.dyslexia-reader-enabled li,
    html.dyslexia-reader-enabled li *,
    html.dyslexia-reader-enabled dt,
    html.dyslexia-reader-enabled dd,
    html.dyslexia-reader-enabled blockquote,
    html.dyslexia-reader-enabled blockquote *,
    html.dyslexia-reader-enabled article p,
    html.dyslexia-reader-enabled article span,
    html.dyslexia-reader-enabled .entry-content p,
    html.dyslexia-reader-enabled .entry-content span,
    html.dyslexia-reader-enabled .post-content p,
    html.dyslexia-reader-enabled .post-content span,
    html.dyslexia-reader-enabled .dr-readable-text {
      font-family: var(--dr-font-family) !important;
      font-size: var(--dr-font-size) !important;
      line-height: var(--dr-line-height) !important;
      letter-spacing: var(--dr-letter-spacing) !important;
      word-spacing: var(--dr-word-spacing) !important;
    }

    /* Preserve interactive buttons, inputs, icons, and code blocks */
    html.dyslexia-reader-enabled code,
    html.dyslexia-reader-enabled pre,
    html.dyslexia-reader-enabled button,
    html.dyslexia-reader-enabled input,
    html.dyslexia-reader-enabled textarea,
    html.dyslexia-reader-enabled select,
    html.dyslexia-reader-enabled svg,
    html.dyslexia-reader-enabled svg * {
      font-size: initial;
      line-height: initial;
      letter-spacing: initial;
      word-spacing: initial;
    }

    /* Focus Mode Highlight Style: Clear, distinct, accessible pastel yellow with soft border */
    mark.dr-focus-highlight {
      background-color: #fff3a3 !important;
      color: #1a1a1a !important;
      border-radius: 4px !important;
      padding: 2px 4px !important;
      box-shadow: 0 0 0 2px #f59e0b !important;
      display: inline !important;
      transition: background-color 0.15s ease, box-shadow 0.15s ease !important;
    }

    /* High contrast mode for active focus element container */
    .dr-focus-active-container {
      outline: 2px dashed #2563eb !important;
      outline-offset: 4px !important;
      border-radius: 4px !important;
    }

    /* Simplified selection highlight badge */
    mark.dr-simplified-selection {
      background-color: #e0f2fe !important;
      color: #0369a1 !important;
      border: 1px solid #0284c7 !important;
      border-radius: 4px !important;
      padding: 2px 6px !important;
      font-weight: 500 !important;
      display: inline !important;
      box-shadow: 0 1px 3px rgba(0,0,0,0.1) !important;
    }

    /* Floating Simplified Card Overlay (For PDFs and documents) */
    .dr-floating-overlay {
      position: fixed !important;
      bottom: 24px !important;
      right: 24px !important;
      z-index: 2147483647 !important;
      max-width: 520px !important;
      width: calc(100vw - 48px) !important;
      max-height: 75vh !important;
      overflow-y: auto !important;
      font-family: var(--dr-font-family, OpenDyslexic, sans-serif) !important;
      animation: drSlideUp 0.3s ease-out !important;
    }

    .dr-overlay-card {
      background-color: #0f172a !important;
      color: #f8fafc !important;
      border: 2px solid #3b82f6 !important;
      border-radius: 12px !important;
      padding: 16px !important;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.4) !important;
    }

    .dr-overlay-header {
      display: flex !important;
      justify-content: space-between !important;
      align-items: center !important;
      border-bottom: 1px solid #334155 !important;
      padding-bottom: 10px !important;
      margin-bottom: 12px !important;
      font-weight: 700 !important;
      font-size: 15px !important;
      color: #60a5fa !important;
    }

    .dr-overlay-close {
      background: #1e293b !important;
      color: #f8fafc !important;
      border: 1px solid #475569 !important;
      border-radius: 6px !important;
      padding: 4px 10px !important;
      cursor: pointer !important;
      font-size: 12px !important;
    }

    .dr-overlay-body {
      font-size: var(--dr-font-size, 18px) !important;
      line-height: var(--dr-line-height, 1.6) !important;
      letter-spacing: var(--dr-letter-spacing, 1px) !important;
      word-spacing: var(--dr-word-spacing, 2px) !important;
    }

    @keyframes drSlideUp {
      from { transform: translateY(20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
  `;
}

export function removeStyles(): void {
  const styleEl = document.getElementById(DYSLEXIA_READER_STYLE_ID);
  if (styleEl && styleEl.parentNode) {
    styleEl.parentNode.removeChild(styleEl);
  }
}
