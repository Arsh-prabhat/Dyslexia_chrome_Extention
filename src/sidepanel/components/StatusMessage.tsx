import React from 'react';

interface StatusMessageProps {
  isRestrictedPage: boolean;
  pageTitle?: string;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ isRestrictedPage, pageTitle }) => {
  if (isRestrictedPage) {
    return (
      <div className="dr-status-box dr-status-warning" role="alert">
        <div>
          <strong style={{ display: 'block' }}>Restricted Webpage</strong>
          <span style={{ fontSize: 12 }}>
            Chrome extensions cannot run on internal pages like <code>chrome://</code>, <code>edge://</code>, or the Chrome Web Store. Please open a standard website to use Dyslexia Reader.
          </span>
        </div>
      </div>
    );
  }

  return null;
};
