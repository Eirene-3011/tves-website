import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';

/**
 * CSMFloatingWidget — floating Client Satisfaction Survey button on the homepage.
 * - Appears automatically on first load; dismisses for the session when closed (X).
 * - Minimize collapses it back to the small button without full dismissal.
 * - Reappears on a new session (sessionStorage, not localStorage).
 * - Shows a QR code for the survey link:
 *     1) uses an admin-uploaded qr_code_image if one exists, otherwise
 *     2) auto-generates a QR code from the csmLink URL itself.
 */
export default function CSMFloatingWidget() {
  const [csmLink, setCsmLink] = useState(null);
  const [qrImage, setQrImage] = useState(null);
  const [expanded, setExpanded] = useState(true);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    if (sessionStorage.getItem('csm_dismissed') === '1') {
      setDismissed(true);
      return;
    }
    api.get('/feedback').then(function (r) {
      const links = Array.isArray(r.data) ? r.data : [];
      const csm = links.find(function (l) { return l.type === 'csm_survey'; });
      const qr = links.find(function (l) { return l.type === 'qr_code_image'; });
      if (csm) setCsmLink(csm.url);
      if (qr) setQrImage(qr.url);
    }).catch(function () {});
  }, []);

  const handleDismiss = () => {
    sessionStorage.setItem('csm_dismissed', '1');
    setDismissed(true);
    setExpanded(false);
  };

  if (dismissed || !csmLink) {
    return null;
  }

  const qrSrc = qrImage
    ? getImageUrl(qrImage)
    : 'https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=8&data=' + encodeURIComponent(csmLink);

  return (
    <div className="csm-widget" role="complementary" aria-label="Client Satisfaction Survey">
      {expanded ? (
        <div className="csm-panel">
          <div className="csm-panel-header">
            <span className="csm-panel-title">Client Satisfaction Survey</span>
            <div style={{ display: 'flex', gap: 4 }}>
              <button
                className="csm-icon-btn"
                onClick={() => setExpanded(false)}
                title="Minimize"
                aria-label="Minimize survey widget"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <path d="M5 12h14" />
                </svg>
              </button>
              <button
                className="csm-icon-btn"
                onClick={handleDismiss}
                title="Close"
                aria-label="Dismiss survey widget for this session"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" width="16" height="16">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>

          <div className="csm-panel-body">
            <p className="csm-desc">Scan the QR code or tap below to answer our Client Satisfaction Survey.</p>
            <img
              src={qrSrc}
              alt="Scan to take the Client Satisfaction Survey"
              className="csm-qr"
              loading="lazy"
              onError={(e) => { e.target.style.display = 'none'; }}
            />
            <a href={csmLink} target="_blank" rel="noopener noreferrer" className="csm-link-btn">
              Take the Survey
            </a>
          </div>
        </div>
      ) : (
        <button
          className="csm-fab"
          onClick={() => setExpanded(true)}
          aria-label="Open Client Satisfaction Survey"
          title="Client Satisfaction Survey"
        >
          <svg viewBox="0 0 24 24" fill="currentColor" width="22" height="22">
            <path d="M14 2H6C4.9 2 4 2.9 4 4v16c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V8l-6-6zm-1 7V3.5L18.5 9H13zm-3 7H7v-2h3v2zm7 0h-5v-2h5v2zm0-4H7v-2h10v2z" />
          </svg>
          <span className="csm-fab-label">CSM</span>
        </button>
      )}

      <style>{`
        .csm-widget {
          position: fixed;
          bottom: 24px;
          right: 24px;
          z-index: 1000;
          font-family: var(--font-sans, 'Inter', sans-serif);
        }

        .csm-fab {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 3px;
          background: var(--blue-primary, #1565C0);
          color: var(--white, #fff);
          border: 2px solid var(--blue-primary, #1565C0);
          border-radius: var(--radius-md, 10px);
          padding: 10px 14px;
          cursor: pointer;
          box-shadow: var(--shadow-md, 0 10px 24px -8px rgba(21,101,192,0.35));
          transition: transform 0.18s var(--ease-out, ease), box-shadow 0.18s var(--ease-out, ease), background 0.18s var(--ease-out, ease);
        }
        .csm-fab:hover {
          background: var(--blue-dark, #0D47A1);
          border-color: var(--blue-dark, #0D47A1);
          transform: translateY(-2px);
          box-shadow: var(--shadow-blue, 0 10px 24px -6px rgba(21,101,192,0.32));
        }
        .csm-fab:focus-visible {
          outline: 2px solid var(--blue-primary, #1565C0);
          outline-offset: 2px;
        }
        .csm-fab-label {
          font-size: 0.65rem;
          font-weight: 700;
          letter-spacing: 0.06em;
        }

        .csm-panel {
          background: var(--white, #fff);
          border-radius: var(--radius-lg, 16px);
          box-shadow: var(--shadow-xl, 0 32px 64px -14px rgba(23,20,18,0.22));
          width: 260px;
          overflow: hidden;
          border: 1px solid var(--gray-200, #E6E4E2);
        }

        .csm-panel-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: linear-gradient(120deg, var(--blue-dark, #0D47A1), var(--blue-primary, #1565C0));
          color: var(--white, #fff);
          padding: 10px 14px;
        }
        .csm-panel-title {
          font-size: 0.78rem;
          font-weight: 700;
          letter-spacing: 0.01em;
        }

        .csm-icon-btn {
          background: rgba(255,255,255,0.16);
          border: none;
          border-radius: var(--radius-sm, 6px);
          color: var(--white, #fff);
          cursor: pointer;
          padding: 4px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.15s var(--ease-out, ease);
        }
        .csm-icon-btn:hover { background: rgba(255,255,255,0.3); }
        .csm-icon-btn:focus-visible {
          outline: 2px solid var(--white, #fff);
          outline-offset: 1px;
        }

        .csm-panel-body {
          padding: 16px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }
        .csm-desc {
          margin: 0;
          font-size: 0.78rem;
          color: var(--gray-600, #4E4A47);
          text-align: center;
          line-height: 1.5;
        }
        .csm-qr {
          width: 150px;
          height: 150px;
          object-fit: contain;
          border: 1px solid var(--gray-200, #E6E4E2);
          border-radius: var(--radius-sm, 6px);
          padding: 6px;
          background: var(--white, #fff);
        }
        .csm-link-btn {
          display: block;
          width: 100%;
          text-align: center;
          background: var(--green, #2E7D32);
          color: var(--white, #fff);
          text-decoration: none;
          padding: 9px 14px;
          border-radius: var(--radius-md, 10px);
          font-size: 0.8rem;
          font-weight: 700;
          transition: background 0.18s var(--ease-out, ease), transform 0.18s var(--ease-out, ease);
        }
        .csm-link-btn:hover {
          background: var(--green-light, #43A047);
          transform: translateY(-1px);
        }
        .csm-link-btn:focus-visible {
          outline: 2px solid var(--blue-primary, #1565C0);
          outline-offset: 2px;
        }

        @media (max-width: 480px) {
          .csm-widget { bottom: 16px; right: 16px; }
          .csm-panel { width: 230px; }
        }
      `}</style>
    </div>
  );
}
