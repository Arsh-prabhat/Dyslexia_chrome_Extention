import React, { useState } from 'react';

interface SettingsSectionProps {
  backendApiUrl: string;
  onUpdateBackendApiUrl: (url: string) => void;
  onResetPage: () => void;
}

export const SettingsSection: React.FC<SettingsSectionProps> = ({
  backendApiUrl,
  onUpdateBackendApiUrl,
  onResetPage
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [urlInput, setUrlInput] = useState(backendApiUrl);

  const handleSaveUrl = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateBackendApiUrl(urlInput.trim());
  };

  return (
    <section className="dr-section" aria-labelledby="settings-heading">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 id="settings-heading" className="dr-section-title">
          Settings & Actions
        </h2>
        <button
          type="button"
          className="dr-btn"
          onClick={() => setIsOpen(!isOpen)}
          aria-expanded={isOpen}
          style={{ minHeight: 36, padding: '4px 8px', fontSize: 12, flex: 'none' }}
        >
          {isOpen ? '▲ Hide Settings' : '⚙️ Options'}
        </button>
      </div>

      {isOpen && (
        <form onSubmit={handleSaveUrl} className="dr-slider-group" style={{ marginTop: 8 }}>
          <label htmlFor="backend-url-input" style={{ fontSize: 12, fontWeight: 600 }}>
            Gemini Backend Endpoint URL:
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            <input
              id="backend-url-input"
              type="url"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="http://localhost:3000/api/simplify"
              style={{
                flex: 1,
                padding: '6px 10px',
                borderRadius: 'var(--dr-radius)',
                border: '1px solid var(--dr-border-color)',
                backgroundColor: 'var(--dr-bg-primary)',
                color: 'var(--dr-text-main)',
                fontSize: 12
              }}
              required
            />
            <button type="submit" className="dr-btn dr-btn-primary" style={{ minHeight: 36, padding: '4px 10px', fontSize: 12 }}>
              Save
            </button>
          </div>
        </form>
      )}

      <button
        type="button"
        className="dr-btn"
        onClick={onResetPage}
        style={{ width: '100%', marginTop: 4, color: '#dc2626', borderColor: '#fca5a5' }}
        aria-label="Reset page presentation to default"
      >
        ↺ Reset Page
      </button>
    </section>
  );
};
