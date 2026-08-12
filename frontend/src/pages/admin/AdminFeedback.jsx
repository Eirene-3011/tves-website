import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const BLANK = { label: '', url: '', type: 'csm_survey' };

export default function AdminFeedback() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/feedback').then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editId) await api.put(`/feedback/${editId}`, form);
      else await api.post('/feedback', form);
      toast.success('Saved!');
      setForm(BLANK); setEditId(null); setShowForm(false); load();
    } catch { toast.error('Error.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (f) => { setEditId(f.id); setForm({ label: f.label, url: f.url || '', type: f.type }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/feedback/${id}`); toast.success('Deleted.'); load(); };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">📊 Feedback & Survey Links</h1><p className="admin-page-sub">Manage CSM Survey and Feedback form links shown on the Contact Us page.</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK); }}>{showForm ? 'Close' : '+ Add Link'}</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">{editId ? 'Edit Link' : 'Add Link'}</h3>
          <form onSubmit={handleSave}>
            <div className="form-group"><label className="form-label">Label *</label><input type="text" className="form-control" value={form.label} onChange={e => setForm(f => ({ ...f, label: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">URL</label><input type="url" className="form-control" value={form.url} onChange={e => setForm(f => ({ ...f, url: e.target.value }))} placeholder="https://forms.google.com/..." /></div>
            <div className="form-group"><label className="form-label">Type</label>
              <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="csm_survey">CSM Survey</option>
                <option value="general_feedback">General Feedback</option>
                <option value="qr_code_image">QR Code Image</option>
              </select>
            </div>
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
            <thead><tr><th>Label</th><th>Type</th><th>URL</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(f => (
                <tr key={f.id}>
                  <td style={{ fontWeight: 600 }}>{f.label}</td>
                  <td><span className="badge badge-blue">{f.type.replace('_', ' ')}</span></td>
                  <td style={{ maxWidth: 280 }}>{f.url ? <a href={f.url} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.82rem', color: 'var(--red-primary)' }}>{f.url.slice(0, 50)}...</a> : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(f)}>✏️</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(f.id)}>🗑️</button>
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
