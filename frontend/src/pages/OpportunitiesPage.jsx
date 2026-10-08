import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { opportunityApi } from '../services/api';

export default function OpportunitiesPage() {
  const [opportunities, setOpportunities] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [filters, setFilters] = useState({ search: '', stage: '', status: '' });
  const [form, setForm] = useState({ opportunityName: '', amount: '', probability: '25', expectedCloseDate: '', stage: 'Qualification', status: 'Active', customerId: '', leadId: '', assignedTo: '' });
  const [errors, setErrors] = useState({});
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const loadOpportunities = async (page = 1, nextFilters = filters) => {
    setLoading(true);
    try {
      const response = await opportunityApi.list({ page, limit: 10, ...nextFilters });
      setOpportunities(response.data.data || []);
      setMeta(response.data.meta || { page, totalPages: 1 });
    } catch {
      setOpportunities([]);
      setMeta({ page, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOpportunities().catch(() => setOpportunities([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    const nextErrors = {};
    if (!form.opportunityName.trim()) nextErrors.opportunityName = 'Opportunity name is required.';
    if (!form.amount || Number(form.amount) <= 0) nextErrors.amount = 'Amount must be greater than 0.';
    if (Number(form.probability) < 0 || Number(form.probability) > 100) nextErrors.probability = 'Probability must be between 0 and 100.';
    if (!form.expectedCloseDate) nextErrors.expectedCloseDate = 'Expected close date is required.';
    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      setErrorMessage('Please correct the highlighted fields.');
      setStatusMessage('');
      return;
    }

    try {
      await opportunityApi.create({
        ...form,
        amount: Number(form.amount),
        probability: Number(form.probability),
        customerId: form.customerId || undefined,
        leadId: form.leadId || undefined,
        assignedTo: form.assignedTo || undefined
      });
      setForm({ opportunityName: '', amount: '', probability: '25', expectedCloseDate: '', stage: 'Qualification', status: 'Active', customerId: '', leadId: '', assignedTo: '' });
      setErrors({});
      setErrorMessage('');
      setStatusMessage('Opportunity created successfully.');
      await loadOpportunities(1);
    } catch (error) {
      setErrorMessage(error?.response?.data?.message || 'Unable to create opportunity right now.');
      setStatusMessage('');
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>Opportunities</h1>
        <p>Track stage, value, and close dates with live API data.</p>
      </section>

      {errorMessage ? <div className="error-box">{errorMessage}</div> : null}
      {statusMessage ? <div className="error-box" style={{ background: 'rgba(52, 211, 153, 0.12)', color: '#b8f3d2', borderColor: 'rgba(52, 211, 153, 0.18)' }}>{statusMessage}</div> : null}

      <section className="grid-2">
        <div className="panel-box">
          <h3>Filters</h3>
          <div className="module-form-grid">
            <input className="form-control" placeholder="Search" value={filters.search} onChange={(event) => setFilters({ ...filters, search: event.target.value })} />
            <select className="form-select" value={filters.stage} onChange={(event) => setFilters({ ...filters, stage: event.target.value })}>
              <option value="">All stages</option>
              <option value="Qualification">Qualification</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
            <select className="form-select full-width" value={filters.status} onChange={(event) => setFilters({ ...filters, status: event.target.value })}>
              <option value="">All status</option>
              <option value="Active">Active</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <button className="btn btn-primary" type="button" onClick={() => loadOpportunities(1, filters)}>Apply filters</button>
        </div>

        <div className="panel-box">
          <h3>New Opportunity</h3>
          <form onSubmit={handleSubmit} className="module-form-grid">
            <div>
              <input className={`form-control ${errors.opportunityName ? 'is-invalid' : ''}`} placeholder="Opportunity name" value={form.opportunityName} onChange={(event) => setForm({ ...form, opportunityName: event.target.value })} />
              {errors.opportunityName ? <div className="invalid-feedback d-block">{errors.opportunityName}</div> : null}
            </div>
            <div>
              <input className={`form-control ${errors.amount ? 'is-invalid' : ''}`} placeholder="Amount" type="number" min="0" value={form.amount} onChange={(event) => setForm({ ...form, amount: event.target.value })} />
              {errors.amount ? <div className="invalid-feedback d-block">{errors.amount}</div> : null}
            </div>
            <div>
              <input className={`form-control ${errors.probability ? 'is-invalid' : ''}`} placeholder="Probability" type="number" min="0" max="100" value={form.probability} onChange={(event) => setForm({ ...form, probability: event.target.value })} />
              {errors.probability ? <div className="invalid-feedback d-block">{errors.probability}</div> : null}
            </div>
            <div>
              <input className={`form-control ${errors.expectedCloseDate ? 'is-invalid' : ''}`} type="date" value={form.expectedCloseDate} onChange={(event) => setForm({ ...form, expectedCloseDate: event.target.value })} />
              {errors.expectedCloseDate ? <div className="invalid-feedback d-block">{errors.expectedCloseDate}</div> : null}
            </div>
            <select className="form-select" value={form.stage} onChange={(event) => setForm({ ...form, stage: event.target.value })}>
              <option value="Qualification">Qualification</option>
              <option value="Proposal">Proposal</option>
              <option value="Negotiation">Negotiation</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
            </select>
            <select className="form-select" value={form.status} onChange={(event) => setForm({ ...form, status: event.target.value })}>
              <option value="Active">Active</option>
              <option value="Won">Won</option>
              <option value="Lost">Lost</option>
              <option value="Inactive">Inactive</option>
            </select>
            <input className="form-control" placeholder="Customer ID (optional)" value={form.customerId} onChange={(event) => setForm({ ...form, customerId: event.target.value })} />
            <input className="form-control" placeholder="Lead ID (optional)" value={form.leadId} onChange={(event) => setForm({ ...form, leadId: event.target.value })} />
            <input className="form-control" placeholder="Assigned user ID (optional)" value={form.assignedTo} onChange={(event) => setForm({ ...form, assignedTo: event.target.value })} />
            <button className="btn btn-primary full-width" type="submit">Create opportunity</button>
          </form>
        </div>
      </section>

      <section className="panel-box">
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle text-light">
            <thead>
              <tr><th>ID</th><th>Name</th><th>Stage</th><th>Amount</th><th>Probability</th><th>Status</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6">Loading...</td></tr>
              ) : opportunities.length ? (
                opportunities.map((opportunity) => (
                  <tr key={opportunity._id}>
                    <td>{opportunity.opportunityId}</td>
                    <td>{opportunity.opportunityName}</td>
                    <td>{opportunity.stage}</td>
                    <td>{opportunity.amount}</td>
                    <td>{opportunity.probability}%</td>
                    <td>{opportunity.status}</td>
                    <td>
                      <Link className="btn btn-outline-light btn-small" to={`/opportunities/${opportunity._id}`}>View</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="7">No opportunities found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <div className="d-flex justify-content-between align-items-center">
          <small className="muted">Page {meta.page} of {meta.totalPages}</small>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-light" type="button" disabled={meta.page <= 1} onClick={() => loadOpportunities(meta.page - 1, filters)}>Previous</button>
            <button className="btn btn-outline-light" type="button" disabled={meta.page >= meta.totalPages} onClick={() => loadOpportunities(meta.page + 1, filters)}>Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
