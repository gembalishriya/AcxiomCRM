import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { customerApi } from '../services/api';

const emptyForm = {
  customerCode: '',
  customerName: '',
  email: '',
  phone: '',
  companyName: '',
  address: '',
  city: '',
  state: '',
  status: 'Active'
};

export default function CustomersPage() {
  const currentUser = JSON.parse(localStorage.getItem('acxiomcrm_user') || 'null');
  const currentUserRole = currentUser?.role || 'SalesExecutive';
  const canCreateCustomer = ['Admin', 'Manager', 'SalesExecutive'].includes(currentUserRole);
  const canEditCustomer = ['Admin', 'Manager'].includes(currentUserRole);
  const canDeactivateCustomer = currentUserRole === 'Admin';

  const [customers, setCustomers] = useState([]);
  const [meta, setMeta] = useState({ page: 1, totalPages: 1 });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState('customerName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const loadCustomers = async (page = 1, query = search, status = statusFilter) => {
    setLoading(true);
    try {
      const response = await customerApi.list({ page, limit: 10, search: query, status });
      setCustomers(response.data.data || []);
      setMeta(response.data.meta || { page, totalPages: 1 });
    } catch {
      setCustomers([]);
      setMeta({ page, totalPages: 1 });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers().catch(() => setCustomers([]));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleFieldChange = (field) => (event) => {
    setForm({ ...form, [field]: event.target.value });
  };

  const resetForm = () => {
    setForm(emptyForm);
    setEditingId(null);
    setIsCreateModalOpen(false);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.customerName || !form.email || !form.phone) {
      setError('Customer name, email, and phone are required.');
      return;
    }

    try {
      if (editingId) {
        await customerApi.update(editingId, form);
        setSuccess('Customer updated successfully.');
      } else {
        await customerApi.create(form);
        setSuccess('Customer added successfully.');
      }

      resetForm();
      await loadCustomers(1, search, statusFilter);
    } catch (submitError) {
      setError(submitError.response?.data?.message || 'Unable to save customer.');
    }
  };

  const handleEdit = (customer) => {
    setEditingId(customer._id);
    setError('');
    setSuccess('');
    setForm({
      customerCode: customer.customerCode || '',
      customerName: customer.customerName || '',
      email: customer.email || '',
      phone: customer.phone || '',
      companyName: customer.companyName || '',
      address: customer.address || '',
      city: customer.city || '',
      state: customer.state || '',
      status: customer.status || 'Active'
    });
  };

  const handleStatusFilterChange = (value) => {
    setStatusFilter(value);
    loadCustomers(1, search, value);
  };

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const sortedCustomers = [...customers].sort((left, right) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    const leftValue = left[sortKey] ?? '';
    const rightValue = right[sortKey] ?? '';

    if (typeof leftValue === 'string' && typeof rightValue === 'string') {
      return leftValue.localeCompare(rightValue) * direction;
    }

    return ((Number(leftValue) || 0) - (Number(rightValue) || 0)) * direction;
  });

  const exportCustomersCsv = () => {
    const rows = [
      ['Name', 'Email', 'Phone', 'Company', 'Status', 'City', 'State'],
      ...sortedCustomers.map((customer) => [
        customer.customerName || '',
        customer.email || '',
        customer.phone || '',
        customer.companyName || '',
        customer.status || '',
        customer.city || '',
        customer.state || ''
      ])
    ];

    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleDelete = async (customer) => {
    const confirmed = window.confirm(`Deactivate customer ${customer.customerName}?`);
    if (!confirmed) return;

    try {
      await customerApi.remove(customer._id);
      setSuccess(`${customer.customerName} deactivated successfully.`);
      await loadCustomers(meta.page, search);
    } catch (deleteError) {
      setError(deleteError.response?.data?.message || 'Unable to deactivate customer.');
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>Customers</h1>
        <p>Manage your customer relationships</p>
      </section>

      <section className="panel-box">
        <div className="toolbar-group mb-3">
          <input className="form-control" placeholder="Search customers" value={search} onChange={(event) => setSearch(event.target.value)} />
          <select className="form-select" value={statusFilter} onChange={(event) => handleStatusFilterChange(event.target.value)}>
            <option value="">All status</option>
            <option value="Active">Active</option>
            <option value="Inactive">Inactive</option>
            <option value="Deactivated">Deactivated</option>
          </select>
          <select className="form-select" value={sortKey} onChange={(event) => handleSort(event.target.value)}>
            <option value="customerName">Sort by name</option>
            <option value="companyName">Sort by company</option>
            <option value="email">Sort by email</option>
            <option value="status">Sort by status</option>
          </select>
          <button className="btn btn-primary" type="button" onClick={() => loadCustomers(1, search, statusFilter)}>Search</button>
          <button className="btn btn-outline-light" type="button" onClick={exportCustomersCsv}>Export CSV</button>
          {canCreateCustomer ? (
            <button className="btn btn-primary" type="button" onClick={() => {
              setIsCreateModalOpen(true);
              setEditingId(null);
              setForm(emptyForm);
            }}>New Customer</button>
          ) : null}
        </div>

        {error ? <div className="error-box">{error}</div> : null}
        {success ? <div className="success-box">{success}</div> : null}

        {isCreateModalOpen || editingId ? (
          <div className="modal-backdrop" onClick={() => resetForm()}>
            <div className="modal-panel" onClick={(event) => event.stopPropagation()}>
              <div className="modal-header">
                <h3>{editingId ? 'Edit customer' : 'New customer'}</h3>
                <button className="btn btn-outline-light btn-small" type="button" onClick={resetForm}>Close</button>
              </div>

              <form className="module-form" onSubmit={handleSubmit}>
                <div className="module-form-grid">
                  <input className="form-control" placeholder="Customer code" value={form.customerCode} onChange={handleFieldChange('customerCode')} />
                  <input className="form-control" placeholder="Customer name" value={form.customerName} onChange={handleFieldChange('customerName')} />
                  <input className="form-control" type="email" placeholder="Email" value={form.email} onChange={handleFieldChange('email')} />
                  <input className="form-control" placeholder="Phone" value={form.phone} onChange={handleFieldChange('phone')} />
                  <input className="form-control" placeholder="Company name" value={form.companyName} onChange={handleFieldChange('companyName')} />
                  <input className="form-control" placeholder="Address" value={form.address} onChange={handleFieldChange('address')} />
                  <input className="form-control" placeholder="City" value={form.city} onChange={handleFieldChange('city')} />
                  <input className="form-control" placeholder="State" value={form.state} onChange={handleFieldChange('state')} />
                  <select className="form-select full-width" value={form.status} onChange={handleFieldChange('status')}>
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Deactivated">Deactivated</option>
                  </select>
                </div>
                <div className="form-actions">
                  <button className="btn btn-primary" type="submit">{editingId ? 'Save Changes' : 'Add Customer'}</button>
                  <button className="btn btn-outline-light" type="button" onClick={resetForm}>Cancel</button>
                </div>
              </form>
            </div>
          </div>
        ) : null}

        <div className="customer-card-grid">
          {loading ? (
            <div className="empty-state">Loading customers...</div>
          ) : sortedCustomers.length ? (
            sortedCustomers.map((customer) => (
              <div className="customer-card" key={customer._id}>
                <div className="customer-card-top">
                  <div>
                    <div className="customer-company">{customer.companyName || 'Independent Client'}</div>
                    <h3>{customer.customerName}</h3>
                  </div>
                  <span className={`status-pill ${customer.status === 'Active' ? 'active' : customer.status === 'Deactivated' ? 'inactive' : ''}`}>
                    {customer.status}
                  </span>
                </div>

                <div className="customer-meta">
                  <div><strong>Email:</strong> {customer.email}</div>
                  <div><strong>Phone:</strong> {customer.phone}</div>
                  <div><strong>Code:</strong> {customer.customerCode || 'N/A'}</div>
                  <div><strong>Location:</strong> {customer.city || customer.state ? `${customer.city || ''}${customer.city && customer.state ? ', ' : ''}${customer.state || ''}` : 'Not provided'}</div>
                </div>

                <div className="customer-card-actions">
                  <Link className="btn btn-outline-light btn-small" to={`/customers/${customer._id}`}>View</Link>
                  {canEditCustomer ? (
                    <button className="btn btn-outline-light btn-small" type="button" onClick={() => handleEdit(customer)}>Edit</button>
                  ) : null}
                  {canDeactivateCustomer ? (
                    <button className="btn btn-danger btn-small" type="button" onClick={() => handleDelete(customer)}>Deactivate</button>
                  ) : null}
                </div>
              </div>
            ))
          ) : (
            <div className="empty-state">No customers found.</div>
          )}
        </div>

        <div className="d-flex justify-content-between align-items-center">
          <small className="muted">Page {meta.page} of {meta.totalPages}</small>
          <div className="d-flex gap-2">
            <button className="btn btn-outline-light" type="button" disabled={meta.page <= 1} onClick={() => loadCustomers(meta.page - 1, search, statusFilter)}>Previous</button>
            <button className="btn btn-outline-light" type="button" disabled={meta.page >= meta.totalPages} onClick={() => loadCustomers(meta.page + 1, search, statusFilter)}>Next</button>
          </div>
        </div>
      </section>
    </div>
  );
}
