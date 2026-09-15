import { isRestrictedUrl } from '../shared/messages';

console.log('[DyslexiaReader] Background service worker starting...');

// Enable side panel toggle on extension action click
if (typeof chrome !== 'undefined' && chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
  chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error('[DyslexiaReader] Failed to set side panel behavior:', error));
}

// Add right-click context menu item for selected text simplification
if (typeof chrome !== 'undefined' && chrome.contextMenus) {
  chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: 'simplify-selection',
        title: '✨ Simplify Selected Text with Dyslexia Reader',
        contexts: ['selection']
      });
    });
  });

  chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'simplify-selection' && tab?.id) {
      chrome.tabs.sendMessage(tab.id, {
        type: 'SIMPLIFY_SELECTION',
        payload: { selectedText: info.selectionText }
      });
    }
  });
}

// Listen for tab updates to handle navigation events
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (changeInfo.status === 'complete' && tab.url && !isRestrictedUrl(tab.url)) {
    chrome.runtime.sendMessage({
      type: 'PAGE_STATE_CHANGED',
      payload: { tabId, url: tab.url, status: 'complete' }
    }).catch(() => {
      // Side panel might not be open, safe to ignore
    });
  }
});

// Relay messages between components if needed
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'GET_ACTIVE_TAB') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      const activeTab = tabs[0] || null;
      sendResponse({ tab: activeTab, isRestricted: activeTab?.url ? isRestrictedUrl(activeTab.url) : false });
    });
    return true; // Keep response channel open async
  }
});
