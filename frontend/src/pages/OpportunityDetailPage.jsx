import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { opportunityApi } from '../services/api';

export default function OpportunityDetailPage() {
  const { id } = useParams();
  const [opportunity, setOpportunity] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadOpportunity = async () => {
      try {
        const response = await opportunityApi.get(id);
        if (active) setOpportunity(response.data.data || null);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadOpportunity();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <div className="page-stack"><section className="panel-box">Loading opportunity details...</section></div>;
  if (!opportunity) return <div className="page-stack"><section className="panel-box">Opportunity not found.</section></div>;

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>{opportunity.opportunityName}</h1>
        <p>{opportunity.opportunityId || 'N/A'} · {opportunity.stage || 'Qualification'}</p>
      </section>

      <section className="panel-box">
        <div className="detail-header-actions">
          <Link className="btn btn-outline-light" to="/opportunities">Back to opportunities</Link>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <h3>Opportunity summary</h3>
            <div className="detail-meta-grid">
              <div><strong>ID:</strong> {opportunity.opportunityId || 'N/A'}</div>
              <div><strong>Amount:</strong> {opportunity.amount ?? 'N/A'}</div>
              <div><strong>Probability:</strong> {opportunity.probability ?? '0'}%</div>
              <div><strong>Stage:</strong> {opportunity.stage || 'Qualification'}</div>
              <div><strong>Status:</strong> <span className={`status-pill ${opportunity.status === 'Won' ? 'active' : 'inactive'}`}>{opportunity.status || 'Active'}</span></div>
              <div><strong>Expected close:</strong> {opportunity.expectedCloseDate ? new Date(opportunity.expectedCloseDate).toLocaleDateString() : 'N/A'}</div>
            </div>
          </div>

          <div className="detail-card">
            <h3>Owner info</h3>
            <div className="detail-meta-grid">
              <div><strong>Assigned to:</strong> {opportunity.assignedTo ? opportunity.assignedTo.fullName || opportunity.assignedTo.email : 'Unassigned'}</div>
              <div><strong>Created:</strong> {opportunity.createdAt ? new Date(opportunity.createdAt).toLocaleDateString() : 'N/A'}</div>
              <div><strong>Weighted value:</strong> {opportunity.weightedValue ?? 'N/A'}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
