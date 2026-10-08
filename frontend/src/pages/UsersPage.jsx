import React, { useEffect, useState } from 'react';
import { userApi } from '../services/api';

const emptyForm = {
  firstName: '',
  lastName: '',
  email: '',
  password: '',
  role: 'SalesExecutive',
  isActive: true
};

export default function UsersPage() {
  const currentUser = JSON.parse(localStorage.getItem('acxiomcrm_user') || 'null');
  const currentUserRole = currentUser?.role || 'SalesExecutive';
  const canManageUsers = currentUserRole === 'Admin';

  const [users, setUsers] = useState([]);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sortKey, setSortKey] = useState('firstName');
  const [sortDirection, setSortDirection] = useState('asc');
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.list({ page: 1, limit: 20 });
      setUsers(response.data.data || []);
    } catch {
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const sortedUsers = [...users]
    .filter((user) => {
      const matchesSearch = !search || `${user.fullName || `${user.firstName} ${user.lastName}`}`.toLowerCase().includes(search.toLowerCase()) || user.email.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || user.role === roleFilter;
      const matchesStatus = !statusFilter || (statusFilter === 'Active' ? user.isActive : !user.isActive);
      return matchesSearch && matchesRole && matchesStatus;
    })
    .sort((left, right) => {
      const direction = sortDirection === 'asc' ? 1 : -1;
      const leftValue = left[sortKey] ?? '';
      const rightValue = right[sortKey] ?? '';

      if (typeof leftValue === 'string' && typeof rightValue === 'string') {
        return leftValue.localeCompare(rightValue) * direction;
      }

      return ((Number(leftValue) || 0) - (Number(rightValue) || 0)) * direction;
    });

  const handleSort = (key) => {
    if (sortKey === key) {
      setSortDirection((previous) => (previous === 'asc' ? 'desc' : 'asc'));
      return;
    }

    setSortKey(key);
    setSortDirection('asc');
  };

  const exportUsersCsv = () => {
    const rows = [
      ['Name', 'Email', 'Role', 'Status'],
      ...sortedUsers.map((user) => [
        user.fullName || `${user.firstName} ${user.lastName}`,
        user.email || '',
        user.role || '',
        user.isActive ? 'Active' : 'Inactive'
      ])
    ];

    const csv = rows.map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'users.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  const submitUser = async (event) => {
    event.preventDefault();
    setError('');
    setSuccess('');

    if (!form.firstName || !form.lastName || !form.email || !form.password) {
      setError('Please fill in the required fields.');
      return;
    }

    try {
      await userApi.create({ ...form, email: form.email.toLowerCase() });
      setForm(emptyForm);
      setSuccess('User created successfully.');
      await loadUsers();
    } catch (createError) {
      setError(createError.response?.data?.message || 'Unable to create user.');
    }
  };

  const toggleStatus = async (user) => {
    try {
      await userApi.update(user._id, { isActive: !user.isActive });
      await loadUsers();
    } catch {
      setError('Unable to update user status.');
    }
  };

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>Users</h1>
        <p>Admin-only user administration backed by the Express API.</p>
      </section>

      <section className="panel-box">
        <div className="user-toolbar">
          <div className="toolbar-group">
            <input
              className="form-control"
              placeholder="Search users"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
            <select className="form-select" value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)}>
              <option value="">All roles</option>
              <option value="Admin">Admin</option>
              <option value="Manager">Manager</option>
              <option value="SalesExecutive">SalesExecutive</option>
            </select>
            <select className="form-select" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
              <option value="">All status</option>
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
            <select className="form-select" value={sortKey} onChange={(event) => handleSort(event.target.value)}>
              <option value="firstName">Sort by first name</option>
              <option value="lastName">Sort by last name</option>
              <option value="email">Sort by email</option>
              <option value="role">Sort by role</option>
            </select>
            <button className="btn btn-outline-light" type="button" onClick={exportUsersCsv}>Export CSV</button>
          </div>
        </div>

        {canManageUsers ? (
          <form className="module-form user-create-form" onSubmit={submitUser}>
            <div className="module-form-grid admin-form-grid">
              <input className="form-control" placeholder="First name" value={form.firstName} onChange={(event) => setForm({ ...form, firstName: event.target.value })} />
              <input className="form-control" placeholder="Last name" value={form.lastName} onChange={(event) => setForm({ ...form, lastName: event.target.value })} />
              <input className="form-control" type="email" placeholder="Email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
              <input className="form-control" type="password" placeholder="Password" value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
              <select className="form-select" value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })}>
                <option value="SalesExecutive">SalesExecutive</option>
                <option value="Manager">Manager</option>
                <option value="Admin">Admin</option>
              </select>
              <label className="checkbox-inline">
                <input type="checkbox" checked={form.isActive} onChange={(event) => setForm({ ...form, isActive: event.target.checked })} />
                Active user
              </label>
            </div>
            <div className="form-actions">
              <button className="btn btn-primary" type="submit">Add User</button>
            </div>
            {error ? <div className="error-box">{error}</div> : null}
            {success ? <div className="success-box">{success}</div> : null}
          </form>
        ) : null}
      </section>

      <section className="panel-box">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th onClick={() => handleSort('firstName')} className="sortable-column">Name</th>
                <th onClick={() => handleSort('email')} className="sortable-column">Email</th>
                <th onClick={() => handleSort('role')} className="sortable-column">Role</th>
                <th onClick={() => handleSort('isActive')} className="sortable-column">Status</th>
                {canManageUsers ? <th>Action</th> : null}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={canManageUsers ? 5 : 4}>Loading users...</td></tr>
              ) : sortedUsers.length ? (
                sortedUsers.map((user) => (
                  <tr key={user._id}>
                    <td>{user.fullName || `${user.firstName} ${user.lastName}`}</td>
                    <td>{user.email}</td>
                    <td><span className={`role-badge role-badge--${user.role}`}>{user.role}</span></td>
                    <td>
                      <span className={`status-pill ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    {canManageUsers ? (
                      <td>
                        <button className="btn btn-outline-light btn-small" type="button" onClick={() => toggleStatus(user)}>
                          {user.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </td>
                    ) : null}
                  </tr>
                ))
              ) : (
                <tr><td colSpan={canManageUsers ? 5 : 4}>No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
