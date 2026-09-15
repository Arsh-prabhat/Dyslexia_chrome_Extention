import { describe, it, expect, beforeEach } from 'vitest';
import { TextExtractor } from '../src/content/text-extractor';

describe('TextExtractor', () => {
  let extractor: TextExtractor;

  beforeEach(() => {
    extractor = new TextExtractor();
  });

  it('should exclude script, style, SVG, and button elements', () => {
    const scriptEl = document.createElement('script');
    const buttonEl = document.createElement('button');
    const pEl = document.createElement('p');

    expect(extractor.isExcludedElement(scriptEl)).toBe(true);
    expect(extractor.isExcludedElement(buttonEl)).toBe(true);
    expect(extractor.isExcludedElement(pEl)).toBe(false);
  });

  it('should chunk large text while preserving paragraph boundaries', () => {
    const paragraph1 = 'A'.repeat(2000);
    const paragraph2 = 'B'.repeat(2000);
    const fullText = `${paragraph1}\n\n${paragraph2}`;

    const chunks = extractor.chunkText(fullText, 2500);

    expect(chunks.length).toBe(2);
    expect(chunks[0]).toBe(paragraph1);
    expect(chunks[1]).toBe(paragraph2);
  });

  it('should handle small text without unnecessary chunking', () => {
    const shortText = 'This is a short article paragraph for testing.';
    const chunks = extractor.chunkText(shortText, 3000);

    expect(chunks.length).toBe(1);
    expect(chunks[0]).toBe(shortText);
  });
});
