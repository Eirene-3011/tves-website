import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

const BLANK = { question: '', answer_richtext: '', sort_order: 0 };

export default function AdminFAQs() {
  const [faqs, setFaqs] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/faqs').then(r => setFaqs(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.question) { toast.error('Question is required.'); return; }
    setSaving(true);
    try {
      if (editId) await api.put(`/faqs/${editId}`, form);
      else await api.post('/faqs', form);
      toast.success('Saved!');
      setForm(BLANK); setEditId(null); setShowForm(false);
      load();
    } catch { toast.error('Error saving.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (f) => { setEditId(f.id); setForm({ question: f.question, answer_richtext: f.answer_richtext || '', sort_order: f.sort_order || 0 }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/faqs/${id}`); toast.success('Deleted.'); load(); };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">❓ FAQs</h1><p className="admin-page-sub">{faqs.length} FAQ items. Manage questions and answers.</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK); }}>{showForm ? 'Close' : '+ Add FAQ'}</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">{editId ? 'Edit FAQ' : 'Add FAQ'}</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Question *</label>
              <input type="text" className="form-control" value={form.question} onChange={e => setForm(f => ({ ...f, question: e.target.value }))} required />
            </div>
            <div className="form-group">
              <label className="form-label">Answer (HTML supported)</label>
              <textarea className="form-control" rows={6} value={form.answer_richtext} onChange={e => setForm(f => ({ ...f, answer_richtext: e.target.value }))} />
            </div>
            <div className="form-group" style={{ width: 160 }}>
              <label className="form-label">Sort Order</label>
              <input type="number" className="form-control" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add FAQ'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>#</th><th>Question</th><th>Answer Preview</th><th>Order</th><th>Actions</th></tr></thead>
            <tbody>
              {faqs.map((f, i) => (
                <tr key={f.id}>
                  <td style={{ color: 'var(--gray-400)', fontWeight: 700 }}>{i + 1}</td>
                  <td style={{ fontWeight: 600, maxWidth: 280 }}>{f.question}</td>
                  <td style={{ maxWidth: 300, fontSize: '0.82rem', color: 'var(--gray-500)' }}>{f.answer_richtext?.replace(/<[^>]+>/g, '').slice(0, 80)}...</td>
                  <td>{f.sort_order}</td>
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
