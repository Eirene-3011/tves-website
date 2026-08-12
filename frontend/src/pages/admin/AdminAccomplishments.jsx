import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';

const BLANK = { title: '', description: '', award_date: '', awarding_body: '', sort_order: 0 };

export default function AdminAccomplishments() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const load = () => api.get('/accomplishments').then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('image', file);
      if (editId) await api.put(`/accomplishments/${editId}`, fd);
      else await api.post('/accomplishments', fd);
      toast.success(editId ? 'Updated!' : 'Added!');
      setForm(BLANK); setFile(null); setEditId(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Error.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this accomplishment?')) return;
    await api.delete(`/accomplishments/${id}`);
    toast.success('Deleted.'); load();
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      title: item.title || '', description: item.description || '',
      award_date: item.award_date ? item.award_date.split('T')[0] : '',
      awarding_body: item.awarding_body || '', sort_order: item.sort_order || 0
    });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🏆 Accomplishments</h1>
          <p className="admin-page-sub">School-wide awards, recognitions, and milestones. These appear on the public Accomplishments page.</p>
        </div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
        {/* Form */}
        <div className="admin-card">
          <h3 className="admin-card-title">{editId ? 'Edit Accomplishment' : 'Add Accomplishment'}</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Title *</label>
              <input type="text" className="form-control" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Best School in Division" required />
            </div>
            <div className="form-group">
              <label className="form-label">Description</label>
              <textarea className="form-control" rows={3} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Brief description of the award or recognition..." />
            </div>
            <div className="form-group">
              <label className="form-label">Awarding Body</label>
              <input type="text" className="form-control" value={form.awarding_body} onChange={e => setForm(f => ({ ...f, awarding_body: e.target.value }))} placeholder="e.g. DepEd Division of General Trias City" />
            </div>
            <div className="form-group">
              <label className="form-label">Award Date</label>
              <input type="date" className="form-control" value={form.award_date} onChange={e => setForm(f => ({ ...f, award_date: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Image {editId ? '(leave blank to keep)' : ''}</label>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving…' : editId ? 'Update' : 'Add'}</button>
              {editId && <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setForm(BLANK); setFile(null); }}>Cancel</button>}
            </div>
          </form>
        </div>

        {/* List */}
        <div className="admin-card">
          <h3 className="admin-card-title">All Accomplishments ({items.length})</h3>
          {items.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', fontSize: '0.88rem' }}>No accomplishments yet. Add one!</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {items.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 14, padding: 14, background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)', alignItems: 'flex-start' }}>
                  {item.image_url && (
                    <img src={getImageUrl(item.image_url)} alt="" style={{ width: 80, height: 60, objectFit: 'cover', borderRadius: 6, flexShrink: 0 }} onError={e => e.target.style.display='none'} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.9rem', color: 'var(--gray-900)', margin: '0 0 3px' }}>{item.title}</p>
                    {item.awarding_body && <p style={{ fontSize: '0.78rem', color: 'var(--gray-600)', margin: '0 0 2px' }}>🏆 {item.awarding_body}</p>}
                    {item.award_date && <p style={{ fontSize: '0.75rem', color: 'var(--gray-400)', margin: 0 }}>📅 {item.award_date?.split('T')[0]}</p>}
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
