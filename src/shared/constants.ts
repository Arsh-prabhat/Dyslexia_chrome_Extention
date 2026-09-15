import { DyslexiaReaderSettings, PageState, ReadingSpeed } from './types';

export const DEFAULT_SETTINGS: DyslexiaReaderSettings = {
  fontFamily: 'opendyslexic',
  fontSize: 18,
  lineHeight: 1.6,
  letterSpacing: 1,
  wordSpacing: 2,
  focusMode: false,
  focusUnit: 'sentence',
  readingSpeed: 1,
  simplificationEnabled: false,
  backendApiUrl: 'http://localhost:3000/api/simplify'
};

export const DEFAULT_PAGE_STATE: PageState = {
  isEnabled: false,
  focusModeActive: false,
  currentReadingIndex: 0,
  totalReadingUnits: 0,
  isReading: false,
  isPaused: false,
  hasSimplifiedText: false,
  currentViewMode: 'original',
  simplifyStatus: 'idle',
  simplifyError: null,
  isRestrictedPage: false,
  pageTitle: ''
};

export const FONT_OPTIONS = [
  { id: 'original', label: 'Original', fontFamily: 'inherit' },
  { id: 'opendyslexic', label: 'OpenDyslexic', fontFamily: 'OpenDyslexic, sans-serif' },
  { id: 'lexend', label: 'Lexend', fontFamily: 'Lexend, sans-serif' }
] as const;

export const SPEED_OPTIONS: ReadingSpeed[] = [0.5, 0.75, 1, 1.25, 1.5, 2];

export const MIN_FONT_SIZE = 12;
export const MAX_FONT_SIZE = 32;

export const MIN_LINE_HEIGHT = 1.2;
export const MAX_LINE_HEIGHT = 2.5;

export const MIN_LETTER_SPACING = 0;
export const MAX_LETTER_SPACING = 4;

export const MIN_WORD_SPACING = 0;
export const MAX_WORD_SPACING = 8;
