import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';

const CATEGORIES = [
  { value: 'news', label: 'News' },
  { value: 'announcement', label: 'Announcement' },
  { value: 'update', label: 'Update' },
  { value: 'event', label: 'Event' },
];

const BLANK = {
  title: '', content: '', excerpt: '',
  category: 'news', published_date: '', is_published: true, sort_order: 0
};

export default function AdminNewsAndUpdates() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [filterCat, setFilterCat] = useState('');

  const load = () => api.get('/news-updates/all').then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.title.trim()) { toast.error('Title is required.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v === true ? '1' : v === false ? '0' : v));
      if (file) fd.append('image', file);
      if (editId) await api.put(`/news-updates/${editId}`, fd);
      else await api.post('/news-updates', fd);
      toast.success(editId ? 'Updated!' : 'Post published!');
      setForm(BLANK); setFile(null); setEditId(null); setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Error saving.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      title: item.title || '', content: item.content || '', excerpt: item.excerpt || '',
      category: item.category || 'news',
      published_date: item.published_date ? item.published_date.split('T')[0] : '',
      is_published: !!item.is_published, sort_order: item.sort_order || 0
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this post?')) return;
    await api.delete(`/news-updates/${id}`);
    toast.success('Deleted.'); load();
  };

  const togglePublish = async (item) => {
    try {
      const fd = new FormData();
      const next = { ...item, is_published: item.is_published ? 0 : 1 };
      Object.entries(next).forEach(([k, v]) => { if (v !== null && v !== undefined) fd.append(k, v); });
      await api.put(`/news-updates/${item.id}`, fd);
      toast.success(next.is_published ? 'Published!' : 'Unpublished.');
      load();
    } catch { toast.error('Error updating status.'); }
  };

  const filtered = filterCat ? items.filter(i => i.category === filterCat) : items;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">📰 News & Updates</h1>
          <p className="admin-page-sub">{items.length} post{items.length !== 1 ? 's' : ''}. Manage news, announcements, and events shown on the public News page.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK); setFile(null); }}>
          {showForm ? 'Close Form' : '+ New Post'}
        </button>
      </div>

      {/* Collapsible Form */}
      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">{editId ? 'Edit Post' : 'New Post'}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Title *</label>
                <input type="text" className="form-control" value={form.title}
                  onChange={e => set('title', e.target.value)} placeholder="Post headline" required />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Excerpt / Short Summary</label>
                <textarea className="form-control" rows={2} value={form.excerpt}
                  onChange={e => set('excerpt', e.target.value)} placeholder="One or two sentence summary shown in the news listing..." />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Full Content</label>
                <textarea className="form-control" rows={6} value={form.content}
                  onChange={e => set('content', e.target.value)} placeholder="Full article content..." />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={form.category} onChange={e => set('category', e.target.value)}>
                  {CATEGORIES.map(c => <option key={c.value} value={c.value}>{c.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Date Published</label>
                <input type="date" className="form-control" value={form.published_date}
                  onChange={e => set('published_date', e.target.value)} />
              </div>
              <div className="form-group">
                <label className="form-label">Cover Image {editId ? '(leave blank to keep current)' : ''}</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
              </div>
              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input type="number" className="form-control" value={form.sort_order}
                  onChange={e => set('sort_order', e.target.value)} min="0" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1', display: 'flex', alignItems: 'center', gap: 10 }}>
                <input type="checkbox" id="is_published" checked={form.is_published}
                  onChange={e => set('is_published', e.target.checked)} />
                <label htmlFor="is_published" className="form-label" style={{ margin: 0 }}>Publish immediately (visible on public site)</label>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editId ? 'Update Post' : 'Publish Post'}
              </button>
              <button type="button" className="btn btn-ghost"
                onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); setFile(null); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Category filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        <button className={`btn ${!filterCat ? 'btn-primary' : 'btn-ghost'} btn-sm`} onClick={() => setFilterCat('')}>All</button>
        {CATEGORIES.map(c => (
          <button key={c.value}
            className={`btn ${filterCat === c.value ? 'btn-primary' : 'btn-ghost'} btn-sm`}
            onClick={() => setFilterCat(c.value)}>
            {c.label}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Cover</th>
                <th>Title</th>
                <th>Category</th>
                <th>Date</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '28px 0', fontSize: '0.88rem' }}>
                  {items.length === 0 ? 'No posts yet. Click "+ New Post" to get started.' : 'No posts in this category.'}
                </td></tr>
              ) : filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.image_url
                      ? <img src={getImageUrl(item.image_url)} alt="" style={{ width: 48, height: 34, objectFit: 'cover', borderRadius: 4 }} onError={e => e.target.style.display='none'} />
                      : <span style={{ fontSize: '1.3rem' }}>📰</span>}
                  </td>
                  <td style={{ fontWeight: 600, maxWidth: 300, fontSize: '0.88rem' }}>
                    {item.title}
                    {item.excerpt && <p style={{ fontWeight: 400, color: 'var(--gray-400)', fontSize: '0.78rem', margin: '2px 0 0', overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical' }}>{item.excerpt}</p>}
                  </td>
                  <td><span className="badge badge-red" style={{ textTransform: 'capitalize' }}>{item.category}</span></td>
                  <td style={{ fontSize: '0.83rem' }}>{item.published_date ? item.published_date.split('T')[0] : '—'}</td>
                  <td>
                    {item.is_published
                      ? <span className="badge badge-green">Published</span>
                      : <span className="badge badge-gold">Draft</span>}
                  </td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(item)} title="Edit">✏️</button>
                      <button className="btn btn-ghost btn-sm" onClick={() => togglePublish(item)}
                        title={item.is_published ? 'Unpublish' : 'Publish'}>
                        {item.is_published ? '🙈' : '👁️'}
                      </button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(item.id)} title="Delete">🗑️</button>
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
