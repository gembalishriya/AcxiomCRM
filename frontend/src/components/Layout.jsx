import React from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { getVisibleNavItems } from '../utils/roleAccess.mjs';

export default function Layout() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('acxiomcrm_user') || 'null');
  const navItems = getVisibleNavItems(user);

  const logout = async () => {
    try {
      await authApi.logout();
    } finally {
      localStorage.removeItem('acxiomcrm_token');
      localStorage.removeItem('acxiomcrm_user');
      navigate('/login');
    }
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand-block">
          <div className="brand-mark">A</div>
          <div>
            <div className="brand-title">AcxiomCRM</div>
            <div className="brand-subtitle">Role-aware CRM</div>
          </div>
        </div>

        <nav className="nav-list">
          {navItems.map((item) => (
            <NavLink key={item.to} to={item.to} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="user-card">
          <div className="muted">Logged in as</div>
          <strong>{user?.fullName || 'User'}</strong>
          <div className="muted">{user?.role || 'SalesExecutive'}</div>
          <button className="btn btn-outline" type="button" onClick={logout}>
            Logout
          </button>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
