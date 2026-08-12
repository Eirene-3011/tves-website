import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconScroll, IconDownload, IconScale, IconExternalLink } from '../../components/Icons';

export default function CitizensCharterPage() {
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/charter')
      .then(r => setDocuments(Array.isArray(r.data) ? r.data : []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Citizen's Charter</h1>
          <p>Our commitment to efficient, transparent, and accountable public service</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 900 }}>
          <div className="charter-badges">
            <span className="charter-badge badge-red">
              <IconScale size={14} /> RA 11032 — EODB Act of 2018
            </span>
            <span className="charter-badge badge-blue">
              <IconScale size={14} /> ARTA — Anti-Red Tape Act
            </span>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card" style={{ padding: '20px 24px' }}>
                  <div className="skeleton" style={{ width: '60%', height: 14, marginBottom: 10 }} />
                  <div className="skeleton" style={{ width: '100%', height: 10, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: '80%', height: 10 }} />
                </div>
              ))}
            </div>
          ) : documents.length === 0 ? (
            <div className="alert alert-info">
              Citizen's Charter documents are being prepared. Please check back soon or contact the school office.
            </div>
          ) : (
            <>
              <p style={{ color: 'var(--gray-500)', fontSize: '0.88rem', marginBottom: 24 }}>
                {documents.length} of 16 documents available
              </p>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
                {documents.map((doc, i) => (
                  <div key={doc.id} className="card" style={{ padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 10 }}>
                      <span style={{
                        flexShrink: 0,
                        width: 32, height: 32,
                        background: 'var(--red-pale)',
                        borderRadius: 6,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: 'var(--red-primary)', fontWeight: 700, fontSize: '0.78rem'
                      }}>
                        {String(i + 1).padStart(2, '0')}
                      </span>
                      <div>
                        <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-900)', margin: 0, lineHeight: 1.4 }}>
                          {doc.title}
                        </h3>
                      </div>
                    </div>
                    {doc.description && (
                      <p style={{ fontSize: '0.82rem', color: 'var(--gray-500)', margin: 0, lineHeight: 1.5 }}>
                        {doc.description}
                      </p>
                    )}
                    <div style={{ marginTop: 'auto', paddingTop: 8 }}>
                      {doc.pdf_url ? (
                        <a
                          href={getImageUrl(doc.pdf_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-outline btn-sm"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
                        >
                          <IconDownload size={14} />
                          View / Download PDF
                        </a>
                      ) : (
                        <span style={{ fontSize: '0.78rem', color: 'var(--gray-400)', fontStyle: 'italic' }}>
                          PDF not yet uploaded
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          <div className="divider" />

          <div className="note-panel">
            <div className="note-panel-icon"><IconScale size={18} /></div>
            <div>
              <h3 className="note-panel-title">Legal Basis</h3>
              <p>
                Republic Act No. 11032 (Ease of Doing Business and Efficient Government Service Delivery Act
                of 2018), Section 6, requires all government agencies, including public schools, to publish
                their Citizen's Charter on their official website. This requirement stems from the earlier
                Anti-Red Tape Act (RA 9485) and is consistent with Executive Order No. 2, s. 2016 on Freedom
                of Information.
              </p>
              <p>
                For the official DepEd Citizen's Charter, visit{' '}
                <a
                  href="https://www.deped.gov.ph"
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{ color: 'var(--red-primary)', fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 4 }}
                >
                  www.deped.gov.ph <IconExternalLink size={13} />
                </a>
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
