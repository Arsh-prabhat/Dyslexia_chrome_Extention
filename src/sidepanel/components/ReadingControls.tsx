import React from 'react';
import { ReadingSpeed } from '../../shared/types';
import { SPEED_OPTIONS } from '../../shared/constants';

interface ReadingControlsProps {
  isReading: boolean;
  isPaused: boolean;
  readingSpeed: ReadingSpeed;
  onPlayPause: () => void;
  onPrevious: () => void;
  onNext: () => void;
  onChangeSpeed: (speed: ReadingSpeed) => void;
}

export const ReadingControls: React.FC<ReadingControlsProps> = ({
  isReading,
  isPaused,
  readingSpeed,
  onPlayPause,
  onPrevious,
  onNext,
  onChangeSpeed
}) => {
  return (
    <section className="dr-section" aria-labelledby="reading-controls-heading">
      <h2 id="reading-controls-heading" className="dr-section-title">
        Reading Controls (TTS)
      </h2>

      <div className="dr-btn-group" role="group" aria-label="Text to speech playback controls">
        <button
          type="button"
          className="dr-btn"
          onClick={onPrevious}
          aria-label="Previous reading unit"
        >
          ⏮ Previous
        </button>
        <button
          type="button"
          className="dr-btn dr-btn-primary"
          onClick={onPlayPause}
          aria-label={isReading ? 'Pause reading' : 'Play reading'}
        >
          {isReading ? '⏸ Pause' : isPaused ? '▶ Resume' : '▶ Play'}
        </button>
        <button
          type="button"
          className="dr-btn"
          onClick={onNext}
          aria-label="Next reading unit"
        >
          Next ⏭
        </button>
      </div>

      <fieldset style={{ border: 'none', padding: 0, marginTop: 4 }}>
        <legend className="dr-slider-header" style={{ marginBottom: 6, fontSize: 13, fontWeight: 600 }}>
          Reading Speed
        </legend>
        <div className="dr-btn-group" role="radiogroup" aria-label="Reading speed options">
          {SPEED_OPTIONS.map((speed) => (
            <button
              key={speed}
              type="button"
              className={`dr-btn ${readingSpeed === speed ? 'active' : ''}`}
              onClick={() => onChangeSpeed(speed)}
              aria-checked={readingSpeed === speed}
              role="radio"
              style={{ minWidth: 44, padding: '4px 6px', fontSize: 12 }}
            >
              {speed}x
            </button>
          ))}
        </div>
      </fieldset>
    </section>
  );
};
