import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';

export default function AdminPhotos() {
  const [photos, setPhotos] = useState([]);
  const [file, setFile] = useState(null);
  const [caption, setCaption] = useState('');
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/photos').then(r => setPhotos(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select an image.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      fd.append('caption', caption);
      await api.post('/photos', fd);
      toast.success('Photo uploaded!');
      setFile(null); setCaption(''); load();
    } catch { toast.error('Error.'); }
    finally { setSaving(false); }
  };

  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/photos/${id}`); toast.success('Deleted.'); load(); };

  return (
    <div className="admin-page">
      <div className="admin-page-header"><div><h1 className="admin-page-title">📷 School Photos</h1><p className="admin-page-sub">Manage school building and campus photos.</p></div></div>
      <div style={{ display: 'grid', gridTemplateColumns: '320px 1fr', gap: 24 }}>
        <div className="admin-card">
          <h3 className="admin-card-title">Upload Photo</h3>
          <form onSubmit={handleUpload}>
            <div className="form-group"><label className="form-label">Photo *</label><input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} /></div>
            <div className="form-group"><label className="form-label">Caption</label><input type="text" className="form-control" value={caption} onChange={e => setCaption(e.target.value)} placeholder="e.g. Main Building Front" /></div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Uploading...' : '⬆ Upload'}</button>
          </form>
        </div>
        <div className="admin-card">
          <h3 className="admin-card-title">Current Photos ({photos.length})</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
            {photos.map(p => (
              <div key={p.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', border: '1px solid var(--gray-200)' }}>
                <img src={getImageUrl(p.image_url)} alt={p.caption} style={{ width: '100%', height: 110, objectFit: 'cover', display: 'block' }} />
                <div style={{ padding: '8px 10px', background: 'white' }}>
                  <p style={{ fontSize: '0.75rem', color: 'var(--gray-600)', marginBottom: 6 }}>{p.caption || '(No caption)'}</p>
                  <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)', fontSize: '0.72rem' }} onClick={() => handleDelete(p.id)}>🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
