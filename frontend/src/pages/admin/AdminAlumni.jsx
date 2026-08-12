import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';

const BLANK = {
  full_name: '', batch_year: '', course_profession: '', company: '',
  location: '', bio: '', email: '', facebook_url: '', is_featured: false, sort_order: 0
};

export default function AdminAlumni() {
  const [items, setItems] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);
  const [editId, setEditId] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [search, setSearch] = useState('');

  const load = () => api.get('/alumni').then(r => setItems(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const set = (key, val) => setForm(f => ({ ...f, [key]: val }));

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.full_name.trim()) { toast.error('Full name is required.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v === true ? '1' : v === false ? '0' : v));
      if (file) fd.append('photo', file);
      if (editId) await api.put(`/alumni/${editId}`, fd);
      else await api.post('/alumni', fd);
      toast.success(editId ? 'Updated!' : 'Alumni added!');
      setForm(BLANK); setFile(null); setEditId(null); setShowForm(false);
      load();
    } catch (err) { toast.error(err.response?.data?.error || 'Error saving.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({
      full_name: item.full_name || '', batch_year: item.batch_year || '',
      course_profession: item.course_profession || '', company: item.company || '',
      location: item.location || '', bio: item.bio || '',
      email: item.email || '', facebook_url: item.facebook_url || '',
      is_featured: !!item.is_featured, sort_order: item.sort_order || 0
    });
    setShowForm(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete this alumni record?')) return;
    await api.delete(`/alumni/${id}`);
    toast.success('Deleted.'); load();
  };

  const filtered = items.filter(i =>
    `${i.full_name} ${i.batch_year} ${i.course_profession} ${i.company}`
      .toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🎓 Alumni</h1>
          <p className="admin-page-sub">{items.length} record{items.length !== 1 ? 's' : ''}. Manage alumni profiles displayed on the public Alumni page.</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK); setFile(null); }}>
          {showForm ? 'Close Form' : '+ Add Alumni'}
        </button>
      </div>

      {/* Collapsible Form */}
      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">{editId ? 'Edit Alumni' : 'Add New Alumni'}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input type="text" className="form-control" value={form.full_name}
                  onChange={e => set('full_name', e.target.value)} placeholder="e.g. Juan Dela Cruz" required />
              </div>
              <div className="form-group">
                <label className="form-label">Batch Year</label>
                <input type="number" className="form-control" value={form.batch_year}
                  onChange={e => set('batch_year', e.target.value)} placeholder="e.g. 2010" min="1970" max="2099" />
              </div>
              <div className="form-group">
                <label className="form-label">Course / Profession</label>
                <input type="text" className="form-control" value={form.course_profession}
                  onChange={e => set('course_profession', e.target.value)} placeholder="e.g. BS Nursing, Registered Nurse" />
              </div>
              <div className="form-group">
                <label className="form-label">Company / School</label>
                <input type="text" className="form-control" value={form.company}
                  onChange={e => set('company', e.target.value)} placeholder="e.g. Philippine General Hospital" />
              </div>
              <div className="form-group">
                <label className="form-label">Location</label>
                <input type="text" className="form-control" value={form.location}
                  onChange={e => set('location', e.target.value)} placeholder="e.g. Cavite City, Cavite" />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input type="email" className="form-control" value={form.email}
                  onChange={e => set('email', e.target.value)} placeholder="optional contact email" />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Facebook URL</label>
                <input type="url" className="form-control" value={form.facebook_url}
                  onChange={e => set('facebook_url', e.target.value)} placeholder="https://facebook.com/..." />
              </div>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Short Bio</label>
                <textarea className="form-control" rows={3} value={form.bio}
                  onChange={e => set('bio', e.target.value)} placeholder="Brief background or message from this alumnus..." />
              </div>
              <div className="form-group">
                <label className="form-label">Photo {editId ? '(leave blank to keep current)' : ''}</label>
                <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 24 }}>
                <input type="checkbox" id="is_featured" checked={form.is_featured}
                  onChange={e => set('is_featured', e.target.checked)} />
                <label htmlFor="is_featured" className="form-label" style={{ margin: 0 }}>Feature on Alumni page</label>
              </div>
              <div className="form-group">
                <label className="form-label">Sort Order</label>
                <input type="number" className="form-control" value={form.sort_order}
                  onChange={e => set('sort_order', e.target.value)} min="0" />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>
                {saving ? 'Saving…' : editId ? 'Update Alumni' : 'Add Alumni'}
              </button>
              <button type="button" className="btn btn-ghost"
                onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); setFile(null); }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Search + Table */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <input type="text" className="form-control" style={{ width: 260 }}
          placeholder="🔍 Search by name, batch, or profession..."
          value={search} onChange={e => setSearch(e.target.value)} />
        <span style={{ color: 'var(--gray-400)', fontSize: '0.82rem' }}>
          {filtered.length} of {items.length}
        </span>
      </div>

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead>
              <tr>
                <th>Photo</th>
                <th>Name</th>
                <th>Batch</th>
                <th>Course / Profession</th>
                <th>Company</th>
                <th>Location</th>
                <th>Featured</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr><td colSpan={8} style={{ textAlign: 'center', color: 'var(--gray-400)', padding: '28px 0', fontSize: '0.88rem' }}>
                  {items.length === 0 ? 'No alumni records yet. Click "+ Add Alumni" to get started.' : 'No results for your search.'}
                </td></tr>
              ) : filtered.map(item => (
                <tr key={item.id}>
                  <td>
                    {item.photo_url
                      ? <img src={getImageUrl(item.photo_url)} alt={item.full_name} style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} onError={e => e.target.style.display='none'} />
                      : <span style={{ fontSize: '1.4rem' }}>🎓</span>}
                  </td>
                  <td style={{ fontWeight: 600 }}>{item.full_name}</td>
                  <td>{item.batch_year || '—'}</td>
                  <td style={{ maxWidth: 200, fontSize: '0.85rem' }}>{item.course_profession || '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{item.company || '—'}</td>
                  <td style={{ fontSize: '0.85rem' }}>{item.location || '—'}</td>
                  <td>
                    {item.is_featured
                      ? <span className="badge badge-green">Yes</span>
                      : <span className="badge badge-red">No</span>}
                  </td>
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
