import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { customerApi } from '../services/api';

export default function CustomerDetailPage() {
  const { id } = useParams();
  const [customer, setCustomer] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const loadCustomer = async () => {
      try {
        const response = await customerApi.get(id);
        if (active) setCustomer(response.data.data || null);
      } finally {
        if (active) setLoading(false);
      }
    };

    loadCustomer();
    return () => {
      active = false;
    };
  }, [id]);

  if (loading) return <div className="page-stack"><section className="panel-box">Loading customer details...</section></div>;
  if (!customer) return <div className="page-stack"><section className="panel-box">Customer not found.</section></div>;

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>{customer.customerName}</h1>
        <p>{customer.companyName || 'Independent customer'} · {customer.customerCode || 'N/A'}</p>
      </section>

      <section className="panel-box">
        <div className="detail-header-actions">
          <Link className="btn btn-outline-light" to="/customers">Back to customers</Link>
        </div>

        <div className="detail-grid">
          <div className="detail-card">
            <h3>Customer details</h3>
            <div className="detail-meta-grid">
              <div><strong>Customer code:</strong> {customer.customerCode || 'N/A'}</div>
              <div><strong>Email:</strong> {customer.email || 'N/A'}</div>
              <div><strong>Phone:</strong> {customer.phone || 'N/A'}</div>
              <div><strong>Company:</strong> {customer.companyName || 'N/A'}</div>
              <div><strong>Address:</strong> {customer.address || 'N/A'}</div>
              <div><strong>City:</strong> {customer.city || 'N/A'}</div>
              <div><strong>State:</strong> {customer.state || 'N/A'}</div>
              <div><strong>Status:</strong> <span className={`status-pill ${customer.status === 'Active' ? 'active' : 'inactive'}`}>{customer.status || 'Active'}</span></div>
            </div>
          </div>

          <div className="detail-card">
            <h3>Summary</h3>
            <div className="detail-meta-grid">
              <div><strong>Created:</strong> {customer.createdAt ? new Date(customer.createdAt).toLocaleDateString() : 'N/A'}</div>
              <div><strong>Updated:</strong> {customer.updatedAt ? new Date(customer.updatedAt).toLocaleDateString() : 'N/A'}</div>
              <div><strong>Active:</strong> {customer.isActive ? 'Yes' : 'No'}</div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
