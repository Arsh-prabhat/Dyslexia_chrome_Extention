import { ExtensionMessage } from './types';

export async function sendToActiveTab<T = any>(message: ExtensionMessage): Promise<T | null> {
  if (typeof chrome === 'undefined' || !chrome.tabs) {
    console.warn('[DyslexiaReader] chrome.tabs unavailable for message:', message.type);
    return null;
  }

  try {
    const [activeTab] = await chrome.tabs.query({ active: true, currentWindow: true });
    if (!activeTab || !activeTab.id) {
      console.warn('[DyslexiaReader] No active tab found.');
      return null;
    }

    // Don't send messages to restricted chrome:// or edge:// pages
    if (activeTab.url && isRestrictedUrl(activeTab.url)) {
      return { isRestrictedPage: true } as unknown as T;
    }

    // Try sending message to content script
    const response = await sendMessagePromise<T>(activeTab.id, message);
    if (response !== null) {
      return response;
    }

    // If message failed (content script not injected yet), auto-inject content script programmatically
    if (chrome.scripting && chrome.scripting.executeScript) {
      try {
        await chrome.scripting.executeScript({
          target: { tabId: activeTab.id },
          files: ['content/content-script.js']
        });

        // Small delay for content script initialization
        await new Promise((r) => setTimeout(r, 100));

        // Retry sending message
        return await sendMessagePromise<T>(activeTab.id, message);
      } catch (injectionError) {
        console.warn('[DyslexiaReader] Script injection failed:', injectionError);
      }
    }

    return null;
  } catch (error) {
    console.error('[DyslexiaReader] Failed to send message to active tab:', error);
    return null;
  }
}

function sendMessagePromise<T>(tabId: number, message: ExtensionMessage): Promise<T | null> {
  return new Promise((resolve) => {
    chrome.tabs.sendMessage(tabId, message, (response) => {
      if (chrome.runtime.lastError) {
        resolve(null);
      } else {
        resolve(response);
      }
    });
  });
}

export function isRestrictedUrl(url: string): boolean {
  if (!url) return true;
  return (
    url.startsWith('chrome://') ||
    url.startsWith('chrome-extension://') ||
    url.startsWith('edge://') ||
    url.startsWith('about:') ||
    url.startsWith('view-source:') ||
    url.startsWith('https://chrome.google.com/webstore')
  );
}

export function sendRuntimeMessage<T = any>(message: ExtensionMessage): Promise<T | null> {
  if (typeof chrome === 'undefined' || !chrome.runtime) {
    return Promise.resolve(null);
  }

  return new Promise((resolve) => {
    chrome.runtime.sendMessage(message, (response) => {
      if (chrome.runtime.lastError) {
        resolve(null);
      } else {
        resolve(response);
      }
    });
  });
}
