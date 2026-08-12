import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl, formatDate } from '../../utils/helpers';

const CATS = ['monitoring', 'planning', 'committee_memo', 'contingency_plan', 'other'];
const BLANK = { title: '', category: 'other', is_public: false };

export default function AdminInternalForms() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/internal-forms').then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('category', form.category);
      fd.append('is_public', form.is_public ? 1 : 0);
      if (file) fd.append('file', file);
      if (editId) await api.put(`/internal-forms/${editId}`, fd);
      else await api.post('/internal-forms', fd);
      toast.success('Saved!');
      setForm(BLANK); setFile(null); setEditId(null); setShowForm(false); load();
    } catch { toast.error('Error.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (f) => { setEditId(f.id); setForm({ title: f.title, category: f.category, is_public: !!f.is_public }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/internal-forms/${id}`); toast.success('Deleted.'); load(); };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">🔒 Internal Forms & Memos</h1><p className="admin-page-sub">Staff-only documents. Toggle "Make Public" to promote a file to the public Issuances page.</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK); }}>{showForm ? 'Close' : '+ Upload Form'}</button>
      </div>

      <div className="alert alert-warning">⚠️ These documents are admin-only by default. Only toggle "Make Public" for documents that should appear on the public Issuances page.</div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">{editId ? 'Edit Document' : 'Upload Document'}</h3>
          <form onSubmit={handleSave}>
            <div className="form-group"><label className="form-label">Title *</label><input type="text" className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">Category</label>
              <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATS.map(c => <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>)}
              </select>
            </div>
            <div className="form-group"><label className="form-label">File</label><input type="file" accept=".pdf,.doc,.docx,.xlsx,.xls" onChange={e => setFile(e.target.files[0])} /></div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
              <input type="checkbox" id="is_public" checked={form.is_public} onChange={e => setForm(f => ({ ...f, is_public: e.target.checked }))} />
              <label htmlFor="is_public" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Make Public (show on Issuances page)</label>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Upload'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Title</th><th>Category</th><th>Status</th><th>File</th><th>Uploaded</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td style={{ fontWeight: 600 }}>{item.title}</td>
                  <td><span className="badge badge-gray">{item.category.replace('_', ' ')}</span></td>
                  <td>{item.is_public ? <span className="badge badge-green">Public</span> : <span className="badge badge-red">Admin Only</span>}</td>
                  <td>{item.file_url ? <a href={getImageUrl(item.file_url)} target="_blank" rel="noopener noreferrer" className="badge badge-blue">📄 View</a> : '—'}</td>
                  <td style={{ fontSize: '0.78rem' }}>{formatDate(item.date_uploaded)}</td>
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
    </div>
  );
}
