import { describe, it, expect } from 'vitest';
import { isRestrictedUrl } from '../src/shared/messages';

describe('Message Helpers', () => {
  it('should identify restricted Chrome and internal URLs', () => {
    expect(isRestrictedUrl('chrome://extensions')).toBe(true);
    expect(isRestrictedUrl('chrome-extension://abcdef/sidepanel.html')).toBe(true);
    expect(isRestrictedUrl('edge://settings')).toBe(true);
    expect(isRestrictedUrl('about:blank')).toBe(true);
    expect(isRestrictedUrl('https://chrome.google.com/webstore/detail')).toBe(true);
  });

  it('should allow normal website URLs', () => {
    expect(isRestrictedUrl('https://en.wikipedia.org/wiki/Dyslexia')).toBe(false);
    expect(isRestrictedUrl('https://news.ycombinator.com')).toBe(false);
    expect(isRestrictedUrl('http://localhost:3000')).toBe(false);
  });
});
