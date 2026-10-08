import React, { useEffect, useState } from 'react';
import { userApi } from '../services/api';

const ROLE_PERMISSIONS = {
  Admin: [
    'Dashboard',
    'Customers',
    'Leads',
    'Opportunities',
    'Follow-Ups',
    'Activities',
    'Users',
    'Roles',
    'Reports',
    'Audit Logs',
    'API access'
  ],
  Manager: [
    'Dashboard',
    'Team customers',
    'Team leads',
    'Team opportunities',
    'Follow-Ups',
    'Activities',
    'Reports'
  ],
  SalesExecutive: [
    'Assigned customers',
    'Assigned leads',
    'Assigned opportunities',
    'Assigned follow-ups',
    'Assigned activities',
    'Sales dashboard/reports'
  ]
};

export default function RolesPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [savingId, setSavingId] = useState(null);
  const [message, setMessage] = useState('');

  const loadUsers = async () => {
    setLoading(true);
    try {
      const response = await userApi.list({ page: 1, limit: 50 });
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

  const handleRoleChange = async (userId, role) => {
    setSavingId(userId);
    setMessage('');

    try {
      await userApi.update(userId, { role });
      setMessage(`Role updated successfully to ${role}.`);
      await loadUsers();
    } catch (error) {
      setMessage(error.response?.data?.message || 'Unable to update role.');
    } finally {
      setSavingId(null);
    }
  };

  const roleSummary = Object.entries(ROLE_PERMISSIONS).map(([role, permissions]) => ({
    role,
    permissions,
    count: users.filter((user) => user.role === role).length
  }));

  return (
    <div className="page-stack">
      <section className="hero-panel">
        <h1>Roles & Access Control</h1>
        <p>Admin controls for business roles, permissions, and user assignment across the CRM.</p>
      </section>

      <section className="panel-box">
        <div className="role-summary-grid">
          {roleSummary.map((entry) => (
            <div className="role-summary-card" key={entry.role}>
              <div className={`role-badge role-badge--${entry.role}`}>{entry.role}</div>
              <div className="metric-value">{entry.count}</div>
              <ul className="role-permission-list">
                {entry.permissions.map((permission) => (
                  <li key={permission}>{permission}</li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </section>

      <section className="panel-box">
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Current Role</th>
                <th>Status</th>
                <th>Assign Role</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5">Loading roles...</td></tr>
              ) : users.length ? (
                users.map((user) => (
                  <tr key={user._id}>
                    <td>{user.fullName || `${user.firstName} ${user.lastName}`}</td>
                    <td>{user.email}</td>
                    <td>
                      <span className={`role-badge role-badge--${user.role}`}>{user.role}</span>
                    </td>
                    <td>
                      <span className={`status-pill ${user.isActive ? 'active' : 'inactive'}`}>
                        {user.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td>
                      <select
                        className="form-select"
                        value={user.role}
                        disabled={savingId === user._id}
                        onChange={(event) => handleRoleChange(user._id, event.target.value)}
                      >
                        <option value="Admin">Admin</option>
                        <option value="Manager">Manager</option>
                        <option value="SalesExecutive">SalesExecutive</option>
                      </select>
                    </td>
                  </tr>
                ))
              ) : (
                <tr><td colSpan="5">No users found.</td></tr>
              )}
            </tbody>
          </table>
        </div>
        {message ? <div className="success-box mt-3">{message}</div> : null}
      </section>
    </div>
  );
}
