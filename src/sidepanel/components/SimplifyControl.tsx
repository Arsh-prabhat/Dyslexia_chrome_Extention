import React from 'react';
import { SimplifyStatus } from '../../shared/types';

interface SimplifyControlProps {
  status: SimplifyStatus;
  error: string | null;
  onSimplify: () => void;
}

export const SimplifyControl: React.FC<SimplifyControlProps> = ({ status, error, onSimplify }) => {
  const isSimplifying = status === 'simplifying' || status === 'extracting';

  return (
    <section className="dr-section" aria-labelledby="simplify-heading">
      <h2 id="simplify-heading" className="dr-section-title">
        Make Text Easier
      </h2>

      <button
        type="button"
        className="dr-btn dr-btn-primary"
        onClick={onSimplify}
        disabled={isSimplifying}
        aria-busy={isSimplifying}
        style={{ width: '100%', minHeight: 48, fontSize: 15 }}
      >
        {isSimplifying
          ? status === 'extracting'
            ? '🔍 Extracting Text...'
            : '✨ Simplifying with Gemini...'
          : '✨ Simplify Text'}
      </button>

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
              onClick={onSimplify}
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
