import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import CustomersPage from './pages/CustomersPage';
import CustomerDetailPage from './pages/CustomerDetailPage';
import LeadsPage from './pages/LeadsPage';
import LeadDetailPage from './pages/LeadDetailPage';
import OpportunitiesPage from './pages/OpportunitiesPage';
import OpportunityDetailPage from './pages/OpportunityDetailPage';
import FollowUpsPage from './pages/FollowUpsPage';
import ActivitiesPage from './pages/ActivitiesPage';
import UsersPage from './pages/UsersPage';
import RolesPage from './pages/RolesPage';
import ReportsPage from './pages/ReportsPage';
import AuditPage from './pages/AuditPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <Layout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'SalesExecutive']}><DashboardPage /></ProtectedRoute>} />
        <Route path="customers" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'SalesExecutive']}><CustomersPage /></ProtectedRoute>} />
        <Route path="customers/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'SalesExecutive']}><CustomerDetailPage /></ProtectedRoute>} />
        <Route path="leads" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'SalesExecutive']}><LeadsPage /></ProtectedRoute>} />
        <Route path="leads/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'SalesExecutive']}><LeadDetailPage /></ProtectedRoute>} />
        <Route path="opportunities" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'SalesExecutive']}><OpportunitiesPage /></ProtectedRoute>} />
        <Route path="opportunities/:id" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'SalesExecutive']}><OpportunityDetailPage /></ProtectedRoute>} />
        <Route path="follow-ups" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'SalesExecutive']}><FollowUpsPage /></ProtectedRoute>} />
        <Route path="activities" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'SalesExecutive']}><ActivitiesPage /></ProtectedRoute>} />
        <Route path="users" element={<ProtectedRoute allowedRoles={['Admin']}><UsersPage /></ProtectedRoute>} />
        <Route path="roles" element={<ProtectedRoute allowedRoles={['Admin']}><RolesPage /></ProtectedRoute>} />
        <Route path="reports" element={<ProtectedRoute allowedRoles={['Admin', 'Manager', 'SalesExecutive']}><ReportsPage /></ProtectedRoute>} />
        <Route path="audit-logs" element={<ProtectedRoute allowedRoles={['Admin']}><AuditPage /></ProtectedRoute>} />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
