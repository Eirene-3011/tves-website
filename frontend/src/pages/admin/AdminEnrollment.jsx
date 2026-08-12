import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';

export default function AdminEnrollment() {
  const [form, setForm] = useState({});
  const [saving, setSaving] = useState(false);

  useEffect(() => { api.get('/enrollment').then(r => setForm(r.data || {})).catch(() => {}); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try { await api.put('/enrollment', form); toast.success('Saved!'); }
    catch { toast.error('Error.'); }
    finally { setSaving(false); }
  };

  return (
    <div className="admin-page">
      <div className="admin-page-header"><div><h1 className="admin-page-title">📋 Admissions & Enrollment</h1><p className="admin-page-sub">Edit the enrollment information displayed on the Admissions page.</p></div></div>
      <form onSubmit={handleSave}>
        <div className="admin-card">
          <h3 className="admin-card-title">Enrollment Details</h3>
          <div className="form-group"><label className="form-label">Enrollment Schedule</label><textarea className="form-control" rows={2} value={form.schedule || ''} onChange={e => setForm(f => ({ ...f, schedule: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Requirements (HTML supported)</label><textarea className="form-control" rows={8} value={form.requirements_richtext || ''} onChange={e => setForm(f => ({ ...f, requirements_richtext: e.target.value }))} placeholder="<ul><li>Requirement 1</li></ul>" /></div>
          <div className="form-group"><label className="form-label">Enrollment Process (HTML supported)</label><textarea className="form-control" rows={8} value={form.process_richtext || ''} onChange={e => setForm(f => ({ ...f, process_richtext: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Fees Note</label><input type="text" className="form-control" value={form.fees_note || ''} onChange={e => setForm(f => ({ ...f, fees_note: e.target.value }))} placeholder="e.g. Free / Public School" /></div>
          <div className="form-group"><label className="form-label">Contact Person</label><input type="text" className="form-control" value={form.contact_person || ''} onChange={e => setForm(f => ({ ...f, contact_person: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Contact Number</label><input type="text" className="form-control" value={form.contact_number || ''} onChange={e => setForm(f => ({ ...f, contact_number: e.target.value }))} /></div>
          <div className="form-group"><label className="form-label">Online Enrollment Link (if any)</label><input type="url" className="form-control" value={form.online_enrollment_link || ''} onChange={e => setForm(f => ({ ...f, online_enrollment_link: e.target.value }))} /></div>
        </div>
        <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>{saving ? 'Saving...' : '💾 Save Changes'}</button>
      </form>
    </div>
  );
}
