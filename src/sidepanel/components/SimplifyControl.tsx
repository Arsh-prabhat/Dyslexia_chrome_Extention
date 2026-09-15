import React from 'react';
import { SimplifyStatus } from '../../shared/types';

interface SimplifyControlProps {
  status: SimplifyStatus;
  error: string | null;
  onSimplifySelection: () => void;
  onSimplifyFullPage: () => void;
}

export const SimplifyControl: React.FC<SimplifyControlProps> = ({
  status,
  error,
  onSimplifySelection,
  onSimplifyFullPage
}) => {
  const isSimplifying = status === 'simplifying' || status === 'extracting';

  return (
    <section className="dr-section" aria-labelledby="simplify-heading">
      <h2 id="simplify-heading" className="dr-section-title">
        Make Text Easier
      </h2>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        <button
          type="button"
          className="dr-btn dr-btn-primary"
          onClick={onSimplifySelection}
          disabled={isSimplifying}
          aria-busy={isSimplifying}
          style={{ width: '100%', minHeight: 44, fontSize: 14 }}
          title="Highlight any text on the page first, or click to simplify selection"
        >
          {isSimplifying ? '✨ Simplifying Selection...' : '✂️ Simplify Selection'}
        </button>

        <button
          type="button"
          className="dr-btn"
          onClick={onSimplifyFullPage}
          disabled={isSimplifying}
          aria-busy={isSimplifying}
          style={{ width: '100%', minHeight: 40, fontSize: 13 }}
        >
          {isSimplifying ? '🔍 Extracting Page...' : '📄 Simplify Full Page'}
        </button>
      </div>

      <p style={{ fontSize: 11, color: 'var(--dr-text-muted)', margin: '2px 0 0 0' }}>
        💡 <strong>Tip:</strong> Highlight any sentence or paragraph with your mouse, then click <em>Simplify Selection</em> (or right-click) to save API costs & simplify instantly!
      </p>

      {status === 'success' && (
        <div className="dr-status-box dr-status-info" role="status" aria-live="polite">
          <span>✅ Text simplified for easier reading!</span>
        </div>
      )}

      {status === 'error' && (
        <div className="dr-status-box dr-status-error" role="alert">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, width: '100%' }}>
            <span>⚠️ {error || "Couldn't simplify this page. Please try again."}</span>
            <button
              type="button"
              className="dr-btn"
              onClick={onSimplifySelection}
              style={{ marginTop: 4, alignSelf: 'flex-start', minHeight: 36, padding: '4px 10px', fontSize: 12 }}
            >
              🔄 Retry
            </button>
          </div>
        </div>
      )}
    </section>
  );
};
