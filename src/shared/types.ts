export type FontFamily = 'original' | 'opendyslexic' | 'lexend';

export type FocusUnit = 'word' | 'sentence' | 'paragraph';

export type ReadingSpeed = 0.5 | 0.75 | 1 | 1.25 | 1.5 | 2;

export interface DyslexiaReaderSettings {
  fontFamily: FontFamily;
  fontSize: number; // 12px to 32px
  lineHeight: number; // 1.2 to 2.5
  letterSpacing: number; // 0px to 4px
  wordSpacing: number; // 0px to 8px
  focusMode: boolean;
  focusUnit: FocusUnit;
  readingSpeed: ReadingSpeed;
  simplificationEnabled: boolean;
  backendApiUrl: string;
}

export type SimplifyStatus = 'idle' | 'extracting' | 'simplifying' | 'success' | 'error';

export interface PageState {
  isEnabled: boolean;
  focusModeActive: boolean;
  currentReadingIndex: number;
  totalReadingUnits: number;
  isReading: boolean;
  isPaused: boolean;
  hasSimplifiedText: boolean;
  currentViewMode: 'original' | 'simplified';
  simplifyStatus: SimplifyStatus;
  simplifyError: string | null;
  isRestrictedPage: boolean;
  pageTitle: string;
}

export type MessageType =
  | 'GET_SETTINGS'
  | 'APPLY_SETTINGS'
  | 'ENABLE_FOCUS_MODE'
  | 'DISABLE_FOCUS_MODE'
  | 'SET_FOCUS_UNIT'
  | 'GET_PAGE_TEXT'
  | 'SIMPLIFY_TEXT'
  | 'RESTORE_ORIGINAL'
  | 'SHOW_SIMPLIFIED'
  | 'START_READING'
  | 'PAUSE_READING'
  | 'RESUME_READING'
  | 'STOP_READING'
  | 'NEXT_READING_UNIT'
  | 'PREVIOUS_READING_UNIT'
  | 'SET_READING_SPEED'
  | 'RESET_PAGE'
  | 'GET_PAGE_STATE'
  | 'PAGE_STATE_CHANGED'
  | 'TTS_STATE_CHANGED';

export interface ExtensionMessage {
  type: MessageType;
  payload?: any;
}

export interface SimplifyRequestPayload {
  text: string;
  language?: string;
}

export interface SimplifyResponsePayload {
  simplifiedText: string;
  chunksProcessed?: number;
  error?: string;
}
