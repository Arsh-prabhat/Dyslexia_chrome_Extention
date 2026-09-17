import React from 'react';

interface StatusMessageProps {
  isRestrictedPage: boolean;
  pageTitle?: string;
  isPdf?: boolean;
}

export const StatusMessage: React.FC<StatusMessageProps> = ({ isRestrictedPage, pageTitle, isPdf }) => {
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

  const isPdfDocument = isPdf || pageTitle?.toLowerCase().endsWith('.pdf');

  if (isPdfDocument) {
    return (
      <div className="dr-status-box dr-status-info" role="status">
        <div>
          <strong style={{ display: 'block' }}>📄 PDF Document Guidance</strong>
          <span style={{ fontSize: 12, display: 'block', marginTop: 2 }}>
            Chrome renders PDFs inside a canvas viewer. To simplify text in a PDF, <strong>highlight text with your mouse</strong> and click <strong>✂️ Simplify Selection</strong>!
          </span>
          <span style={{ fontSize: 11, color: 'var(--dr-text-muted)', display: 'block', marginTop: 4 }}>
            💡 <em>For local PDFs (file://), make sure "Allow access to file URLs" is turned on in chrome://extensions settings.</em>
          </span>
        </div>
      </div>
    );
  }

  return null;
};
