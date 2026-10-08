import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leadApi, userApi } from '../services/api';

const emptyForm = {
  leadCode: '',
  leadName: '',
  email: '',
  phone: '',
  companyName: '',
  source: 'Website',
  status: 'New',
  expectedValue: '',
  assignedTo: ''
};

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [users, setUsers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadUsers = async () => {
    try {
      const response = await userApi.list({ page: 1, limit: 200 });
      setUsers(response.data.data || []);
    } catch {
      setUsers([]);
    }
  };

  const loadLeads = async (page = 1, query = search, currentStatus = status) => {
    setLoading(true);
    try {
      const response = await leadApi.list({ page, limit: 10, search: query, status: currentStatus });
      setLeads(response.data.data || []);
      setMeta(response.data.meta || { page, totalPages: 1 });
    } catch {
      setLeads([]);
      setMeta({ page, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadLeads().catch(() => setLeads([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsCreateModalOpen(false);
  };

  const handleFieldChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const getAssignedUserName = (lead) => {
    if (!lead.assignedTo) return 'Unassigned';
    if (typeof lead.assignedTo === 'string') {
      const found = users.find((user) => user._id === lead.assignedTo);
      if (found) {
        return `${found.firstName || ''} ${found.lastName || ''}`.trim() || found.email;
      }
      return 'Assigned';
    }
    if (lead.assignedTo.fullName) return lead.assignedTo.fullName;
    return `${lead.assignedTo.firstName || ''} ${lead.assignedTo.lastName || ''}`.trim() || lead.assignedTo.email || 'Assigned';
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    const payload = {
      ...form,
      expectedValue: Number(form.expectedValue || 0),
      assignedTo: form.assignedTo || undefined,
      email: form.email.trim(),
      phone: form.phone.trim(),
      leadCode: form.leadCode.trim(),
      leadName: form.leadName.trim(),
      companyName: form.companyName.trim()
    };

    if (!payload.leadCode || !payload.leadName || !payload.email || !payload.phone) {
      setError('Lead code, name, email, and phone are required.');
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setError('Enter a valid email address.');
      return;
    }

    if (!/^[0-9+()\-\s]{7,20}$/.test(payload.phone)) {
      setError('Enter a valid phone number.');
      return;
    }

    if (Number(payload.expectedValue) < 0) {
      setError('Expected value cannot be negative.');
      return;
    }

    try {
      if (editingId) {
        await leadApi.update(editingId, payload);
        setSuccess('Lead updated successfully.');
      } else {
        await leadApi.create(payload);
        setSuccess('Lead created successfully.');
      }

      resetForm();
      await loadLeads(1, search, status);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to save lead.');
    }
  };

  const handleEdit = (lead) => {
    setEditingId(lead._id);
    setError('');
    setSuccess('');
    setForm({
      leadCode: lead.leadCode || '',
      leadName: lead.leadName || '',
      email: lead.email || '',
      phone: lead.phone || '',
      companyName: lead.companyName || '',
      source: lead.source || 'Website',
      status: lead.status || 'New',
      expectedValue: lead.expectedValue ?? '',
      assignedTo: lead.assignedTo && typeof lead.assignedTo === 'object' ? lead.assignedTo._id || '' : lead.assignedTo || ''
    });
  };

  const handleDelete = async (lead) => {
    const confirmed = window.confirm(`Deactivate lead ${lead.leadName}?`);
    if (!confirmed) return;

    try {
      await leadApi.remove(lead._id);
      setSuccess(`${lead.leadName} deactivated successfully.`);
      await loadLeads(meta.page, search, status);
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Unable to deactivate lead.');
    }
  };

  const handleConvert = async (lead) => {
    if (lead.status !== 'Qualified') {
      setError('Only qualified leads can be converted into a customer and opportunity.');
      return;
    }

    const confirmed = window.confirm(`Convert qualified lead ${lead.leadName} into a customer and opportunity?`);
    if (!confirmed) return;

    try {
      await leadApi.convert(lead._id);
      setSuccess('Lead converted successfully.');
      await loadLeads(meta.page, search, status);
    } catch (convertError) {
      setError(convertError.response?.data?.message || 'Unable to convert lead.');
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>Leads</h1>
        <p>Lead tracking, qualification, assignment, and conversion workflows.</p>
      </section>

      <section className="panel-box">
        <div className="toolbar-group mb-3">
          <input className="form-control" placeholder="Search leads" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="form-select" value={status} onChange={(event) => setStatus(event.target.value)}>
            <option value="">All status</option>
            <option value="New">New</option>
            <option value="Contacted">Contacted</option>
            <option value="Qualified">Qualified</option>
            <option value="Unqualified">Unqualified</option>
            <option value="Converted">Converted</option>
            <option value="Lost">Lost</option>
          </select>
          <button className="btn btn-primary" type="button" onClick={() => loadLeads(1, search, status)}>Search</button>
          <button className="btn btn-primary" type="button" onClick={() => {
            setIsCreateModalOpen(true);
            setEditingId(null);
            setForm(emptyForm);
          }}>New Lead</button>
        </div>

        {error ? <div className="error-box">{error}</div> : null}
        {success ? <div className="success-box">{success}</div> : null}

        {isCreateModalOpen || editingId ? (
          <div className="modal-backdrop" onClick={resetForm}>
            <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingId ? 'Edit lead' : 'New lead'}</h3>
                <button className="btn btn-outline-light btn-small" type="button" onClick={resetForm}>Close</button>
              </div>

              <form className="module-form" onSubmit={handleSubmit}>
                <div className="module-form-grid">
                  <input className="form-control" placeholder="Lead code" value={form.leadCode} onChange={handleFieldChange('leadCode')} />
                  <input className="form-control" placeholder="Lead name" value={form.leadName} onChange={handleFieldChange('leadName')} />
                  <input className="form-control" type="email" placeholder="Email" value={form.email} onChange={handleFieldChange('email')} />
                  <input className="form-control" placeholder="Phone" value={form.phone} onChange={handleFieldChange('phone')} />
                  <input className="form-control" placeholder="Company name" value={form.companyName} onChange={handleFieldChange('companyName')} />
                  <select className="form-select" value={form.source} onChange={handleFieldChange('source')}>
                    <option value="Website">Website</option>
                    <option value="Referral">Referral</option>
                    <option value="Social Media">Social Media</option>
                    <option value="Trade Show">Trade Show</option>
                    <option value="Cold Call">Cold Call</option>
                    <option value="Unknown">Unknown</option>
                  </select>
                  <select className="form-select" value={form.status} onChange={handleFieldChange('status')}>
                    <option value="New">New</option>
                    <option value="Contacted">Contacted</option>
                    <option value="Qualified">Qualified</option>
                    <option value="Unqualified">Unqualified</option>
                    <option value="Converted">Converted</option>
                    <option value="Lost">Lost</option>
                  </select>
                  <input className="form-control" type="number" min="0" step="0.01" placeholder="Expected value" value={form.expectedValue} onChange={handleFieldChange('expectedValue')} />
                  <select className="form-select" value={form.assignedTo} onChange={handleFieldChange('assignedTo')}>
                    <option value="">Unassigned</option>
                    {users
                      .filter((user) => ['Admin', 'Manager', 'SalesExecutive'].includes(user.role))
                      .map((user) => (
                        <option key={user._id} value={user._id}>
                          {user.firstName} {user.lastName} ({user.role})
                        </option>
                      ))}
                  </select>
                </div>

                <div className="form-actions">
                  <button className="btn btn-primary" type="submit">{editingId ? 'Save Changes' : 'Add Lead'}</button>
                  <button className="btn btn-outline-light" type="button" onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle text-light">
            <thead>
              <tr>
                <th>Name</th>
                <th>Source</th>
                <th>Status</th>
                <th>Assigned To</th>
                <th>Expected Value</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6">Loading...</td></tr>
              ) : leads.length ? (
                leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead.leadName}</td>
                    <td>{lead.source}</td>
                    <td><span className={`status-pill ${lead.status === 'Qualified' ? 'active' : lead.status === 'Converted' ? 'success' : 'inactive'}`}>{lead.status}</span></td>
                    <td>{getAssignedUserName(lead)}</td>
                    <td>{lead.expectedValue ?? 0}</td>
                    <td>
                      <div className="d-flex gap-2 flex-wrap">
                        <Link className="btn btn-outline-light btn-small" to={`/leads/${lead._id}`}>View</Link>
                        <button className="btn btn-outline-light btn-small" type="button" onClick={() => handleEdit(lead)}>Edit</button>
                        <button className="btn btn-danger btn-small" type="button" onClick={() => handleDelete(lead)}>Deactivate</button>
                        {lead.status === 'Qualified' ? (
                          <button className="btn btn-primary btn-small" type="button" onClick={() => handleConvert(lead)}>Convert</button>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="6">No leads found.</td></tr>
              )}
            </tbody>
          </table>
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <small className="muted">Page {meta.page} of {meta.totalPages}</small>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-light" type="button" disabled={meta.page <= 1} onClick={() => loadLeads(meta.page - 1, search, status)}>Previous</button>
            <button className="btn btn-outline-light" type="button" disabled={meta.page >= meta.totalPages} onClick={() => loadLeads(meta.page + 1, search, status)}>Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
