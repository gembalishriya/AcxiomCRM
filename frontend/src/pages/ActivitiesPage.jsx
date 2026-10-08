import React, { useEffect, useState } from 'react';
import { activityApi } from '../services/api';

export default function ActivitiesPage() {
  const [activities, setActivities] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ activityType: '', status: '' });
  const [form, setForm] = useState({ activityType: 'Call', subject: '', description: '', activityDate: '', status: 'Planned', customerId: '', leadId: '', assignedTo: '' });
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadActivities = async (page = 1, nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await activityApi.list({ page, limit: 10, ...nextFilters });
      setActivities(response.data.data || []);
      setMeta(response.data.meta || { page, totalPages: 1 });
    } catch {
      setActivities([]);
      setMeta({ page, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadActivities().catch(() => setActivities([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.subject.trim()) nextErrors.subject = 'Subject is required.';
    if (!form.activityDate) nextErrors.activityDate = 'Activity date is required.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setErrorMessage('Please correct the highlighted fields.');
      setStatusMessage('');
      return;
    }

    try {
      await activityApi.create({
        ...form,
        customerId: form.customerId || undefined,
        leadId: form.leadId || undefined,
        assignedTo: form.assignedTo || undefined
      });
      setForm({ activityType: 'Call', subject: '', description: '', activityDate: '', status: 'Planned', customerId: '', leadId: '', assignedTo: '' });
      setErrors({});
      setErrorMessage('');
      setStatusMessage('Activity created successfully.');
      await loadActivities(1);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to create activity right now.');
      setStatusMessage('');
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>Activities</h1>
        <p>Record calls, meetings, emails, and tasks against CRM records.</p>
      </section>

      {errorMessage ? <div className="error-box">{errorMessage}</div> : null}
      {statusMessage ? <div className="error-box" style={{ background: 'rgba(52, 211, 153, 0.12)', color: '#b8f3d2', borderColor: 'rgba(52, 211, 153, 0.18)' }}>{statusMessage}</div> : null}

      <section className="grid-2">
        <div className="panel-box">
          <h3>Filters</h3>
          <div className="module-form-grid">
            <select className="form-select" value={filters.activityType} onChange={(event) => setFilters({ ...filters, activityType: event.target.value })}>
              <option value="">All types</option>
              <option value="Call">Call</option>
              <option value="Meeting">Meeting</option>
              <option value="Email">Email</option>
              <option value="Task">Task</option>
            </select>
            <select className="form-select" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
              <option value="">All status</option>
              <option value="Planned">Planned</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => loadActivities(1, filters)}>Apply filters</button>
        </div>

        <div className="panel-box">
          <h3>New Activity</h3>
          <form onSubmit={handleSubmit} className="module-form-grid">
            <select className="form-select" value={form.activityType} onChange={(event) => setForm({ ...form, activityType: event.target.value })} required>
              <option value="Call">Call</option>
              <option value="Meeting">Meeting</option>
              <option value="Email">Email</option>
              <option value="Task">Task</option>
            </select>
            <div>
              <input className={`form-control ${errors.subject ? 'is-invalid' : ''}`} placeholder="Subject" value={form.subject} onChange={(event) => setForm({ ...form, subject: event.target.value })} />
              {errors.subject ? <div className="invalid-feedback d-block">{errors.subject}</div> : null}
            </div>
            <input className="form-control full-width" placeholder="Description" value={form.description} onChange={(event) => setForm({ ...form, description: event.target.value })} />
            <div>
              <input className={`form-control ${errors.activityDate ? 'is-invalid' : ''}`} type="date" value={form.activityDate} onChange={(event) => setForm({ ...form, activityDate: event.target.value })} />
              {errors.activityDate ? <div className="invalid-feedback d-block">{errors.activityDate}</div> : null}
            </div>
            <select className="form-select" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="Planned">Planned</option>
              <option value="Completed">Completed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <input className="form-control" placeholder="Customer ID (optional)" value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })} />
            <input className="form-control" placeholder="Lead ID (optional)" value={form.leadId} onChange={(event) => setForm({ ...form, leadId: event.target.value })} />
            <input className="form-control" placeholder="Assigned user ID (optional)" value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })} />
            <button className="btn btn-primary full-width" type="submit">Create activity</button>
          </form>
        </div>
      </section>

      <section className="panel-box">
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle text-light">
            <thead>
              <tr><th>ID</th><th>Date</th><th>Type</th><th>Subject</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5">Loading...</td></tr>
              ) : activities.length ? (
                activities.map((activity) => (
                  <tr key={activity._id}>
                    <td>{activity.activityId}</td>
                    <td>{new Date(activity.activityDate).toLocaleDateString()}</td>
                    <td>{activity.activityType}</td>
                    <td>{activity.subject}</td>
                    <td>{activity.status}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5">No activities found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <small className="muted">Page {meta.page} of {meta.totalPages}</small>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-light" type="button" disabled={meta.page <= 1} onClick={() => loadActivities(meta.page - 1, filters)}>Previous</button>
            <button className="btn btn-outline-light" type="button" disabled={meta.page >= meta.totalPages} onClick={() => loadActivities(meta.page + 1, filters)}>Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
