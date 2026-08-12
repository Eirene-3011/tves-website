import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';

const BLANK = { full_name: '', years_served: '', sort_order: 0 };
const PLACEHOLDER_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23e5e7eb"/><circle cx="40" cy="30" r="16" fill="%239ca3af"/><ellipse cx="40" cy="62" rx="24" ry="16" fill="%239ca3af"/></svg>';

export default function AdminSchoolHeads() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const load = () => api.get('/school-heads').then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast.error('Name is required.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('photo', file);
      if (editId) await api.put(`/school-heads/${editId}`, fd);
      else await api.post('/school-heads', fd);
      toast.success(editId ? 'Updated!' : 'Added!');
      setForm(BLANK); setFile(null); setEditId(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Error.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this entry?')) return;
    await api.delete(`/school-heads/${id}`);
    toast.success('Deleted.'); load();
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ full_name: item.full_name || '', years_served: item.years_served || '', sort_order: item.sort_order || 0 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">👤 Chronology of School Heads</h1>
          <p className="admin-page-sub">Manage the list of past and current school heads with their years of service. These appear in the School Profile section on the About page.</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
        {/* Form */}
        <div className="admin-card">
          <h3 className="admin-card-title">{editId ? 'Edit Entry' : 'Add School Head'}</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <input type="text" className="form-control" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} placeholder="e.g. Juan dela Cruz" required />
            </div>
            <div className="form-group">
              <label className="form-label">Years Served</label>
              <input type="text" className="form-control" value={form.years_served} onChange={e => setForm(f => ({ ...f, years_served: e.target.value }))} placeholder="e.g. 2018–2022 or 2024–present" />
            </div>
            <div className="form-group">
              <label className="form-label">Photo {editId ? '(leave blank to keep)' : '(optional)'}</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label className="form-label">Sort Order (1 = earliest)</label>
              <input type="number" className="form-control" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Add'}</button>
              {editId && <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setForm(BLANK); setFile(null); }}>Cancel</button>}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="admin-card">
          <h3 className="admin-card-title">All Entries ({items.length})</h3>
          {items.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', fontSize: '0.88rem' }}>No entries yet. Add past and current school heads.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {items.map((item, i) => (
                <div key={item.id} style={{ display: 'flex', gap: 14, padding: 14, background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--gray-400)', minWidth: 24, textAlign: 'center' }}>{i + 1}</span>
                  <img
                    src={item.photo_url ? getImageUrl(item.photo_url) : PLACEHOLDER_AVATAR}
                    alt={item.full_name}
                    style={{ width: 48, height: 48, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gray-200)', flexShrink: 0 }}
                    onError={e => { e.target.src = PLACEHOLDER_AVATAR; }}
                  />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-900)', margin: 0 }}>{item.full_name}</p>
                    {item.years_served && <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', margin: '2px 0 0' }}>📅 {item.years_served}</p>}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(item)}>✏️</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(item.id)}>🗑️</button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
