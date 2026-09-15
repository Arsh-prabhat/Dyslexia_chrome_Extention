import React from 'react';
import { FontFamily } from '../../shared/types';
import { FONT_OPTIONS } from '../../shared/constants';

interface FontSelectorProps {
  currentFont: FontFamily;
  onChangeFont: (font: FontFamily) => void;
}

export const FontSelector: React.FC<FontSelectorProps> = ({ currentFont, onChangeFont }) => {
  return (
    <section className="dr-section" aria-labelledby="font-heading">
      <h2 id="font-heading" className="dr-section-title">
        Reading Style
      </h2>
      <div className="dr-btn-group" role="group" aria-label="Font selection">
        {FONT_OPTIONS.map((font) => (
          <button
            key={font.id}
            type="button"
            className={`dr-btn ${currentFont === font.id ? 'active' : ''}`}
            onClick={() => onChangeFont(font.id as FontFamily)}
            aria-pressed={currentFont === font.id}
            style={{ fontFamily: font.fontFamily }}
          >
            {font.label}
          </button>
        ))}
      </div>
    </section>
  );
};
