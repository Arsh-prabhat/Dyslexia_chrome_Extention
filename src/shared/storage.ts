import { DyslexiaReaderSettings } from './types';
import { DEFAULT_SETTINGS } from './constants';

export async function loadSettings(): Promise<DyslexiaReaderSettings> {
  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.get('dyslexia_reader_settings', (result) => {
        if (chrome.runtime.lastError || !result.dyslexia_reader_settings) {
          resolve({ ...DEFAULT_SETTINGS });
        } else {
          resolve({ ...DEFAULT_SETTINGS, ...result.dyslexia_reader_settings });
        }
      });
    } else {
      // Fallback for non-extension environment or tests
      try {
        const stored = localStorage.getItem('dyslexia_reader_settings');
        if (stored) {
          resolve({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) });
          return;
        }
      } catch (e) {
        // Ignore localStorage error
      }
      resolve({ ...DEFAULT_SETTINGS });
    }
  });
}

export async function saveSettings(settings: Partial<DyslexiaReaderSettings>): Promise<DyslexiaReaderSettings> {
  const current = await loadSettings();
  const updated: DyslexiaReaderSettings = { ...current, ...settings };

  return new Promise((resolve) => {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.sync) {
      chrome.storage.sync.set({ dyslexia_reader_settings: updated }, () => {
        resolve(updated);
      });
    } else {
      try {
        localStorage.setItem('dyslexia_reader_settings', JSON.stringify(updated));
      } catch (e) {
        // Ignore localStorage error
      }
      resolve(updated);
    }
  });
}

export function subscribeToSettingsChange(callback: (settings: DyslexiaReaderSettings) => void): () => void {
  if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.onChanged) {
    const listener = (changes: { [key: string]: chrome.storage.StorageChange }, areaName: string) => {
      if (areaName === 'sync' && changes.dyslexia_reader_settings) {
        const newSettings = changes.dyslexia_reader_settings.newValue;
        if (newSettings) {
          callback({ ...DEFAULT_SETTINGS, ...newSettings });
        }
      }
    };
    chrome.storage.onChanged.addListener(listener);
    return () => chrome.storage.onChanged.removeListener(listener);
  }
  return () => {};
}
