import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { getImageUrl } from '../../utils/helpers';
import { IconBook, IconAbc, IconRuler, IconLibrary, IconFileText, IconDownload, IconSearch } from '../../components/Icons';

const CATS = [
  { key: 'ARAL', label: 'ARAL Program', Icon: IconBook },
  { key: 'KS1', label: 'Key Stage 1', Icon: IconAbc },
  { key: 'KS2', label: 'Key Stage 2', Icon: IconRuler },
  { key: 'Supplementary', label: 'Supplementary', Icon: IconLibrary },
];

export default function LearningResourcesPage() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('ARAL');
  const [query, setQuery] = useState('');

  useEffect(() => {
    api.get('/resources').then(r => setResources(r.data)).finally(() => setLoading(false));
  }, []);

  const counts = useMemo(() => {
    const c = {};
    CATS.forEach(cat => { c[cat.key] = 0; });
    resources.forEach(r => { if (c[r.category] !== undefined) c[r.category] += 1; });
    return c;
  }, [resources]);

  const activeCat = CATS.find(c => c.key === activeTab);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return resources.filter(r => {
      if (r.category !== activeTab) return false;
      if (!q) return true;
      return r.title?.toLowerCase().includes(q) || r.description?.toLowerCase().includes(q);
    });
  }, [resources, activeTab, query]);

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>Learning Resources</h1>
          <p>ARAL program materials, Key Stage resources, and supplementary learning materials</p>
        </div>
      </div>

      <section className="section">
        <div className="container">
          {/* Category filter tabs */}
          <div
            style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}
            role="tablist"
            aria-label="Resource category"
          >
            {CATS.map(c => {
              const active = activeTab === c.key;
              return (
                <button
                  key={c.key}
                  role="tab"
                  aria-selected={active}
                  onClick={() => setActiveTab(c.key)}
                  className={`btn ${active ? 'btn-primary' : 'btn-ghost'}`}
                >
                  <c.Icon size={16} />
                  {c.label}
                  {!loading && !!counts[c.key] && <span className="tab-count">{counts[c.key]}</span>}
                </button>
              );
            })}
          </div>

          {/* Search within active category */}
          {!loading && resources.length > 0 && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                background: 'var(--gray-50, #f7f7f8)',
                border: '1px solid var(--gray-200, #e5e5e5)',
                borderRadius: 8,
                padding: '8px 12px',
                maxWidth: 320,
                marginBottom: 20,
              }}
            >
              <IconSearch size={16} style={{ color: 'var(--gray-500, #888)', flexShrink: 0 }} />
              <input
                type="text"
                value={query}
                onChange={e => setQuery(e.target.value)}
                placeholder={`Search ${activeCat.label}...`}
                aria-label="Search resources"
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
          )}

          {loading ? (
            <div className="table-wrap">
              <table className="resource-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th style={{ width: 120 }}>File</th>
                  </tr>
                </thead>
                <tbody>
                  {Array.from({ length: 5 }).map((_, i) => (
                    <tr key={i}>
                      <td><div className="skeleton" style={{ width: '70%', height: 12 }} /></td>
                      <td><div className="skeleton" style={{ width: '85%', height: 12 }} /></td>
                      <td><div className="skeleton" style={{ width: 80, height: 28, borderRadius: 'var(--radius-md)' }} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : resources.length === 0 ? (
            <div className="alert alert-info">No resources have been posted yet. Please check back soon.</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" aria-hidden="true"><activeCat.Icon size={22} /></div>
              <p>
                {query
                  ? `No ${activeCat.label} resources match "${query}".`
                  : 'No resources available in this category yet. Please check back soon.'}
              </p>
            </div>
          ) : (
            <div className="table-wrap">
              <table className="resource-table">
                <thead>
                  <tr>
                    <th>Title</th>
                    <th>Description</th>
                    <th style={{ width: 120 }}>File</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(r => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div
                            aria-hidden="true"
                            style={{
                              width: 32,
                              height: 32,
                              borderRadius: 7,
                              background: 'var(--red-pale)',
                              color: 'var(--red-primary)',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              flexShrink: 0,
                            }}
                          >
                            <IconFileText size={16} />
                          </div>
                          <span style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--gray-900)' }}>
                            {r.title}
                          </span>
                        </div>
                      </td>
                      <td>
                        <span style={{ fontSize: '0.82rem', color: 'var(--gray-600)', lineHeight: 1.5 }}>
                          {r.description || '—'}
                        </span>
                      </td>
                      <td>
                        {r.file_url ? (
                          <a
                            href={getImageUrl(r.file_url)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn btn-primary btn-sm"
                          >
                            <IconDownload size={14} />
                            Download
                          </a>
                        ) : (
                          <span className="badge badge-gray">Uploading Soon</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      <style>{`
        .table-wrap {
          overflow-x: auto;
          border: 1px solid var(--gray-200, #e5e5e5);
          border-radius: var(--radius-md, 8px);
        }
        .resource-table {
          width: 100%;
          border-collapse: collapse;
          font-size: 0.85rem;
        }
        .resource-table thead th {
          text-align: left;
          font-size: 0.72rem;
          text-transform: uppercase;
          letter-spacing: 0.04em;
          color: var(--gray-500, #888);
          font-weight: 700;
          padding: 12px 16px;
          background: var(--gray-50, #f7f7f8);
          border-bottom: 1px solid var(--gray-200, #e5e5e5);
        }
        .resource-table tbody td {
          padding: 14px 16px;
          border-bottom: 1px solid var(--gray-100, #f0f0f0);
          vertical-align: middle;
        }
        .resource-table tbody tr:last-child td {
          border-bottom: none;
        }
        .resource-table tbody tr:hover {
          background: var(--gray-50, #fafafa);
        }
      `}</style>
    </div>
  );
}
