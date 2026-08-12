import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';

const BLANK = { full_name: '', position: '', department_office: '', contact_no: '', sort_order: 0 };

export default function AdminOfficials() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/officials').then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('photo', file);
      if (editId) await api.put(`/officials/${editId}`, fd);
      else await api.post('/officials', fd);
      toast.success('Saved!');
      setForm(BLANK); setFile(null); setEditId(null); setShowForm(false); load();
    } catch { toast.error('Error.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (o) => { setEditId(o.id); setForm({ full_name: o.full_name, position: o.position || '', department_office: o.department_office || '', contact_no: o.contact_no || '', sort_order: o.sort_order || 0 }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/officials/${id}`); toast.success('Deleted.'); load(); };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">👔 School Officials</h1><p className="admin-page-sub">Manage the list of school officials displayed on the Organizational Structure page.</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK); }}>{showForm ? 'Close' : '+ Add Official'}</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">{editId ? 'Edit Official' : 'Add Official'}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group"><label className="form-label">Full Name *</label><input type="text" className="form-control" value={form.full_name} onChange={e => setForm(f => ({ ...f, full_name: e.target.value }))} required /></div>
              <div className="form-group"><label className="form-label">Position</label><input type="text" className="form-control" value={form.position} onChange={e => setForm(f => ({ ...f, position: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Department / Office</label><input type="text" className="form-control" value={form.department_office} onChange={e => setForm(f => ({ ...f, department_office: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Contact No.</label><input type="text" className="form-control" value={form.contact_no} onChange={e => setForm(f => ({ ...f, contact_no: e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Sort Order</label><input type="number" className="form-control" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} /></div>
              <div className="form-group"><label className="form-label">Photo</label><input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} /></div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16 }}>
        {items.map(o => (
          <div key={o.id} className="card" style={{ padding: '20px', textAlign: 'center' }}>
            {o.photo_url ? <img src={getImageUrl(o.photo_url)} alt={o.full_name} style={{ width: 64, height: 64, borderRadius: '50%', objectFit: 'cover', margin: '0 auto 10px', border: '3px solid var(--red-primary)' }} /> : <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'var(--gray-200)', margin: '0 auto 10px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>👤</div>}
            <p style={{ fontWeight: 700, fontSize: '0.85rem', marginBottom: 4 }}>{o.full_name}</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--red-primary)', fontWeight: 600, marginBottom: 8 }}>{o.position}</p>
            <div style={{ display: 'flex', gap: 6, justifyContent: 'center' }}>
              <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(o)}>✏️</button>
              <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(o.id)}>🗑️</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
