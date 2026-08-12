import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';

const LEVELS = [
  { key: 'kinder', label: 'Kinder' },
  { key: 'grade1', label: 'Grade 1' },
  { key: 'grade2', label: 'Grade 2' },
  { key: 'grade3', label: 'Grade 3' },
  { key: 'grade4', label: 'Grade 4' },
  { key: 'grade5', label: 'Grade 5' },
  { key: 'grade6', label: 'Grade 6' },
];

const BLANK = {
  school_year: '', sort_order: '',
  kinder_male: '', kinder_female: '',
  grade1_male: '', grade1_female: '',
  grade2_male: '', grade2_female: '',
  grade3_male: '', grade3_female: '',
  grade4_male: '', grade4_female: '',
  grade5_male: '', grade5_female: '',
  grade6_male: '', grade6_female: '',
  chart_image_url: '',
};

function grandTotal(form) {
  return LEVELS.reduce((sum, l) => {
    return sum + Number(form[`${l.key}_male`] || 0) + Number(form[`${l.key}_female`] || 0);
  }, 0);
}

export default function AdminEnrollmentStats() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () =>
    api.get('/enrollment-stats').then(r => setItems(r.data)).catch(() => {});

  useEffect(() => { load(); }, []);

  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      school_year: item.school_year,
      sort_order: item.sort_order ?? '',
      chart_image_url: item.chart_image_url || '',
      ...LEVELS.reduce((acc, l) => ({
        ...acc,
        [`${l.key}_male`]:   item[`${l.key}_male`]   ?? '',
        [`${l.key}_female`]: item[`${l.key}_female`] ?? '',
      }), {}),
    });
    setFile(null);
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this school year\'s enrollment data?')) return;
    try {
      await api.delete(`/enrollment-stats/${id}`);
      toast.success('Deleted.');
      load();
    } catch { toast.error('Error deleting.'); }
  };

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.school_year.trim()) { toast.error('School year is required.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('chart_image', file);
      if (editId) await api.put(`/enrollment-stats/${editId}`, fd);
      else         await api.post('/enrollment-stats', fd);
      toast.success('Saved!');
      setForm(BLANK); setFile(null); setEditId(null); setShowForm(false);
      load();
    } catch { toast.error('Error saving.'); }
    finally { setSaving(false); }
  };

  const cancel = () => { setShowForm(false); setEditId(null); setForm(BLANK); setFile(null); };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">📈 Enrollment Statistics</h1>
          <p className="admin-page-sub">
              Manage BOSY enrollment headcount for Kinder through Grade 6 by school year.
            Upload the official chart image for each year in the form below.
          </p>
        </div>
        <button
          className="btn btn-primary"
          onClick={() => { if (showForm && !editId) { cancel(); } else { cancel(); setShowForm(true); } }}
        >
          {showForm && !editId ? 'Close' : '+ Add School Year'}
        </button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">
            {editId ? `Edit SY ${form.school_year}` : 'Add School Year'}
          </h3>
          <form onSubmit={handleSave}>
            {/* Meta */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div className="form-group">
                <label className="form-label">School Year * <small>(e.g. 2026-2027)</small></label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="2026-2027"
                  value={form.school_year}
                  onChange={e => set('school_year', e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label className="form-label">Sort Order <small>(higher = newer)</small></label>
                <input
                  type="number"
                  className="form-control"
                  placeholder="3"
                  value={form.sort_order}
                  onChange={e => set('sort_order', e.target.value)}
                />
              </div>
            </div>

            {/* Enrollment counts per grade level */}
            <p style={{ fontWeight: 600, marginBottom: 8, fontSize: '0.9rem' }}>
              Enrollment Count by Grade Level
            </p>
            <div style={{ overflowX: 'auto', marginBottom: 20 }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ background: '#f5f5f5' }}>
                    <th style={th}>Level</th>
                    <th style={th}>Male</th>
                    <th style={th}>Female</th>
                    <th style={{ ...th, color: '#888' }}>Total (auto)</th>
                  </tr>
                </thead>
                <tbody>
                  {LEVELS.map((l, i) => {
                    const m = Number(form[`${l.key}_male`]   || 0);
                    const f = Number(form[`${l.key}_female`] || 0);
                    return (
                      <tr key={l.key} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                        <td style={td}><strong>{l.label}</strong></td>
                        <td style={td}>
                          <input
                            type="number" min="0"
                            className="form-control"
                            style={{ width: 90 }}
                            value={form[`${l.key}_male`]}
                            onChange={e => set(`${l.key}_male`, e.target.value)}
                          />
                        </td>
                        <td style={td}>
                          <input
                            type="number" min="0"
                            className="form-control"
                            style={{ width: 90 }}
                            value={form[`${l.key}_female`]}
                            onChange={e => set(`${l.key}_female`, e.target.value)}
                          />
                        </td>
                        <td style={{ ...td, color: '#555', fontWeight: 600 }}>{m + f}</td>
                      </tr>
                    );
                  })}
                  <tr style={{ background: '#f0f0f0', fontWeight: 700 }}>
                    <td style={td}>Grand Total</td>
                    <td style={td}>
                      {LEVELS.reduce((s, l) => s + Number(form[`${l.key}_male`]||0), 0)}
                    </td>
                    <td style={td}>
                      {LEVELS.reduce((s, l) => s + Number(form[`${l.key}_female`]||0), 0)}
                    </td>
                    <td style={{ ...td, color: 'var(--red-primary)', fontSize: '1rem' }}>
                      {grandTotal(form)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Chart image upload */}
            <div className="form-group" style={{ marginBottom: 20 }}>
              <label className="form-label">
                Enrollment Chart Image <small>(upload the official BOSY chart graphic)</small>
              </label>
              {form.chart_image_url && !file && (
                <div style={{ marginBottom: 8 }}>
                  <img
                    src={getImageUrl(form.chart_image_url)}
                    alt="Current chart"
                    style={{ maxHeight: 120, borderRadius: 6, border: '1px solid #eee' }}
                  />
                  <p style={{ fontSize: '0.78rem', color: '#888', marginTop: 4 }}>
                    Current image — upload a new one to replace it.
                  </p>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={e => setFile(e.target.files[0])}
              />
            </div>

            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editId ? 'Update' : 'Add'}
              </button>
              <button type="button" className="btn btn-ghost" onClick={cancel}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Table of existing school years */}
      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>School Year</th>
                <th style={{ textAlign: 'right' }}>Male</th>
                <th style={{ textAlign: 'right' }}>Female</th>
                <th style={{ textAlign: 'right' }}>Grand Total</th>
                <th>Chart Image</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 && (
                <tr><td colSpan={6} style={{ textAlign: 'center', padding: 32, color: '#aaa' }}>
                  No school years added yet.
                </td></tr>
              )}
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 700 }}>SY {item.school_year}</td>
                  <td style={{ textAlign: 'right' }}>{item.total_male}</td>
                  <td style={{ textAlign: 'right' }}>{item.total_female}</td>
                  <td style={{ textAlign: 'right', fontWeight: 700, color: 'var(--red-primary)' }}>
                    {Number(item.grand_total).toLocaleString()}
                  </td>
                  <td>
                    {item.chart_image_url
                      ? <a href={getImageUrl(item.chart_image_url)} target="_blank" rel="noopener noreferrer" className="badge badge-green">🖼️ View</a>
                      : <span style={{ color: '#ccc' }}>—</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(item)}>✏️</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(item.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div style={{ marginTop: 16, fontSize: '0.83rem', color: '#888' }}>
        💡 Tip: After adding a school year, open the edit form to upload the official chart image from the BOSY report.
        The image will appear alongside the data table on the public Enrollment Statistics page.
      </div>
    </div>
  );
}

const th = { padding: '8px 12px', textAlign: 'left', fontWeight: 600, borderBottom: '2px solid #eee' };
const td = { padding: '6px 12px', borderBottom: '1px solid #eee' };