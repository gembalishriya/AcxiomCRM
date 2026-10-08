import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { leadApi } from '../services/api';

export default function LeadsPage() {
  const [leads, setLeads] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [loading, setLoading] = useState(false);

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
    loadLeads().catch(() => setLeads([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>Leads</h1>
        <p>Lead tracking, qualification, assignment, and conversion views belong here in React.</p>
      </section>
      <section className="panel-box">
        <div className="d-flex gap-2 mb-3">
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
        </div>
        <div className="table-responsive">
          <table className="table table-striped table-hover align-middle text-light">
            <thead>
              <tr><th>Name</th><th>Source</th><th>Status</th><th>Expected Value</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5">Loading...</td></tr>
              ) : leads.length ? (
                leads.map((lead) => (
                  <tr key={lead._id}>
                    <td>{lead.leadName}</td>
                    <td>{lead.source}</td>
                    <td>{lead.status}</td>
                    <td>{lead.expectedValue}</td>
                    <td>
                      <Link className="btn btn-outline-light btn-small" to={`/leads/${lead._id}`}>View</Link>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5">No leads found.</td></tr>
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
