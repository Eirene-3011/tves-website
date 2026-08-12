import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';

const BANNER_TYPES = [
  { value: 'general', label: 'General (Header Hero)' },
  { value: 'homepage', label: 'Homepage Slideshow' },
];

export default function AdminBanners() {
  const [banners, setBanners] = useState([]);
  const [form, setForm] = useState({ caption: '', sort_order: 0, type: 'general' });
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const load = () => api.get('/banners/all').then(r => setBanners(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!file && !editId) { toast.error('Please select an image file.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      if (file) fd.append('image', file);
      fd.append('caption', form.caption);
      fd.append('sort_order', form.sort_order);
      fd.append('type', form.type);
      fd.append('is_active', 1);
      if (editId) await api.put(`/banners/${editId}`, fd);
      else await api.post('/banners', fd);
      toast.success(editId ? 'Banner updated!' : 'Banner added!');
      setForm({ caption: '', sort_order: 0, type: 'general' }); setFile(null); setEditId(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Error'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this banner?')) return;
    await api.delete(`/banners/${id}`);
    toast.success('Deleted.'); load();
  };

  const handleEdit = (b) => {
    setEditId(b.id);
    setForm({ caption: b.caption || '', sort_order: b.sort_order || 0, type: b.type || 'general' });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">🖼️ Banner Images</h1><p className="admin-page-sub">Manage homepage slider/banner images.</p></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
        {/* Form */}
        <div className="admin-card">
          <h3 className="admin-card-title">{editId ? 'Edit Banner' : 'Add New Banner'}</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Banner Image {editId ? '(leave blank to keep current)' : '*'}</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label className="form-label">Banner Type *</label>
              <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {BANNER_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Caption</label>
              <textarea className="form-control" rows={3} value={form.caption} onChange={e => setForm(f => ({ ...f, caption: e.target.value }))} placeholder="Banner caption or subtitle..." />
            </div>
            <div className="form-group">
              <label className="form-label">Sort Order</label>
              <input type="number" className="form-control" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add Banner'}</button>
              {editId && <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setForm({ caption: '', sort_order: 0, type: 'general' }); }}>Cancel</button>}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="admin-card">
          <h3 className="admin-card-title">Current Banners ({banners.length})</h3>
          {banners.length === 0 ? <p style={{ color: 'var(--gray-400)', fontSize: '0.88rem' }}>No banners yet. Add one!</p> : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {banners.map(b => (
                <div key={b.id} style={{ display: 'flex', gap: 16, padding: '12px', background: 'var(--gray-50)', borderRadius: 'var(--radius-md)', border: '1px solid var(--gray-200)' }}>
                  <img src={getImageUrl(b.image_url)} alt="Banner" style={{ width: 120, height: 70, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} onError={e => e.target.style.display='none'} />
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--gray-800)', marginBottom: 4 }}>{b.caption || '(No caption)'}</p>
                    <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)' }}>
                      Type: {b.type || 'general'} | Order: {b.sort_order} | {b.is_active ? '✅ Active' : '⏸ Inactive'}
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(b)}>✏️</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(b.id)}>🗑️</button>
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
