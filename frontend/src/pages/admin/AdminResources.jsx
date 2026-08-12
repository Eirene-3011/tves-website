import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';

const CATS = ['ARAL', 'KS1', 'KS2', 'Supplementary'];
const BLANK = { category: 'ARAL', title: '', description: '' };

export default function AdminResources() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [catFilter, setCatFilter] = useState('');

  const load = () => api.get(`/resources${catFilter ? `?category=${catFilter}` : ''}`).then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, [catFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      if (editId) await api.put(`/resources/${editId}`, fd);
      else await api.post('/resources', fd);
      toast.success('Saved!');
      setForm(BLANK); setFile(null); setEditId(null); setShowForm(false); load();
    } catch { toast.error('Error.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (r) => { setEditId(r.id); setForm({ category: r.category, title: r.title, description: r.description || '' }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/resources/${id}`); toast.success('Deleted.'); load(); };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">📚 Learning Resources</h1><p className="admin-page-sub">Upload and manage ARAL, KS1, KS2, and supplementary learning materials.</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK); }}>{showForm ? 'Close' : '+ Upload Resource'}</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">{editId ? 'Edit Resource' : 'Upload Resource'}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATS.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Title *</label>
                <input type="text" className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Upload File (PDF, DOCX, XLSX)</label>
                <input type="file" accept=".pdf,.doc,.docx,.xlsx,.xls" onChange={e => setFile(e.target.files[0])} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Upload'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`btn ${!catFilter ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setCatFilter('')}>All</button>
        {CATS.map(c => <button key={c} className={`btn ${catFilter === c ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setCatFilter(c)}>{c}</button>)}
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Category</th><th>Title</th><th>Description</th><th>File</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(r => (
                <tr key={r.id}>
                  <td><span className="badge badge-blue">{r.category}</span></td>
                  <td style={{ fontWeight: 600 }}>{r.title}</td>
                  <td style={{ maxWidth: 240, fontSize: '0.82rem', color: 'var(--gray-500)' }}>{r.description || '—'}</td>
                  <td>{r.file_url ? <a href={getImageUrl(r.file_url)} target="_blank" rel="noopener noreferrer" className="badge badge-green">📄 View</a> : <span className="badge badge-gray">No file</span>}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(r)}>✏️</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(r.id)}>🗑️</button>
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
