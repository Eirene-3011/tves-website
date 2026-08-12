import React, { useState, useEffect, useMemo } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconFileText, IconCalendar, IconSearch, IconExternalLink } from '../../components/Icons';

const TABS = [
  { key: '', label: 'All' },
  { key: 'deped_order', label: 'DepEd Orders' },
  { key: 'procurement', label: 'Procurement' },
  { key: 'memo', label: 'School Memos' },
];

export default function IssuancesPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [issuances, setIssuances] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [sortOrder, setSortOrder] = useState('newest'); // 'newest' | 'oldest'
  const type = searchParams.get('type') || '';

  useEffect(() => {
    setLoading(true);
    const url = type ? `/issuances?type=${type}` : '/issuances';
    api.get(url).then(r => setIssuances(r.data)).finally(() => setLoading(false));
  }, [type]);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-PH', { year: 'numeric', month: 'long', day: 'numeric' }) : '';

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = issuances.filter(item => !q || item.title?.toLowerCase().includes(q));
    list = [...list].sort((a, b) => {
      const da = a.date_issued ? new Date(a.date_issued).getTime() : 0;
      const db = b.date_issued ? new Date(b.date_issued).getTime() : 0;
      return sortOrder === 'newest' ? db - da : da - db;
    });
    return list;
  }, [issuances, query, sortOrder]);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Issuances</h1>
          <p>DepEd orders, procurement postings, and school memoranda</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Type tabs */}
          <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }} role="tablist" aria-label="Issuance type">
            {TABS.map(t => (
              <button
                key={t.key}
                role="tab"
                aria-selected={type === t.key}
                className={`tab-btn${type === t.key ? ' active' : ''}`}
                onClick={() => setSearchParams(t.key ? { type: t.key } : {})}
              >
                {t.label}
              </button>
            ))}
          </div>

          {/* Search + sort controls */}
          {!loading && issuances.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 24,
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  background: 'var(--gray-50, #f7f7f8)',
                  border: '1px solid var(--gray-200, #e5e5e5)',
                  borderRadius: 8,
                  padding: '8px 12px',
                  flex: '1 1 240px',
                  maxWidth: 320,
                }}
              >
                <IconSearch size={16} style={{ color: 'var(--gray-500, #888)', flexShrink: 0 }} />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search issuances..."
                  aria-label="Search issuances"
                  style={{
                    border: 'none',
                    outline: 'none',
                    background: 'transparent',
                    fontSize: '0.85rem',
                    width: '100%',
                    color: 'var(--gray-900)',
                  }}
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: '0.78rem', color: 'var(--gray-500, #888)' }}>Sort:</span>
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => setSortOrder(o => (o === 'newest' ? 'oldest' : 'newest'))}
                >
                  {sortOrder === 'newest' ? 'Newest first' : 'Oldest first'}
                </button>
              </div>
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="card" style={{ padding: '16px 20px' }}>
                  <div className="skeleton" style={{ width: '60%', height: 16, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: '80%', height: 10 }} />
                </div>
              ))}
            </div>
          ) : issuances.length === 0 ? (
            <div className="alert alert-info">No issuances found for this category.</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" aria-hidden="true"><IconFileText size={22} /></div>
              <p>No issuances match "{query}". Try a different keyword.</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {filtered.map(item => (
                <div key={item.id} className="issuance-row">
                  <div
                    aria-hidden="true"
                    style={{
                      width: 40,
                      height: 40,
                      borderRadius: 9,
                      background: 'var(--red-pale)',
                      color: 'var(--red-primary)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <IconFileText size={19} />
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <h3 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-900)', margin: '0 0 6px' }}>
                      {item.title}
                    </h3>
                    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
                      {item.type && (
                        <span
                          style={{
                            fontSize: '0.72rem',
                            fontWeight: 600,
                            color: 'var(--red-primary)',
                            background: 'var(--red-pale)',
                            borderRadius: 4,
                            padding: '2px 8px',
                          }}
                        >
                          {item.type.replace('_', ' ')}
                        </span>
                      )}
                      {item.date_issued && (
                        <span
                          style={{
                            fontSize: '0.75rem',
                            color: 'var(--gray-400)',
                            display: 'inline-flex',
                            alignItems: 'center',
                            gap: 4,
                          }}
                        >
                          <IconCalendar size={13} />
                          {formatDate(item.date_issued)}
                        </span>
                      )}
                    </div>
                  </div>

                  {item.file_url && (
                    <a
                      href={getImageUrl(item.file_url)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn btn-outline btn-sm"
                      style={{ flexShrink: 0, display: 'inline-flex', alignItems: 'center', gap: 6 }}
                    >
                      <IconExternalLink size={14} />
                      View
                    </a>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .issuance-row {
          display: flex;
          gap: 14px;
          padding: 16px 20px;
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 10px;
          align-items: center;
          transition: box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .issuance-row:hover {
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
          border-color: var(--gray-300, #d4d4d4);
        }
      `}</style>
    </div>
  );
}
