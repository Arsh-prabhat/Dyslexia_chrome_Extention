import React from 'react';

export const Header: React.FC = () => {
  return (
    <header className="dr-header" role="banner">
      <h1 className="dr-header-title">
        <span aria-hidden="true">📖</span> Dyslexia Reader
      </h1>
      <p className="dr-header-subtitle">Make this page easier to read</p>
    </header>
  );
};
