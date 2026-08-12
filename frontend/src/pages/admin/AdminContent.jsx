import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const SECTIONS = [
  { key: 'vision', label: '🔭 Vision Statement', page: 'about' },
  { key: 'mission', label: '🎯 Mission Statement', page: 'about' },
  { key: 'core_values', label: '💎 Core Values', page: 'about' },
  { key: 'goals', label: '📌 Goals & Objectives', page: 'about' },
  { key: 'history', label: '🏫 School History', page: 'about' },
  { key: 'enrollment', label: '📋 Enrollment Info', page: 'admissions' },
  { key: 'job_vacancies', label: '💼 Careers / Job Vacancies', page: 'careers' },
  { key: 'student_services', label: '🧭 Guidance & Student Services', page: 'guidance' },
];

export default function AdminContent() {
  const [activeSection, setActiveSection] = useState('vision');
  const [blocks, setBlocks] = useState({});
  const [saving, setSaving] = useState(false);

  const sec = SECTIONS.find(s => s.key === activeSection);

  useEffect(() => {
    SECTIONS.forEach(s => {
      api.get(`/content/${s.page}/${s.key}`).then(r => {
        if (r.data) setBlocks(prev => ({ ...prev, [s.key]: r.data }));
      }).catch(() => {});
    });
  }, []);

  const current = blocks[activeSection] || { title: sec?.label || '', body_richtext: '' };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put(`/content/${sec.page}/${activeSection}`, {
        title: current.title,
        body_richtext: current.body_richtext,
        sort_order: current.sort_order || 0,
      });
      toast.success('Content saved!');
    } catch (err) { toast.error('Failed to save.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">📝 Content Editor</h1><p className="admin-page-sub">Edit rich-text content blocks for the About Us and other pages.</p></div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '220px 1fr', gap: 24 }}>
        {/* Section selector */}
        <div className="admin-card" style={{ padding: 8, height: 'fit-content' }}>
          {SECTIONS.map(s => (
            <button key={s.key} onClick={() => setActiveSection(s.key)}
              style={{ display: 'block', width: '100%', textAlign: 'left', padding: '10px 14px', border: 'none', cursor: 'pointer', borderRadius: 8, fontWeight: 600, fontSize: '0.85rem', marginBottom: 2, background: activeSection === s.key ? 'var(--red-primary)' : 'transparent', color: activeSection === s.key ? 'white' : 'var(--gray-700)', transition: 'all var(--transition)' }}>
              {s.label}
            </button>
          ))}
        </div>

        {/* Editor */}
        <div className="admin-card">
          <h3 className="admin-card-title">{sec?.label}</h3>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input type="text" className="form-control" value={current.title || ''} onChange={e => setBlocks(b => ({ ...b, [activeSection]: { ...current, title: e.target.value } }))} />
          </div>
          <div className="form-group">
            <label className="form-label">Content (HTML)</label>
            <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: 8 }}>
              Use HTML tags: &lt;p&gt;, &lt;ul&gt;, &lt;li&gt;, &lt;strong&gt;, &lt;em&gt;, &lt;h3&gt;, etc.
            </p>
            <textarea className="form-control" rows={18} value={current.body_richtext || ''} style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}
              onChange={e => setBlocks(b => ({ ...b, [activeSection]: { ...current, body_richtext: e.target.value } }))} />
          </div>
          <div style={{ marginTop: 8, padding: '16px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
            <p style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-500)', marginBottom: 8 }}>PREVIEW:</p>
            <div className="rich-content" dangerouslySetInnerHTML={{ __html: current.body_richtext || '<em>Nothing to preview</em>' }} />
          </div>
          <div style={{ marginTop: 20 }}>
            <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : '💾 Save Content'}</button>
          </div>
        </div>
      </div>
    </div>
  );
}
