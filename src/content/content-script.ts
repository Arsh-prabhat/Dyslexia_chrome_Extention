import { loadSettings } from '../shared/storage';
import { ExtensionMessage, PageState, DyslexiaReaderSettings } from '../shared/types';
import { AccessibilityEngine } from './accessibility-engine';
import { FocusModeManager } from './focus-mode';
import { SpeechEngine } from './speech-engine';
import { SimplifierManager } from './simplifier';

console.log('[DyslexiaReader] Content script initialized on:', window.location.href);

const accessibilityEngine = new AccessibilityEngine();
const focusManager = new FocusModeManager();
const speechEngine = new SpeechEngine(focusManager);
const simplifierManager = new SimplifierManager();

let currentSettings: DyslexiaReaderSettings | null = null;

// Initialize automatically on load
init();

async function init() {
  currentSettings = await loadSettings();
  if (currentSettings) {
    accessibilityEngine.applySettings(currentSettings);
  }
}

function getPageState(): PageState {
  return {
    isEnabled: accessibilityEngine.getIsActive(),
    focusModeActive: focusManager.getIsActive(),
    currentReadingIndex: focusManager.getCurrentIndex(),
    totalReadingUnits: focusManager.getTotalUnits(),
    isReading: false,
    isPaused: false,
    hasSimplifiedText: simplifierManager.hasSimplifiedText(),
    currentViewMode: simplifierManager.getCurrentViewMode(),
    simplifyStatus: simplifierManager.getStatus(),
    simplifyError: simplifierManager.getLastError(),
    isRestrictedPage: false,
    pageTitle: document.title || 'Webpage'
  };
}

// Listen for messages from side panel or background service worker
if (typeof chrome !== 'undefined' && chrome.runtime && chrome.runtime.onMessage) {
  chrome.runtime.onMessage.addListener((message: ExtensionMessage, sender, sendResponse) => {
    handleMessage(message).then((response) => {
      sendResponse(response);
    });
    return true; // Keep response channel open async
  });
}

async function handleMessage(message: ExtensionMessage): Promise<any> {
  switch (message.type) {
    case 'GET_PAGE_STATE':
      return getPageState();

    case 'APPLY_SETTINGS':
      if (message.payload) {
        currentSettings = message.payload;
        accessibilityEngine.applySettings(message.payload);
        speechEngine.setSpeed(message.payload.readingSpeed);
      }
      return getPageState();

    case 'ENABLE_FOCUS_MODE':
      const unit = message.payload?.focusUnit || currentSettings?.focusUnit || 'sentence';
      focusManager.enable(unit);
      return getPageState();

    case 'DISABLE_FOCUS_MODE':
      speechEngine.stopReading();
      focusManager.disable();
      return getPageState();

    case 'SET_FOCUS_UNIT':
      if (message.payload?.focusUnit) {
        focusManager.setFocusUnit(message.payload.focusUnit);
      }
      return getPageState();

    case 'START_READING':
      speechEngine.startReading();
      return getPageState();

    case 'PAUSE_READING':
      speechEngine.pauseReading();
      return getPageState();

    case 'STOP_READING':
      speechEngine.stopReading();
      return getPageState();

    case 'NEXT_READING_UNIT':
      speechEngine.nextUnit();
      return getPageState();

    case 'PREVIOUS_READING_UNIT':
      speechEngine.previousUnit();
      return getPageState();

    case 'SET_READING_SPEED':
      if (message.payload?.speed) {
        speechEngine.setSpeed(message.payload.speed);
      }
      return getPageState();

    case 'SIMPLIFY_TEXT':
      const backendUrl = message.payload?.backendApiUrl || currentSettings?.backendApiUrl;
      const success = await simplifierManager.simplifyPage(backendUrl);
      return { ...getPageState(), success };

    case 'SHOW_SIMPLIFIED':
      simplifierManager.showSimplified();
      return getPageState();

    case 'RESTORE_ORIGINAL':
      simplifierManager.restoreOriginal();
      return getPageState();

    case 'RESET_PAGE':
      speechEngine.stopReading();
      focusManager.disable();
      simplifierManager.reset();
      accessibilityEngine.reset();
      return getPageState();

    default:
      return getPageState();
  }
}
