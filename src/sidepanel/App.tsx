import React, { useEffect, useState } from 'react';
import { DyslexiaReaderSettings, FontFamily, FocusUnit, PageState, ReadingSpeed } from '../shared/types';
import { DEFAULT_SETTINGS, DEFAULT_PAGE_STATE } from '../shared/constants';
import { loadSettings, saveSettings } from '../shared/storage';
import { sendToActiveTab } from '../shared/messages';
import { Header } from './components/Header';
import { FontSelector } from './components/FontSelector';
import { FontSizeControl } from './components/FontSizeControl';
import { SpacingControls } from './components/SpacingControls';
import { FocusModeControl } from './components/FocusModeControl';
import { ReadingControls } from './components/ReadingControls';
import { SimplifyControl } from './components/SimplifyControl';
import { OriginalSimplifiedToggle } from './components/OriginalSimplifiedToggle';
import { SettingsSection } from './components/SettingsSection';
import { StatusMessage } from './components/StatusMessage';

export const App: React.FC = () => {
  const [settings, setSettings] = useState<DyslexiaReaderSettings>(DEFAULT_SETTINGS);
  const [pageState, setPageState] = useState<PageState>(DEFAULT_PAGE_STATE);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Load persisted settings and fetch active page state on mount
    async function init() {
      const loaded = await loadSettings();
      setSettings(loaded);
      await fetchPageState(loaded);
      setIsLoading(false);
    }
    init();

    // Listen for tab activation changes
    if (typeof chrome !== 'undefined' && chrome.tabs && chrome.tabs.onActivated) {
      const listener = () => fetchPageState();
      chrome.tabs.onActivated.addListener(listener);
      return () => chrome.tabs.onActivated.removeListener(listener);
    }
  }, []);

  const fetchPageState = async (currentSet: DyslexiaReaderSettings = settings) => {
    const res = await sendToActiveTab<PageState>({ type: 'GET_PAGE_STATE' });
    if (res) {
      if ((res as any).isRestrictedPage) {
        setPageState((prev) => ({ ...prev, isRestrictedPage: true }));
      } else {
        setPageState((prev) => ({ ...prev, ...res, isRestrictedPage: false }));
        // Apply settings to page if needed
        await sendToActiveTab({ type: 'APPLY_SETTINGS', payload: currentSet });
      }
    }
  };

  const updateSetting = async (partial: Partial<DyslexiaReaderSettings>) => {
    const updated = await saveSettings(partial);
    setSettings(updated);
    if (!pageState.isRestrictedPage) {
      await sendToActiveTab({ type: 'APPLY_SETTINGS', payload: updated });
    }
  };

  const handleFontChange = (fontFamily: FontFamily) => {
    updateSetting({ fontFamily });
  };

  const handleFontSizeChange = (fontSize: number) => {
    updateSetting({ fontSize });
  };

  const handleLineHeightChange = (lineHeight: number) => {
    updateSetting({ lineHeight });
  };

  const handleLetterSpacingChange = (letterSpacing: number) => {
    updateSetting({ letterSpacing });
  };

  const handleWordSpacingChange = (wordSpacing: number) => {
    updateSetting({ wordSpacing });
  };

  const handleToggleFocusMode = async (enabled: boolean) => {
    await updateSetting({ focusMode: enabled });
    if (enabled) {
      const res = await sendToActiveTab<PageState>({
        type: 'ENABLE_FOCUS_MODE',
        payload: { focusUnit: settings.focusUnit }
      });
      if (res) setPageState(res);
    } else {
      const res = await sendToActiveTab<PageState>({ type: 'DISABLE_FOCUS_MODE' });
      if (res) setPageState(res);
    }
  };

  const handleChangeFocusUnit = async (focusUnit: FocusUnit) => {
    await updateSetting({ focusUnit });
    const res = await sendToActiveTab<PageState>({
      type: 'SET_FOCUS_UNIT',
      payload: { focusUnit }
    });
    if (res) setPageState(res);
  };

  const handlePlayPauseTTS = async () => {
    if (pageState.isReading) {
      const res = await sendToActiveTab<PageState>({ type: 'PAUSE_READING' });
      if (res) setPageState(res);
    } else {
      const res = await sendToActiveTab<PageState>({ type: 'START_READING' });
      if (res) setPageState(res);
    }
  };

  const handlePreviousTTS = async () => {
    const res = await sendToActiveTab<PageState>({ type: 'PREVIOUS_READING_UNIT' });
    if (res) setPageState(res);
  };

  const handleNextTTS = async () => {
    const res = await sendToActiveTab<PageState>({ type: 'NEXT_READING_UNIT' });
    if (res) setPageState(res);
  };

  const handleChangeSpeed = async (readingSpeed: ReadingSpeed) => {
    await updateSetting({ readingSpeed });
    const res = await sendToActiveTab<PageState>({
      type: 'SET_READING_SPEED',
      payload: { speed: readingSpeed }
    });
    if (res) setPageState(res);
  };

  const handleSimplifyText = async () => {
    setPageState((prev) => ({ ...prev, simplifyStatus: 'extracting', simplifyError: null }));
    const res = await sendToActiveTab<PageState>({
      type: 'SIMPLIFY_TEXT',
      payload: { backendApiUrl: settings.backendApiUrl }
    });
    if (res) {
      setPageState(res);
    }
  };

  const handleSelectOriginalView = async () => {
    const res = await sendToActiveTab<PageState>({ type: 'RESTORE_ORIGINAL' });
    if (res) setPageState(res);
  };

  const handleSelectSimplifiedView = async () => {
    const res = await sendToActiveTab<PageState>({ type: 'SHOW_SIMPLIFIED' });
    if (res) setPageState(res);
  };

  const handleResetPage = async () => {
    const res = await sendToActiveTab<PageState>({ type: 'RESET_PAGE' });
    if (res) setPageState(res);
    await updateSetting({ focusMode: false });
  };

  if (isLoading) {
    return (
      <div className="dr-panel-container" style={{ padding: 20, textAlign: 'center' }}>
        <p>Loading Dyslexia Reader...</p>
      </div>
    );
  }

  return (
    <div className="dr-panel-container">
      <Header />

      <StatusMessage isRestrictedPage={pageState.isRestrictedPage} pageTitle={pageState.pageTitle} />

      {!pageState.isRestrictedPage && (
        <>
          <FontSelector currentFont={settings.fontFamily} onChangeFont={handleFontChange} />

          <FontSizeControl fontSize={settings.fontSize} onChangeFontSize={handleFontSizeChange} />

          <SpacingControls
            lineHeight={settings.lineHeight}
            letterSpacing={settings.letterSpacing}
            wordSpacing={settings.wordSpacing}
            onChangeLineHeight={handleLineHeightChange}
            onChangeLetterSpacing={handleLetterSpacingChange}
            onChangeWordSpacing={handleWordSpacingChange}
          />

          <FocusModeControl
            focusMode={settings.focusMode}
            focusUnit={settings.focusUnit}
            onToggleFocusMode={handleToggleFocusMode}
            onChangeFocusUnit={handleChangeFocusUnit}
          />

          <ReadingControls
            isReading={pageState.isReading}
            isPaused={pageState.isPaused}
            readingSpeed={settings.readingSpeed}
            onPlayPause={handlePlayPauseTTS}
            onPrevious={handlePreviousTTS}
            onNext={handleNextTTS}
            onChangeSpeed={handleChangeSpeed}
          />

          <SimplifyControl
            status={pageState.simplifyStatus}
            error={pageState.simplifyError}
            onSimplify={handleSimplifyText}
          />

          {pageState.hasSimplifiedText && (
            <OriginalSimplifiedToggle
              currentViewMode={pageState.currentViewMode}
              onSelectOriginal={handleSelectOriginalView}
              onSelectSimplified={handleSelectSimplifiedView}
            />
          )}

          <SettingsSection
            backendApiUrl={settings.backendApiUrl}
            onUpdateBackendApiUrl={(url) => updateSetting({ backendApiUrl: url })}
            onResetPage={handleResetPage}
          />
        </>
      )}
    </div>
  );
};

export default App;
