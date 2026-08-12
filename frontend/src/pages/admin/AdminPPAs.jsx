import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';

const BLANK = { name: '', short_description: '', frequency: '', sort_order: 0 };

export default function AdminPPAs() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/ppas').then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      if (editId) await api.put(`/ppas/${editId}`, fd);
      else await api.post('/ppas', fd);
      toast.success('Saved!');
      setForm(BLANK); setFile(null); setEditId(null); setShowForm(false); load();
    } catch { toast.error('Error.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (p) => { setEditId(p.id); setForm({ name: p.name, short_description: p.short_description || '', frequency: p.frequency || '', sort_order: p.sort_order || 0 }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/ppas/${id}`); toast.success('Deleted.'); load(); };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">🎓 Programs, Projects & Activities</h1><p className="admin-page-sub">Manage school programs and activities.</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK); }}>{showForm ? 'Close' : '+ Add PPA'}</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">{editId ? 'Edit PPA' : 'Add PPA'}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Program/Activity Name *</label>
                <input type="text" className="form-control" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={form.short_description} onChange={e => setForm(f => ({ ...f, short_description: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Frequency</label>
                <input type="text" className="form-control" value={form.frequency} onChange={e => setForm(f => ({ ...f, frequency: e.target.value }))} placeholder="e.g. Annual, Quarterly" />
              </div>
              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input type="number" className="form-control" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Program Image</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add PPA'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 20 }}>
        {items.map(p => (
          <div key={p.id} className="card">
            {p.image_url && <img src={getImageUrl(p.image_url)} alt={p.name} style={{ width: '100%', height: 140, objectFit: 'cover' }} />}
            <div style={{ padding: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8, marginBottom: 8 }}>
                <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>{p.name}</h3>
                {p.frequency && <span className="badge badge-gold" style={{ fontSize: '0.68rem', flexShrink: 0 }}>{p.frequency}</span>}
              </div>
              <p style={{ fontSize: '0.8rem', color: 'var(--gray-500)', marginBottom: 12 }}>{p.short_description}</p>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(p)}>✏️ Edit</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(p.id)}>🗑️</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
