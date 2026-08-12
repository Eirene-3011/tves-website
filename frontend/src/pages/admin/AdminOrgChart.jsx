import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';

export default function AdminOrgChart() {
  const [chart, setChart] = useState(null);
  const [file, setFile] = useState(null);
  const [saving, setSaving] = useState(false);

  const load = () => api.get('/org-chart').then(r => setChart(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!file) { toast.error('Please select an image file.'); return; }
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append('image', file);
      await api.post('/org-chart', fd);
      toast.success('Org chart updated!');
      setFile(null); load();
    } catch { toast.error('Error.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">🏛️ Organizational Chart</h1><p className="admin-page-sub">Upload the school's organizational structure image.</p></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 24 }}>
        <div className="admin-card">
          <h3 className="admin-card-title">Upload New Org Chart</h3>
          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Org Chart Image *</label>
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginBottom: 8 }}>Recommended: PNG or JPG, wide format (landscape)</p>
              <input type="file" accept="image/*" onChange={e => setFile(e.target.files[0])} />
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Uploading...' : '⬆ Upload Image'}</button>
          </form>
        </div>
        <div className="admin-card">
          <h3 className="admin-card-title">Current Org Chart</h3>
          {chart?.image_url ? (
            <div>
              <img src={getImageUrl(chart.image_url)} alt="Org Chart" style={{ maxWidth: '100%', borderRadius: 8, border: '1px solid var(--gray-200)' }} />
              <p style={{ fontSize: '0.78rem', color: 'var(--gray-400)', marginTop: 8 }}>Last updated: {chart.updated_at?.split('T')[0]}</p>
            </div>
          ) : (
            <div className="alert alert-info">No org chart image uploaded yet. Upload one using the form on the left.</div>
          )}
        </div>
      </div>
    </div>
  );
}
