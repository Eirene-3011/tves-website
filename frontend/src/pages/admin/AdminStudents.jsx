import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const CATS = ['commendation', 'featured_student', 'accomplishment'];
const BLANK = { category: 'commendation', student_name: '', description: '', date_posted: '' };

export default function AdminStudents() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [catFilter, setCatFilter] = useState('');

  const load = () => api.get(`/students${catFilter ? `?category=${catFilter}` : ''}`).then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, [catFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      if (editId) await api.put(`/students/${editId}`, fd);
      else await api.post('/students', fd);
      toast.success('Saved!');
      setForm(BLANK); setFile(null); setEditId(null); setShowForm(false); load();
    } catch { toast.error('Error.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (s) => { setEditId(s.id); setForm({ category: s.category, student_name: s.student_name || '', description: s.description || '', date_posted: s.date_posted?.split('T')[0] || '' }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/students/${id}`); toast.success('Deleted.'); load(); };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">⭐ Students' Corner</h1><p className="admin-page-sub">Manage commendations, featured students, and accomplishments.</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK); }}>{showForm ? 'Close' : '+ Add Entry'}</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">{editId ? 'Edit Entry' : 'Add Entry'}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Category *</label>
                <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATS.map(c => <option key={c} value={c}>{c.replace('_', ' ').toUpperCase()}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date</label>
                <input type="date" className="form-control" value={form.date_posted} onChange={e => setForm(f => ({ ...f, date_posted: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Student Name</label>
                <input type="text" className="form-control" value={form.student_name} onChange={e => setForm(f => ({ ...f, student_name: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Description</label>
                <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Photo</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button className={`btn ${!catFilter ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setCatFilter('')}>All</button>
        {CATS.map(c => <button key={c} className={`btn ${catFilter === c ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setCatFilter(c)}>{c.replace('_', ' ')}</button>)}
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Category</th><th>Student Name</th><th>Description</th><th>Date</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(s => (
                <tr key={s.id}>
                  <td><span className="badge badge-gold">{s.category.replace('_', ' ')}</span></td>
                  <td style={{ fontWeight: 600 }}>{s.student_name || '—'}</td>
                  <td style={{ maxWidth: 260, fontSize: '0.82rem', color: 'var(--gray-600)' }}>{s.description?.slice(0, 80) || '—'}</td>
                  <td style={{ fontSize: '0.82rem' }}>{s.date_posted?.split('T')[0] || '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(s)}>✏️</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(s.id)}>🗑️</button>
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
