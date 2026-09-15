import React from 'react';

interface OriginalSimplifiedToggleProps {
  currentViewMode: 'original' | 'simplified';
  onSelectOriginal: () => void;
  onSelectSimplified: () => void;
}

export const OriginalSimplifiedToggle: React.FC<OriginalSimplifiedToggleProps> = ({
  currentViewMode,
  onSelectOriginal,
  onSelectSimplified
}) => {
  return (
    <div className="dr-btn-group" role="group" aria-label="Page content view mode toggle">
      <button
        type="button"
        className={`dr-btn ${currentViewMode === 'original' ? 'active' : ''}`}
        onClick={onSelectOriginal}
        aria-pressed={currentViewMode === 'original'}
      >
        📄 Original
      </button>
      <button
        type="button"
        className={`dr-btn ${currentViewMode === 'simplified' ? 'active' : ''}`}
        onClick={onSelectSimplified}
        aria-pressed={currentViewMode === 'simplified'}
      >
        ✨ Simplified
      </button>
    </div>
  );
};
