import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { leadApi } from '../services/api';

export default function LeadDetailPage() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadLead = async () => {
    setLoading(true);
    try {
      const response = await leadApi.get(id);
      setLead(response.data.data || null);
    } catch {
      setLead(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadLead();
  }, [id]);

  const handleConvert = async () => {
    if (!lead || lead.status !== 'Qualified') {
      setError('Only qualified leads can be converted.');
      return;
    }

    const confirmed = window.confirm(`Convert ${lead.leadName} into a customer and opportunity?`);
    if (!confirmed) return;

    try {
      setError('');
      await leadApi.convert(lead._id);
      setSuccess('Lead converted successfully.');
      await loadLead();
    } catch (convertError) {
      setError(convertError.response?.data?.message || 'Unable to convert lead.');
    }
  };

  if (loading) return <div className="page-stack"><section className="panel-box">Loading lead details...</section></div>;
  if (!lead) return <div className="page-stack"><section className="panel-box">Lead not found.</section></div>;

  const assignedTo = lead.assignedTo ? (
    lead.assignedTo.fullName || `${lead.assignedTo.firstName || ''} ${lead.assignedTo.lastName || ''}`.trim() || lead.assignedTo.email || 'Assigned'
  ) : 'Unassigned';

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>{lead.leadName}</h1>
        <p>{lead.companyName || 'No company'} · {lead.source || 'Unknown source'}</p>
      </section>

      <section className="panel-box">
        <div className="detail-header-actions">
          <Link className="btn btn-outline-light" to="/leads">Back to leads</Link>
          {lead.status === 'Qualified' ? (
            <button className="btn btn-primary" type="button" onClick={handleConvert}>Convert to Customer</button>
          ) : null}
        </div>

        {error ? <div className="error-box">{error}</div> : null}
        {success ? <div className="success-box">{success}</div> : null}

        <div className="detail-grid">
          <div className="detail-card">
            <h3>Lead information</h3>
            <div className="detail-meta-grid">
              <div><strong>Lead code:</strong> {lead.leadCode || 'N/A'}</div>
              <div><strong>Name:</strong> {lead.leadName || 'N/A'}</div>
              <div><strong>Email:</strong> {lead.email || 'N/A'}</div>
              <div><strong>Phone:</strong> {lead.phone || 'N/A'}</div>
              <div><strong>Company:</strong> {lead.companyName || 'N/A'}</div>
              <div><strong>Source:</strong> {lead.source || 'N/A'}</div>
              <div><strong>Status:</strong> <span className={`status-pill ${lead.status === 'Qualified' ? 'active' : 'inactive'}`}>{lead.status || 'New'}</span></div>
              <div><strong>Expected value:</strong> {lead.expectedValue ?? 'N/A'}</div>
            </div>
          </div>

          <div className="detail-card">
            <h3>Assignment</h3>
            <div className="detail-meta-grid">
              <div><strong>Assigned to:</strong> {assignedTo}</div>
              <div><strong>Created date:</strong> {lead.createdDate ? new Date(lead.createdDate).toLocaleDateString() : new Date(lead.createdAt).toLocaleDateString()}</div>
              <div><strong>Created by:</strong> {lead.createdBy ? lead.createdBy.fullName || lead.createdBy.email : 'System'}</div>
              <div><strong>Updated by:</strong> {lead.updatedBy ? lead.updatedBy.fullName || lead.updatedBy.email : 'System'}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
