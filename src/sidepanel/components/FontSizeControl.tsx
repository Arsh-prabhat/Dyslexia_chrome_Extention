import React from 'react';
import { MIN_FONT_SIZE, MAX_FONT_SIZE } from '../../shared/constants';

interface FontSizeControlProps {
  fontSize: number;
  onChangeFontSize: (size: number) => void;
}

export const FontSizeControl: React.FC<FontSizeControlProps> = ({ fontSize, onChangeFontSize }) => {
  const handleDecrease = () => {
    if (fontSize > MIN_FONT_SIZE) {
      onChangeFontSize(fontSize - 1);
    }
  };

  const handleIncrease = () => {
    if (fontSize < MAX_FONT_SIZE) {
      onChangeFontSize(fontSize + 1);
    }
  };

  return (
    <section className="dr-section" aria-labelledby="text-size-heading">
      <h2 id="text-size-heading" className="dr-section-title">
        Text Size
      </h2>
      <div className="dr-slider-group">
        <div className="dr-slider-header">
          <label htmlFor="font-size-slider">Font Size</label>
          <span className="dr-slider-value">{fontSize}px</span>
        </div>
        <div className="dr-stepper-row">
          <button
            type="button"
            className="dr-btn dr-stepper-btn"
            onClick={handleDecrease}
            disabled={fontSize <= MIN_FONT_SIZE}
            aria-label="Decrease font size"
          >
            -
          </button>
          <input
            id="font-size-slider"
            type="range"
            min={MIN_FONT_SIZE}
            max={MAX_FONT_SIZE}
            value={fontSize}
            onChange={(e) => onChangeFontSize(Number(e.target.value))}
            aria-valuemin={MIN_FONT_SIZE}
            aria-valuemax={MAX_FONT_SIZE}
            aria-valuenow={fontSize}
            aria-label="Font size slider"
          />
          <button
            type="button"
            className="dr-btn dr-stepper-btn"
            onClick={handleIncrease}
            disabled={fontSize >= MAX_FONT_SIZE}
            aria-label="Increase font size"
          >
            +
          </button>
        </div>
      </div>
    </section>
  );
};
