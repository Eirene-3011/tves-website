import React, { useState, useEffect } from 'react';
import api from '../../utils/api';
import { toast } from 'react-toastify';
import { formatDate } from '../../utils/helpers';

const BLANK = { event_name: '', start_date: '', end_date: '', is_recurring: false, category: 'general' };
const CATS = ['general', 'academic', 'holiday', 'event', 'special'];

export default function AdminCalendar() {
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState(BLANK);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const load = () => api.get('/calendar').then(r => setEvents(r.data)).catch(() => {});
  useEffect(() => { load(); }, []);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!form.event_name || !form.start_date) { toast.error('Event name and start date are required.'); return; }
    setSaving(true);
    try {
      if (editId) await api.put(`/calendar/${editId}`, form);
      else await api.post('/calendar', form);
      toast.success('Saved!');
      setForm(BLANK); setEditId(null); setShowForm(false); load();
    } catch { toast.error('Error.'); }
    finally { setSaving(false); }
  };

  const handleEdit = (ev) => { setEditId(ev.id); setForm({ event_name: ev.event_name, start_date: ev.start_date?.split('T')[0] || '', end_date: ev.end_date?.split('T')[0] || '', is_recurring: !!ev.is_recurring, category: ev.category || 'general' }); setShowForm(true); };
  const handleDelete = async (id) => { if (!confirm('Delete?')) return; await api.delete(`/calendar/${id}`); toast.success('Deleted.'); load(); };

  return (
    <div className="admin-page">
      <div className="admin-page-header">
        <div><h1 className="admin-page-title">📅 School Calendar</h1><p className="admin-page-sub">{events.length} events. Manage school year key dates.</p></div>
        <button className="btn btn-primary" onClick={() => { setShowForm(!showForm); setEditId(null); setForm(BLANK); }}>{showForm ? 'Close' : '+ Add Event'}</button>
      </div>

      {showForm && (
        <div className="admin-card" style={{ marginBottom: 24 }}>
          <h3 className="admin-card-title">{editId ? 'Edit Event' : 'Add Event'}</h3>
          <form onSubmit={handleSave}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div className="form-group" style={{ gridColumn: '1 / -1' }}>
                <label className="form-label">Event Name *</label>
                <input type="text" className="form-control" value={form.event_name} onChange={e => setForm(f => ({ ...f, event_name: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">Start Date *</label>
                <input type="date" className="form-control" value={form.start_date} onChange={e => setForm(f => ({ ...f, start_date: e.target.value }))} required />
              </div>
              <div className="form-group">
                <label className="form-label">End Date (optional)</label>
                <input type="date" className="form-control" value={form.end_date} onChange={e => setForm(f => ({ ...f, end_date: e.target.value }))} />
              </div>
              <div className="form-group">
                <label className="form-label">Category</label>
                <select className="form-control" value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {CATS.map(c => <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>)}
                </select>
              </div>
              <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 10, paddingTop: 28 }}>
                <input type="checkbox" id="recurring" checked={form.is_recurring} onChange={e => setForm(f => ({ ...f, is_recurring: e.target.checked }))} />
                <label htmlFor="recurring" style={{ fontWeight: 600, fontSize: '0.9rem', cursor: 'pointer' }}>Recurring Event</label>
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn btn-primary" disabled={saving}>{saving ? 'Saving...' : editId ? 'Update' : 'Add Event'}</button>
              <button type="button" className="btn btn-ghost" onClick={() => { setShowForm(false); setEditId(null); setForm(BLANK); }}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      <div className="admin-card" style={{ padding: 0 }}>
        <div className="table-wrapper">
          <table>
            <thead><tr><th>Event</th><th>Start Date</th><th>End Date</th><th>Category</th><th>Recurring</th><th>Actions</th></tr></thead>
            <tbody>
              {events.map(ev => (
                <tr key={ev.id}>
                  <td style={{ fontWeight: 600 }}>{ev.event_name}</td>
                  <td>{formatDate(ev.start_date)}</td>
                  <td>{ev.end_date ? formatDate(ev.end_date) : '—'}</td>
                  <td><span className="badge badge-blue">{ev.category}</span></td>
                  <td>{ev.is_recurring ? '✅ Yes' : '—'}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => handleEdit(ev)}>✏️</button>
                      <button className="btn btn-ghost btn-sm" style={{ color: 'var(--red-primary)' }} onClick={() => handleDelete(ev.id)}>🗑️</button>
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
