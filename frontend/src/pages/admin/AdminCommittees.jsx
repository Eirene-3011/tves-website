import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { getImageUrl } from '../../utils/helpers';

const BLANK_C = { committee_name: '', description: '', sort_order: 0 };
const BLANK_M = { full_name: '', role: '', contact_no: '', section_name: '' };

const PLACEHOLDER_AVATAR = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 80 80"><rect width="80" height="80" fill="%23e5e7eb"/><circle cx="40" cy="30" r="16" fill="%239ca3af"/><ellipse cx="40" cy="62" rx="24" ry="16" fill="%239ca3af"/></svg>';

// Group members by section_name, preserving order of first appearance.
// Members with no section_name are collected into a single unlabeled group.
function groupMembersBySection(members) {
  const groups = [];
  const byKey = {};
  (members || []).forEach(m => {
    const key = m.section_name || '__none__';
    if (!byKey[key]) {
      byKey[key] = { section: m.section_name || null, adviser: m.adviser_name || null, members: [] };
      groups.push(byKey[key]);
    }
    byKey[key].members.push(m);
  });
  return groups;
}

export default function AdminCommittees() {
  const [committees, setCommittees] = useState([]);
  const [form, setForm] = useState(BLANK_C);
  const [file, setFile] = useState(null);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [memberForms, setMemberForms] = useState({});
  const [memberPhotos, setMemberPhotos] = useState({}); // committeeId -> File

  const load = () => api.get('/committees').then(r => setCommittees(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append('file', file);
      if (editId) await api.put(`/committees/${editId}`, fd);
      else await api.post('/committees', fd);
      toast.success('Saved!');
      setForm(BLANK_C); setFile(null); setEditId(null); setShowForm(false); load();
    } catch { toast.error('Error.'); }
    finally { setSaving(false); }
  };

  const handleAddMember = async (committeeId) => {
    const mf = memberForms[committeeId] || BLANK_M;
    if (!mf.full_name) { toast.error('Member name required.'); return; }
    const fd = new FormData();
    fd.append('full_name', mf.full_name);
    fd.append('role', mf.role || '');
    fd.append('contact_no', mf.contact_no || '');
    fd.append('section_name', mf.section_name || '');
    if (memberPhotos[committeeId]) fd.append('photo', memberPhotos[committeeId]);
    await api.post(`/committees/${committeeId}/members`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    toast.success('Member added!');
    setMemberForms(f => ({ ...f, [committeeId]: BLANK_M }));
    setMemberPhotos(p => ({ ...p, [committeeId]: null }));
    load();
  };

  const handleUploadMemberPhoto = async (memberId, file) => {
    if (!file) return;
    const fd = new FormData();
    fd.append('photo', file);
    // We only update the photo — keep existing fields by reading from state
    const allMembers = committees.flatMap(c => c.members || []);
    const m = allMembers.find(x => x.id === memberId);
    if (!m) return;
    fd.append('full_name', m.full_name);
    fd.append('role', m.role || '');
    fd.append('contact_no', m.contact_no || '');
    fd.append('section_name', m.section_name || '');
    fd.append('adviser_name', m.adviser_name || '');
    await api.put(`/committees/members/${memberId}`, fd, { headers: { 'Content-Type': 'multipart/form-data' } });
    toast.success('Photo updated!');
    load();
  };

  const handleDeleteMember = async (id) => {
    if (!confirm('Remove member?')) return;
    await api.delete(`/committees/members/${id}`);
    toast.success('Removed.'); load();
  };

  const handleDelete = async (id) => {
    if (!confirm('Delete committee?')) return;
    await api.delete(`/committees/${id}`);
    toast.success('Deleted.'); load();
  };

  const renderMemberCard = (m) => (
    <div key={m.id} style={{ border: '1px solid var(--gray-200)', borderRadius: 8, padding: '12px 10px', textAlign: 'center', background: 'var(--gray-50)' }}>
      {/* Photo */}
      <div style={{ position: 'relative', display: 'inline-block', marginBottom: 8 }}>
        <img
          src={m.photo_url ? getImageUrl(m.photo_url) : PLACEHOLDER_AVATAR}
          alt={m.full_name}
          style={{ width: 56, height: 56, borderRadius: '50%', objectFit: 'cover', border: '2px solid var(--gray-200)' }}
          onError={e => { e.target.src = PLACEHOLDER_AVATAR; }}
        />
        {/* Upload photo button */}
        <label
          title="Upload photo"
          style={{
            position: 'absolute', bottom: -2, right: -2,
            background: 'var(--red-primary)', color: '#fff',
            borderRadius: '50%', width: 20, height: 20,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'pointer', fontSize: '0.7rem'
          }}
        >
          📷
          <input
            type="file" accept="image/*" style={{ display: 'none' }}
            onChange={e => { if (e.target.files[0]) handleUploadMemberPhoto(m.id, e.target.files[0]); }}
          />
        </label>
      </div>
      <p style={{ fontWeight: 700, fontSize: '0.78rem', color: 'var(--gray-900)', margin: '0 0 2px', lineHeight: 1.3 }}>{m.full_name}</p>
      {m.role && <p style={{ fontSize: '0.7rem', color: 'var(--gray-500)', margin: '0 0 2px' }}>{m.role}</p>}
      {m.contact_no && <p style={{ fontSize: '0.68rem', color: 'var(--gray-400)', margin: 0 }}>{m.contact_no}</p>}
      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)', fontSize: '0.7rem', marginTop: 6 }} onClick={() => handleDeleteMember(m.id)}>Remove</button>
    </div>
  );

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">👥 Committees & Councils</h1></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK_C); }}>{showForm ? 'Close' : '+ Add Committee'}</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">{editId ? 'Edit Committee' : 'Add Committee'}</h3>
          <form onSubmit={handleSave}>
            <div className="form-group"><label className="form-label">Committee Name *</label><input type="text" className="form-control" value={form.committee_name} onChange={e => setForm(f => ({ ...f, committee_name: e.target.value }))} required /></div>
            <div className="form-group"><label className="form-label">Description</label><textarea className="form-control" rows={2} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} /></div>
            <div className="form-group"><label className="form-label">Roster File (XLSX/PDF)</label><input type="file" accept=".pdf,.xlsx,.xls,.doc,.docx" onChange={e => setFile(e.target.files[0])} /></div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK_C); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {committees.map(c => {
        const sectionGroups = groupMembersBySection(c.members);
        return (
          <div key={c.id} className="admin-card" style={{ marginBottom: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid var(--gray-100)' }}>
              <h3 style={{ fontWeight: 700, fontSize: '1rem', color: 'var(--gray-900)' }}>👥 {c.committee_name}</h3>
              <div style={{ display: 'flex', gap: 8 }}>
                <button className="btn btn-ghost btn-sm" onClick={() => { setEditId(c.id); setForm({ committee_name: c.committee_name, description: c.description || '', sort_order: c.sort_order || 0 }); setShowForm(true); }}>✏️ Edit</button>
                <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(c.id)}>🗑️ Delete</button>
              </div>
            </div>

            {c.description && <p style={{ fontSize: '0.85rem', color: 'var(--gray-600)', marginBottom: 16 }}>{c.description}</p>}

            {/* Members, grouped by section */}
            <h4 style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: 10 }}>Members ({c.members?.length || 0})</h4>

            {sectionGroups.length > 0 && (
              <div style={{ marginBottom: 16 }}>
                {sectionGroups.map((g, idx) => (
                  <div key={g.section || `__none__${idx}`} style={{ marginBottom: 18 }}>
                    {g.section && (
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: 8, marginBottom: 8 }}>
                        <span style={{
                          fontSize: '0.78rem', fontWeight: 700, color: 'var(--red-primary)',
                          background: 'var(--gray-100)', padding: '3px 10px', borderRadius: 999
                        }}>{g.section}</span>
                        {g.adviser && <span style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>Adviser: {g.adviser}</span>}
                      </div>
                    )}
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 12 }}>
                      {g.members.map(renderMemberCard)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Add member form */}
            <div style={{ background: 'var(--gray-50)', borderRadius: 8, padding: '12px 14px', border: '1px solid var(--gray-200)' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--gray-700)', marginBottom: 10 }}>+ Add Member</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                <input type="text" className="form-control" style={{ flex: '1 1 150px' }} placeholder="Member name *" value={(memberForms[c.id] || BLANK_M).full_name} onChange={e => setMemberForms(f => ({ ...f, [c.id]: { ...(f[c.id] || BLANK_M), full_name: e.target.value } }))} />
                <input type="text" className="form-control" style={{ flex: '1 1 130px' }} placeholder="Role/Position" value={(memberForms[c.id] || BLANK_M).role} onChange={e => setMemberForms(f => ({ ...f, [c.id]: { ...(f[c.id] || BLANK_M), role: e.target.value } }))} />
                <input type="text" className="form-control" style={{ flex: '1 1 130px' }} placeholder="Section (optional)" value={(memberForms[c.id] || BLANK_M).section_name} onChange={e => setMemberForms(f => ({ ...f, [c.id]: { ...(f[c.id] || BLANK_M), section_name: e.target.value } }))} />
                <input type="text" className="form-control" style={{ flex: '1 1 120px' }} placeholder="Contact (optional)" value={(memberForms[c.id] || BLANK_M).contact_no} onChange={e => setMemberForms(f => ({ ...f, [c.id]: { ...(f[c.id] || BLANK_M), contact_no: e.target.value } }))} />
                <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  <label style={{ fontSize: '0.72rem', color: 'var(--gray-500)' }}>Photo (optional)</label>
                  <input type="file" accept="image/*" style={{ fontSize: '0.78rem' }}
                    onChange={e => setMemberPhotos(p => ({ ...p, [c.id]: e.target.files[0] || null }))} />
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => handleAddMember(c.id)}>+ Add</button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
