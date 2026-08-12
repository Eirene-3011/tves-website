import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconUsers, IconDownload } from '../../components/Icons';

const PLACEHOLDER_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23e5e7eb"/><circle cx="40" cy="30" r="16" fill="%239ca3af"/><ellipse cx="40" cy="62" rx="24" ry="16" fill="%239ca3af"/></svg>';

// Group members by section_name, preserving order of first appearance.
// Members with no section_name are collected into a single unlabeled group.
function groupMembersBySection(members) {
  const groups = [];
  const byKey = {};
  (members || []).forEach(m => {
    const key = m.section_name || '__none__';
    if (!byKey[key]) {
      byKey[key] = { section: m.section_name || null, adviser: m.adviser_name || null, members: [] };
      groups.push(byKey[key]);
    }
    byKey[key].members.push(m);
  });
  return groups;
}

function MemberCard({ m }) {
  return (
    <div style={{
      background: 'var(--gray-50)',
      border: '1px solid var(--gray-200)',
      borderRadius: 8,
      padding: '14px 10px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: 8,
      textAlign: 'center'
    }}>
      <img
        src={m.photo_url ? getImageUrl(m.photo_url) : PLACEHOLDER_AVATAR}
        alt={m.full_name}
        style={{
          width: 64, height: 64,
          borderRadius: '50%',
          objectFit: 'cover',
          border: '2px solid var(--gray-200)',
          background: '#e5e7eb'
        }}
        onError={e => { e.target.src = PLACEHOLDER_AVATAR; }}
      />
      <div>
        <p style={{ fontWeight: 700, fontSize: '0.82rem', color: 'var(--gray-900)', margin: 0, lineHeight: 1.3 }}>{m.full_name}</p>
        {m.role && <p style={{ fontSize: '0.72rem', color: 'var(--gray-500)', margin: '3px 0 0' }}>{m.role}</p>}
        {m.contact_no && <p style={{ fontSize: '0.7rem', color: 'var(--gray-400)', margin: '3px 0 0' }}>{m.contact_no}</p>}
      </div>
    </div>
  );
}

export default function CommitteesPage() {
  const [committees, setCommittees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/committees').then(r => setCommittees(r.data)).finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Committees &amp; Councils</h1>
          <p>PTA, HPTA, SPTA, SSG/SPG and school governance bodies</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {Array.from({ length: 2 }).map((_, i) => (
                <div key={i} className="card">
                  <div className="skeleton" style={{ width: '100%', height: 64, borderRadius: 0 }} />
                  <div className="committee-body">
                    <div className="skeleton" style={{ width: '60%', height: 12, marginBottom: 16 }} />
                    <div className="skeleton" style={{ width: '100%', height: 120 }} />
                  </div>
                </div>
              ))}
            </div>
          ) : committees.length === 0 ? (
            <div className="alert alert-info">Committee information is being updated. Please check back soon.</div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
              {committees.map(c => {
                const sectionGroups = groupMembersBySection(c.members);
                return (
                  <div key={c.id} className="card" style={{ overflow: 'visible' }}>
                    <div className="committee-header">
                      <h3 className="committee-name">
                        <span className="committee-name-icon" aria-hidden="true"><IconUsers size={18} /></span>
                        {c.committee_name}
                      </h3>
                      {c.file_url && (
                        <a
                          href={getImageUrl(c.file_url)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="chip chip-invert"
                        >
                          <IconDownload size={14} />
                          Download
                        </a>
                      )}
                    </div>
                    <div className="committee-body">
                      {c.description && <p className="committee-desc">{c.description}</p>}
                      {c.members?.length > 0 ? (
                        <div style={{ marginTop: 8 }}>
                          {sectionGroups.map((g, idx) => (
                            <div key={g.section || `__none__${idx}`} style={{ marginBottom: 22 }}>
                              {g.section && (
                                <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10 }}>
                                  <span style={{
                                    fontSize: '0.8rem', fontWeight: 700, color: 'var(--red-primary)',
                                    background: 'var(--gray-100)', padding: '4px 12px', borderRadius: 999
                                  }}>{g.section}</span>
                                  {g.adviser && <span style={{ fontSize: '0.75rem', color: 'var(--gray-500)' }}>Adviser: {g.adviser}</span>}
                                </div>
                              )}
                              <div style={{
                                display: 'grid',
                                gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                                gap: 16
                              }}>
                                {g.members.map(m => <MemberCard key={m.id} m={m} />)}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="empty-note">Member list coming soon.</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
