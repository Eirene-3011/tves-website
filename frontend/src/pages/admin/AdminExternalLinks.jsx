import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const BLANK = { label: '', url: '', sort_order: 0 };

export default function AdminExternalLinks() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/external-links').then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await api.put(`/external-links/${editId}`, form);
      else await api.post('/external-links', form);
      toast.success('Saved!');
      setForm(BLANK); setEditId(null); setShowForm(false); load();
    } catch { toast.error('Error.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (l) => { setEditId(l.id); setForm({ label: l.label, url: l.url, sort_order: l.sort_order || 0 }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/external-links/${id}`); toast.success('Deleted.'); load(); };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">🔗 External DepEd Links</h1><p className="admin-page-sub">Manage external reference links shown on the Issuances page.</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK); }}>{showForm ? 'Close' : '+ Add Link'}</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">{editId ? 'Edit Link' : 'Add Link'}</h3>
          <form onSubmit={handleSave}>
            <div className="form-group"><label className="form-label">Label *</label><input type="text" className="form-control" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required placeholder="e.g. DepEd Central Office" /></div>
            <div className="form-group"><label className="form-label">URL *</label><input type="url" className="form-control" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} required placeholder="https://www.deped.gov.ph" /></div>
            <div className="form-group"><label className="form-label">Sort Order</label><input type="number" className="form-control" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} /></div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Label</th><th>URL</th><th>Order</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(l => (
                <tr key={l.id}>
                  <td style={{ fontWeight: 600 }}>{l.label}</td>
                  <td><a href={l.url} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--red-primary)', fontSize: '0.82rem' }}>{l.url}</a></td>
                  <td>{l.sort_order}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(l)}>✏️</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(l.id)}>🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
