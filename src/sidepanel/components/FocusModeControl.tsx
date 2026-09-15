import React from 'react';
import { FocusUnit } from '../../shared/types';

interface FocusModeControlProps {
  focusMode: boolean;
  focusUnit: FocusUnit;
  onToggleFocusMode: (enabled: boolean) => void;
  onChangeFocusUnit: (unit: FocusUnit) => void;
}

export const FocusModeControl: React.FC<FocusModeControlProps> = ({
  focusMode,
  focusUnit,
  onToggleFocusMode,
  onChangeFocusUnit
}) => {
  return (
    <section className="dr-section" aria-labelledby="focus-mode-heading">
      <div className="dr-toggle-row">
        <h2 id="focus-mode-heading" className="dr-section-title">
          Focus Mode
        </h2>
        <label className="dr-switch" aria-label="Toggle focus mode">
          <input
            type="checkbox"
            checked={focusMode}
            onChange={(e) => onToggleFocusMode(e.target.checked)}
            aria-checked={focusMode}
          />
          <span className="dr-slider"></span>
        </label>
      </div>

      {focusMode && (
        <fieldset style={{ border: 'none', padding: 0, marginTop: 8 }}>
          <legend className="dr-slider-header" style={{ marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
            Focus Unit
          </legend>
          <div className="dr-btn-group" role="radiogroup" aria-label="Focus unit selection">
            {(['word', 'sentence', 'paragraph'] as FocusUnit[]).map((unit) => (
              <button
                key={unit}
                type="button"
                className={`dr-btn ${focusUnit === unit ? 'active' : ''}`}
                onClick={() => onChangeFocusUnit(unit)}
                aria-checked={focusUnit === unit}
                role="radio"
              >
                {unit.charAt(0).toUpperCase() + unit.slice(1)}
              </button>
            ))}
          </div>
        </fieldset>
      )}
    </section>
  );
};
