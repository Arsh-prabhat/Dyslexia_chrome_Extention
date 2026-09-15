import React from 'react';
import {
  MIN_LINE_HEIGHT,
  MAX_LINE_HEIGHT,
  MIN_LETTER_SPACING,
  MAX_LETTER_SPACING,
  MIN_WORD_SPACING,
  MAX_WORD_SPACING
} from '../../shared/constants';

interface SpacingControlsProps {
  lineHeight: number;
  letterSpacing: number;
  wordSpacing: number;
  onChangeLineHeight: (val: number) => void;
  onChangeLetterSpacing: (val: number) => void;
  onChangeWordSpacing: (val: number) => void;
}

export const SpacingControls: React.FC<SpacingControlsProps> = ({
  lineHeight,
  letterSpacing,
  wordSpacing,
  onChangeLineHeight,
  onChangeLetterSpacing,
  onChangeWordSpacing
}) => {
  return (
    <section className="dr-section" aria-labelledby="spacing-heading">
      <h2 id="spacing-heading" className="dr-section-title">
        Spacing
      </h2>

      {/* Line Height */}
      <div className="dr-slider-group">
        <div className="dr-slider-header">
          <label htmlFor="line-height-slider">Line Height</label>
          <span className="dr-slider-value">{lineHeight.toFixed(1)}</span>
        </div>
        <input
          id="line-height-slider"
          type="range"
          min={MIN_LINE_HEIGHT}
          max={MAX_LINE_HEIGHT}
          step={0.1}
          value={lineHeight}
          onChange={(e) => onChangeLineHeight(Number(e.target.value))}
          aria-label="Line height slider"
        />
      </div>

      {/* Letter Spacing */}
      <div className="dr-slider-group">
        <div className="dr-slider-header">
          <label htmlFor="letter-spacing-slider">Letter Spacing</label>
          <span className="dr-slider-value">{letterSpacing}px</span>
        </div>
        <input
          id="letter-spacing-slider"
          type="range"
          min={MIN_LETTER_SPACING}
          max={MAX_LETTER_SPACING}
          step={0.5}
          value={letterSpacing}
          onChange={(e) => onChangeLetterSpacing(Number(e.target.value))}
          aria-label="Letter spacing slider"
        />
      </div>

      {/* Word Spacing */}
      <div className="dr-slider-group">
        <div className="dr-slider-header">
          <label htmlFor="word-spacing-slider">Word Spacing</label>
          <span className="dr-slider-value">{wordSpacing}px</span>
        </div>
        <input
          id="word-spacing-slider"
          type="range"
          min={MIN_WORD_SPACING}
          max={MAX_WORD_SPACING}
          step={1}
          value={wordSpacing}
          onChange={(e) => onChangeWordSpacing(Number(e.target.value))}
          aria-label="Word spacing slider"
        />
      </div>
    </section>
  );
};
