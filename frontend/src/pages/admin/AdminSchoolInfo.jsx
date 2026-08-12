import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

export default function AdminSchoolInfo() {
  const [form, setForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [logoFile, setLogoFile] = useState(null);
  const [principalFile, setPrincipalFile] = useState(null);

  useEffect(() => {
    api.get('/school-info').then(r => setForm(r.data || {})).finally(() => setLoading(false));
  }, []);

  const uploadFile = async (file) => {
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.post('/upload', fd);
    return res.data.url;
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const updated = { ...form };
      if (logoFile) updated.logo_url = await uploadFile(logoFile);
      if (principalFile) updated.principal_photo_url = await uploadFile(principalFile);
      await api.put('/school-info', updated);
      setForm(updated);
      toast.success('School information updated successfully!');
    } catch (err) {
      toast.error('Failed to save. ' + (err.response?.data?.error || err.message));
    } finally {
      setSaving(false);
    }
  };

  const Field = ({ label, name, type = 'text', textarea }) => (
    <div className="form-group">
      <label className="form-label">{label}</label>
      {textarea ? (
        <textarea className="form-control" rows={3} value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} />
      ) : (
        <input type={type} className="form-control" value={form[name] || ''} onChange={e => setForm(f => ({ ...f, [name]: e.target.value }))} />
      )}
    </div>
  );

  if (loading) return <div className="loading-spinner"><div className="spinner"></div></div>;

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">🏫 School Information</h1>
          <p className="admin-page-sub">Edit general school information displayed across the website.</p>
        </div>
      </div>
      <form onSubmit={handleSave}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
          <div className="admin-card">
            <h3 className="admin-card-title">Basic Information</h3>
            <Field label="School Name" name="school_name" />
            <Field label="School ID No." name="school_id_no" />
            <Field label="School Type" name="school_type" />
            <Field label="Year Established" name="year_established" />
            <Field label="School Motto" name="motto" textarea />
          </div>
          <div className="admin-card">
            <h3 className="admin-card-title">Location & Address</h3>
            <Field label="Complete Address" name="address" textarea />
            <Field label="Region" name="region" />
            <Field label="Province" name="province" />
            <Field label="City" name="city" />
            <Field label="District / Division" name="district_division" />
          </div>
          <div className="admin-card">
            <h3 className="admin-card-title">Contact Information</h3>
            <Field label="Landline / Phone" name="landline" />
            <Field label="Mobile Number" name="mobile" />
            <Field label="Official Email" name="email" type="email" />
            <Field label="Website Domain" name="domain" />
            <Field label="Office Hours" name="office_hours" />
            <Field label="Google Maps Link" name="google_maps_link" />
          </div>
          <div className="admin-card">
            <h3 className="admin-card-title">School Head</h3>
            <Field label="Principal Name" name="principal_name" />
            <Field label="Principal Title" name="principal_title" />
            <div className="form-group">
              <label className="form-label">Principal Photo</label>
              {form.principal_photo_url && <img src={form.principal_photo_url} alt="Principal" style={{ width: 80, height: 100, objectFit: 'cover', borderRadius: 8, marginBottom: 8, display: 'block' }} />}
              <input type="file" accept="image/*" onChange={e => setPrincipalFile(e.target.files[0])} />
            </div>
          </div>
          <div className="admin-card">
            <h3 className="admin-card-title">Social Media</h3>
            <Field label="Facebook URL" name="facebook_url" />
            <Field label="YouTube URL" name="youtube_url" />
            <Field label="Instagram URL" name="instagram_url" />
            <Field label="TikTok URL" name="tiktok_url" />
          </div>
          <div className="admin-card">
            <h3 className="admin-card-title">Logo</h3>
            <div className="form-group">
              <label className="form-label">School Logo</label>
              {form.logo_url && <img src={form.logo_url} alt="Logo" style={{ width: 80, height: 80, objectFit: 'contain', marginBottom: 8, display: 'block' }} />}
              <input type="file" accept="image/*" onChange={e => setLogoFile(e.target.files[0])} />
            </div>
          </div>
        </div>
        <div style={{ marginTop: 24 }}>
          <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
            {saving ? 'Saving...' : '💾 Save Changes'}
          </button>
        </div>
      </form>
    </div>
  );
}
