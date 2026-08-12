import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';

const BLANK_FORM = { title: '', description: '', sort_order: 0 };

export default function AdminCharter() {
  const [documents, setDocuments] = useState([]);
  const [form, setForm] = useState(BLANK_FORM);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);

  const load = () => api.get('/charter').then(r => setDocuments(Array.isArray(r.data) ? r.data : [])).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('title', form.title);
      fd.append('description', form.description);
      fd.append('sort_order', form.sort_order);
      if (file) fd.append('pdf', file);
      if (editId) await api.put(`/charter/${editId}`, fd);
      else await api.post('/charter', fd);
      toast.success(editId ? 'Document updated!' : 'Document added!');
      setForm(BLANK_FORM); setFile(null); setEditId(null);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Error saving.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this Charter document?')) return;
    await api.delete(`/charter/${id}`);
    toast.success('Deleted.'); load();
  };

  const handleEdit = (doc) => {
    setEditId(doc.id);
    setForm({ title: doc.title || '', description: doc.description || '', sort_order: doc.sort_order || 0 });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const uploadedCount = documents.filter(d => d.pdf_url).length;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">📜 Citizen's Charter</h1>
          <p className="admin-page-sub">
            Manage the 16 individual Citizen's Charter PDFs. Each document gets its own title, description, and PDF upload.
            Progress: <strong style={{ color: uploadedCount < 16 ? 'var(--red-primary)' : '#059669' }}>{uploadedCount} / 16 PDFs uploaded</strong>
          </p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: 24 }}>
        {/* Add/Edit Form */}
        <div className="admin-card">
          <h3 className="admin-card-title">{editId ? 'Edit Document' : 'Add Charter Document'}</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Document Title *</label>
              <input
                type="text" className="form-control"
                value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                placeholder="e.g. Enrollment of New Learners (Kindergarten)"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label">Short Description</label>
              <textarea
                className="form-control" rows={3}
                value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
                placeholder="Brief description of this service..."
              />
            </div>
            <div className="form-group">
              <label className="form-label">PDF File {editId ? '(leave blank to keep current)' : ''}</label>
              <input type="file" accept=".pdf" onChange={e => setFile(e.target.files[0])} />
            </div>
            <div className="form-group">
              <label className="form-label">Sort Order (1 = first)</label>
              <input type="number" className="form-control" value={form.sort_order} onChange={e => setForm(f => ({ ...f, sort_order: +e.target.value }))} />
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add Document'}</button>
              {editId && <button type="button" className="btn btn-ghost" onClick={() => { setEditId(null); setForm(BLANK_FORM); setFile(null); }}>Cancel</button>}
            </div>
          </form>
        </div>

        {/* Document List */}
        <div className="admin-card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 className="admin-card-title" style={{ margin: 0 }}>Documents ({documents.length} / 16)</h3>
            <div style={{
              fontSize: '0.8rem', fontWeight: 700,
              color: uploadedCount < 16 ? '#D97706' : '#059669',
              background: uploadedCount < 16 ? '#FEF3C7' : '#D1FAE5',
              borderRadius: 6, padding: '4px 10px'
            }}>
              {uploadedCount < 16 ? `${16 - uploadedCount} PDFs missing` : '✅ All 16 PDFs uploaded'}
            </div>
          </div>
          {documents.length === 0 ? (
            <p style={{ color: 'var(--gray-400)', fontSize: '0.88rem' }}>No charter documents yet. Add one using the form.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {documents.map((doc, i) => (
                <div key={doc.id} style={{ display: 'flex', gap: 14, padding: 14, background: 'var(--gray-50)', borderRadius: 8, border: '1px solid var(--gray-200)', alignItems: 'flex-start' }}>
                  <span style={{
                    flexShrink: 0, width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                    borderRadius: 6, background: doc.pdf_url ? 'var(--red-pale)' : '#f3f4f6',
                    color: doc.pdf_url ? 'var(--red-primary)' : 'var(--gray-400)',
                    fontWeight: 700, fontSize: '0.72rem'
                  }}>
                    {String(i + 1).padStart(2, '0')}
                  </span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, fontSize: '0.88rem', color: 'var(--gray-900)', margin: '0 0 3px' }}>{doc.title}</p>
                    {doc.description && <p style={{ fontSize: '0.78rem', color: 'var(--gray-500)', margin: '0 0 6px' }}>{doc.description}</p>}
                    {doc.pdf_url ? (
                      <a href={getImageUrl(doc.pdf_url)} target="_blank" rel="noopener noreferrer" style={{ fontSize: '0.75rem', color: 'var(--red-primary)', fontWeight: 600 }}>
                        📄 View PDF
                      </a>
                    ) : (
                      <span style={{ fontSize: '0.75rem', color: '#D97706', fontWeight: 600 }}>⚠️ No PDF uploaded</span>
                    )}
                  </div>
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(doc)}>✏️</button>
                    <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(doc.id)}>🗑️</button>
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
