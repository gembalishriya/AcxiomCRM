import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { leadApi } from '../services/api';

export default function LeadDetailPage() {
  const { id } = useParams();
  const [lead, setLead] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadLead = async () => {
      try {
        const response = await leadApi.get(id);
        if (active) setLead(response.data.data || null);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadLead();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <div className="page-stack"><section className="panel-box">Loading lead details...</section></div>;
  if (!lead) return <div className="page-stack"><section className="panel-box">Lead not found.</section></div>;

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>{lead.leadName}</h1>
        <p>{lead.companyName || 'No company'} · {lead.source || 'Unknown source'}</p>
      </section>

      <section className="panel-box">
        <div className="detail-header-actions">
          <Link className="btn btn-outline-light" to="/leads">Back to leads</Link>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <h3>Lead information</h3>
            <div className="detail-meta-grid">
              <div><strong>Name:</strong> {lead.leadName || 'N/A'}</div>
              <div><strong>Email:</strong> {lead.email || 'N/A'}</div>
              <div><strong>Phone:</strong> {lead.phone || 'N/A'}</div>
              <div><strong>Source:</strong> {lead.source || 'N/A'}</div>
              <div><strong>Status:</strong> <span className={`status-pill ${lead.status === 'Qualified' ? 'active' : 'inactive'}`}>{lead.status || 'New'}</span></div>
              <div><strong>Expected value:</strong> {lead.expectedValue ?? 'N/A'}</div>
            </div>
          </div>

          <div className="detail-card">
            <h3>Follow-up info</h3>
            <div className="detail-meta-grid">
              <div><strong>Assigned to:</strong> {lead.assignedTo ? lead.assignedTo.fullName || lead.assignedTo.email : 'Unassigned'}</div>
              <div><strong>Next follow-up:</strong> {lead.nextFollowUp ? new Date(lead.nextFollowUp).toLocaleString() : 'Not scheduled'}</div>
              <div><strong>Created:</strong> {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
