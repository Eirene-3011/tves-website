import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl, formatDateShort } from '../../utils/helpers';

const TYPES = ['deped_order', 'memo', 'notice_of_meeting', 'procurement', 'form'];
const BLANK = { type: 'deped_order', title: '', do_number: '', school_year: '', date_issued: '' };

export default function AdminIssuances() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [typeFilter, setTypeFilter] = useState('');

  const load = () => api.get(`/issuances${typeFilter ? `?type=${typeFilter}` : ''}`).then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, [typeFilter]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      if (editId) await api.put(`/issuances/${editId}`, fd);
      else await api.post('/issuances', fd);
      toast.success('Saved!');
      setForm(BLANK); setFile(null); setEditId(null); setShowForm(false);
      load();
    } catch { toast.error('Error saving.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (item) => { setEditId(item.id); setForm({ type: item.type, title: item.title, do_number: item.do_number || '', school_year: item.school_year || '', date_issued: item.date_issued?.split('T')[0] || '' }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/issuances/${id}`); toast.success('Deleted.'); load(); };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">📢 Issuances</h1><p className="admin-page-sub">Manage DepEd Orders, memos, procurement postings, and forms.</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK); }}>{showForm ? 'Close' : '+ Add Issuance'}</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">{editId ? 'Edit Issuance' : 'Add Issuance'}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Type *</label>
                <select className="form-control" value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                  {TYPES.map(t => <option key={t} value={t}>{t.replace('_', ' ').toUpperCase()}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date Issued</label>
                <input type="date" className="form-control" value={form.date_issued} onChange={e => setForm(f => ({ ...f, date_issued: e.target.value }))} />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Title *</label>
                <input type="text" className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} required />
              </div>
              {form.type === 'deped_order' && <>
                <div className="form-group">
                  <label className="form-label">DO Number</label>
                  <input type="text" className="form-control" value={form.do_number} onChange={e => setForm(f => ({ ...f, do_number: e.target.value }))} placeholder="e.g. DO 006, s. 2026" />
                </div>
                <div className="form-group">
                  <label className="form-label">School Year</label>
                  <input type="text" className="form-control" value={form.school_year} onChange={e => setForm(f => ({ ...f, school_year: e.target.value }))} placeholder="e.g. 2025-2026" />
                </div>
              </>}
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Upload PDF / File</label>
                <input type="file" accept=".pdf,.doc,.docx,.xlsx" onChange={e => setFile(e.target.files[0])} />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {/* Type filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        <button className={`btn ${!typeFilter ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setTypeFilter('')}>All</button>
        {TYPES.map(t => <button key={t} className={`btn ${typeFilter === t ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setTypeFilter(t)}>{t.replace('_', ' ')}</button>)}
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Type</th><th>Title</th><th>DO No.</th><th>SY</th><th>Date</th><th>File</th><th>Actions</th></tr></thead>
            <tbody>
              {items.map(item => (
                <tr key={item.id}>
                  <td><span className="badge badge-red">{item.type.replace('_', ' ')}</span></td>
                  <td style={{ fontWeight: 600, maxWidth: 300, fontSize: '0.85rem' }}>{item.title}</td>
                  <td>{item.do_number || '—'}</td>
                  <td>{item.school_year || '—'}</td>
                  <td>{item.date_issued ? formatDateShort(item.date_issued) : '—'}</td>
                  <td>{item.file_url ? <a href={getImageUrl(item.file_url)} target="_blank" rel="noopener noreferrer" className="badge badge-green">📄 View</a> : '—'}</td>
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
