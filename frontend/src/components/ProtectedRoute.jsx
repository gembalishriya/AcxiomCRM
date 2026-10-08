import React, { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { canAccessRoute } from '../utils/roleAccess.mjs';

export default function ProtectedRoute({ children, allowedRoles = [] }) {
  const [status, setStatus] = useState('loading');
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('acxiomcrm_token');
    if (!token) {
      setStatus('unauthorized');
      return;
    }

    authApi
      .me()
      .then((response) => {
        const nextUser = response.data.data;
        localStorage.setItem('acxiomcrm_user', JSON.stringify(nextUser));
        setUser(nextUser);
        setStatus('authorized');
      })
      .catch(() => {
        localStorage.removeItem('acxiomcrm_token');
        localStorage.removeItem('acxiomcrm_user');
        setUser(null);
        setStatus('unauthorized');
      });
  }, []);

  if (status === 'loading') {
    return <div className="page-loading">Loading...</div>;
  }

  if (status === 'unauthorized') {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !canAccessRoute(user, allowedRoles)) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}
