import React, { useEffect, useState } from 'react';
import { followUpApi } from '../services/api';

export default function FollowUpsPage() {
  const [followUps, setFollowUps] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ status: '', search: '' });
  const [form, setForm] = useState({ followUpDate: '', followUpType: '', remarks: '', status: 'Planned', customerId: '', leadId: '', assignedTo: '' });
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadFollowUps = async (page = 1, nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await followUpApi.list({ page, limit: 10, ...nextFilters });
      setFollowUps(response.data.data || []);
      setMeta(response.data.meta || { page, totalPages: 1 });
    } catch {
      setFollowUps([]);
      setMeta({ page, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadFollowUps().catch(() => setFollowUps([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.followUpDate) nextErrors.followUpDate = 'Follow-up date is required.';
    if (!form.followUpType.trim()) nextErrors.followUpType = 'Follow-up type is required.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setErrorMessage('Please correct the highlighted fields.');
      setStatusMessage('');
      return;
    }

    try {
      await followUpApi.create({
        ...form,
        customerId: form.customerId || undefined,
        leadId: form.leadId || undefined,
        assignedTo: form.assignedTo || undefined
      });
      setForm({ followUpDate: '', followUpType: '', remarks: '', status: 'Planned', customerId: '', leadId: '', assignedTo: '' });
      setErrors({});
      setErrorMessage('');
      setStatusMessage('Follow-up scheduled successfully.');
      await loadFollowUps(1);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to create follow-up right now.');
      setStatusMessage('');
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>Follow-Ups</h1>
        <p>Plan and track follow-up work against customers and leads.</p>
      </section>

      {errorMessage ? <div className="error-box">{errorMessage}</div> : null}
      {statusMessage ? <div className="error-box" style={{ background: 'rgba(52, 211, 153, 0.12)', color: '#b8f3d2', borderColor: 'rgba(52, 211, 153, 0.18)' }}>{statusMessage}</div> : null}

      <section className="grid-2">
        <div className="panel-box">
          <h3>Filters</h3>
          <div className="module-form-grid">
            <input className="form-control" placeholder="Search" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
            <select className="form-select" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
              <option value="">All status</option>
              <option value="Planned">Planned</option>
              <option value="Completed">Completed</option>
              <option value="Missed">Missed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => loadFollowUps(1, filters)}>Apply filters</button>
        </div>

        <div className="panel-box">
          <h3>New Follow-Up</h3>
          <form onSubmit={handleSubmit} className="module-form-grid">
            <div>
              <input className={`form-control ${errors.followUpDate ? 'is-invalid' : ''}`} type="date" value={form.followUpDate} onChange={(event) => setForm({ ...form, followUpDate: event.target.value })} />
              {errors.followUpDate ? <div className="invalid-feedback d-block">{errors.followUpDate}</div> : null}
            </div>
            <div>
              <input className={`form-control ${errors.followUpType ? 'is-invalid' : ''}`} placeholder="Follow-up type" value={form.followUpType} onChange={(event) => setForm({ ...form, followUpType: event.target.value })} />
              {errors.followUpType ? <div className="invalid-feedback d-block">{errors.followUpType}</div> : null}
            </div>
            <select className="form-select" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="Planned">Planned</option>
              <option value="Completed">Completed</option>
              <option value="Missed">Missed</option>
              <option value="Cancelled">Cancelled</option>
            </select>
            <input className="form-control full-width" placeholder="Remarks" value={form.remarks} onChange={(event) => setForm({ ...form, remarks: event.target.value })} />
            <input className="form-control" placeholder="Customer ID (optional)" value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })} />
            <input className="form-control" placeholder="Lead ID (optional)" value={form.leadId} onChange={(event) => setForm({ ...form, leadId: event.target.value })} />
            <input className="form-control" placeholder="Assigned user ID (optional)" value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })} />
            <button className="btn btn-primary full-width" type="submit">Create follow-up</button>
          </form>
        </div>
      </section>

      <section className="panel-box">
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle text-light">
            <thead>
              <tr><th>ID</th><th>Date</th><th>Type</th><th>Status</th><th>Remarks</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5">Loading...</td></tr>
              ) : followUps.length ? (
                followUps.map((followUp) => (
                  <tr key={followUp._id}>
                    <td>{followUp.followUpId}</td>
                    <td>{new Date(followUp.followUpDate).toLocaleDateString()}</td>
                    <td>{followUp.followUpType}</td>
                    <td>{followUp.status}</td>
                    <td>{followUp.remarks}</td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5">No follow-ups found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <small className="muted">Page {meta.page} of {meta.totalPages}</small>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-light" type="button" disabled={meta.page <= 1} onClick={() => loadFollowUps(meta.page - 1, filters)}>Previous</button>
            <button className="btn btn-outline-light" type="button" disabled={meta.page >= meta.totalPages} onClick={() => loadFollowUps(meta.page + 1, filters)}>Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
