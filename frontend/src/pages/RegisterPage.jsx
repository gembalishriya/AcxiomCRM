import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

export default function RegisterPage() {
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', role: 'SalesExecutive' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const updateField = (field) => (event) => setForm({ ...form, [field]: event.target.value });

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      await authApi.register(form);
      navigate('/login');
    } catch (registerError) {
      setError(registerError.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-hero">
          <div className="brand-mark big">A</div>
          <h1>Create Account</h1>
          <p>Secure access with role-based authorization and bcrypt password hashing.</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <h2>Register</h2>
          <label>First Name</label>
          <input value={form.firstName} onChange={updateField('firstName')} />
          <label>Last Name</label>
          <input value={form.lastName} onChange={updateField('lastName')} />
          <label>Email</label>
          <input value={form.email} onChange={updateField('email')} type="email" />
          <label>Password</label>
          <input value={form.password} onChange={updateField('password')} type="password" />
          <label>Role</label>
          <select value={form.role} onChange={updateField('role')}>
            <option value="SalesExecutive">SalesExecutive</option>
            <option value="Manager">Manager</option>
            <option value="Admin">Admin</option>
          </select>
          {error ? <div className="error-box">{error}</div> : null}
          <button className="btn btn-primary" type="submit">Create Account</button>
          <p className="muted">Already have an account? <Link to="/login">Login</Link></p>
        </form>
      </div>
    </div>
  );
}
