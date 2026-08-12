import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import { IconCalendar, IconSearch, IconRepeat } from '../../components/Icons';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const CATEGORY_LABELS = {
  event: 'Event',
  academic: 'Academic',
  holiday: 'Holiday',
  special: 'Special',
  general: 'General',
};

export default function SchoolCalendarPage() {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState('all');

  useEffect(() => {
    api.get('/calendar').then(r => setEvents(r.data)).finally(() => setLoading(false));
  }, []);

  const formatDate = (d) =>
    d ? new Date(d).toLocaleDateString('en-PH', { month: 'long', day: 'numeric', year: 'numeric' }) : '';

  const categories = useMemo(() => {
    const set = new Set();
    events.forEach(e => { if (e.category) set.add(e.category); });
    return ['all', ...Array.from(set)];
  }, [events]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return events.filter(e => {
      const matchesCategory = activeCategory === 'all' || e.category === activeCategory;
      const matchesQuery = !q || e.event_name?.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [events, query, activeCategory]);

  // Group filtered events by the month of their start_date
  const grouped = {};
  filtered.forEach(e => {
    if (!e.start_date) return;
    const m = new Date(e.start_date).getMonth();
    if (Number.isNaN(m)) return;
    if (!grouped[m]) grouped[m] = [];
    grouped[m].push(e);
  });

  return (
    <div>
      <div className="page-header">
        <div className="container">
          <h1>School Calendar</h1>
          <p>Important dates and events for the school year</p>
        </div>
      </div>

      <section className="section">
        <div className="container" style={{ maxWidth: 800 }}>
          {/* Search + category filter */}
          {!loading && events.length > 0 && (
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: 12,
                alignItems: 'center',
                justifyContent: 'space-between',
                marginBottom: 28,
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
                  flex: '1 1 220px',
                  maxWidth: 300,
                }}
              >
                <IconSearch size={16} style={{ color: 'var(--gray-500, #888)', flexShrink: 0 }} />
                <input
                  type="text"
                  value={query}
                  onChange={e => setQuery(e.target.value)}
                  placeholder="Search events..."
                  aria-label="Search events"
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

              {categories.length > 1 && (
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {categories.map(c => {
                    const active = activeCategory === c;
                    const label = c === 'all' ? 'All' : (CATEGORY_LABELS[c] || c);
                    return (
                      <button
                        key={c}
                        onClick={() => setActiveCategory(c)}
                        className={`btn btn-sm ${active ? 'btn-primary' : 'btn-ghost'}`}
                        style={{ borderRadius: 20 }}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {loading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="card" style={{ padding: '16px 20px' }}>
                  <div className="skeleton" style={{ width: '40%', height: 16, marginBottom: 8 }} />
                  <div className="skeleton" style={{ width: '70%', height: 10 }} />
                </div>
              ))}
            </div>
          ) : events.length === 0 ? (
            <div className="alert alert-info">No calendar events have been posted yet.</div>
          ) : filtered.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon" aria-hidden="true"><IconCalendar size={22} /></div>
              <p>No events match your search or filter.</p>
            </div>
          ) : (
            <div>
              {Object.entries(grouped).sort(([a], [b]) => +a - +b).map(([month, evs]) => (
                <div key={month} style={{ marginBottom: 32 }}>
                  <h3
                    style={{
                      fontWeight: 800,
                      fontSize: '1rem',
                      color: 'var(--red-primary)',
                      textTransform: 'uppercase',
                      letterSpacing: '0.07em',
                      marginBottom: 12,
                      paddingBottom: 8,
                      borderBottom: '2px solid var(--red-pale)',
                    }}
                  >
                    {MONTHS[+month]}
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {evs
                      .sort((a, b) => new Date(a.start_date) - new Date(b.start_date))
                      .map(ev => {
                        const startDate = new Date(ev.start_date);
                        const hasRange = ev.end_date && ev.end_date !== ev.start_date;
                        return (
                          <div key={ev.id} className="calendar-row">
                            <div className="calendar-date-chip">
                              <p style={{ fontSize: '0.65rem', fontWeight: 700, color: 'var(--red-primary)', textTransform: 'uppercase', margin: 0 }}>
                                {MONTHS[+month]}
                              </p>
                              <p style={{ fontSize: '1.4rem', fontWeight: 900, color: 'var(--red-dark)', margin: 0, lineHeight: 1 }}>
                                {startDate.getDate()}
                              </p>
                            </div>

                            <div style={{ flex: 1, minWidth: 0 }}>
                              <h4 style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-900)', margin: '0 0 6px' }}>
                                {ev.event_name}
                              </h4>
                              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
                                {ev.category && (
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
                                    {CATEGORY_LABELS[ev.category] || ev.category}
                                  </span>
                                )}
                                {hasRange && (
                                  <span style={{ fontSize: '0.78rem', color: 'var(--gray-500, #888)' }}>
                                    {formatDate(ev.start_date)} – {formatDate(ev.end_date)}
                                  </span>
                                )}
                                {!!ev.is_recurring && (
                                  <span
                                    style={{
                                      fontSize: '0.75rem',
                                      color: 'var(--gray-500, #888)',
                                      display: 'inline-flex',
                                      alignItems: 'center',
                                      gap: 4,
                                    }}
                                  >
                                    <IconRepeat size={13} />
                                    Recurring yearly
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      <style>{`
        .calendar-row {
          display: flex;
          gap: 16px;
          padding: 14px 18px;
          background: white;
          border: 1px solid var(--gray-200);
          border-radius: 10px;
          align-items: flex-start;
          transition: box-shadow 0.15s ease, border-color 0.15s ease;
        }
        .calendar-row:hover {
          box-shadow: 0 6px 16px rgba(0,0,0,0.06);
          border-color: var(--gray-300, #d4d4d4);
        }
        .calendar-date-chip {
          flex-shrink: 0;
          min-width: 52px;
          text-align: center;
          background: var(--red-pale);
          border-radius: 8px;
          padding: 8px 6px;
        }
      `}</style>
    </div>
  );
}
