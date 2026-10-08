import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const submit = async (event) => {
    event.preventDefault();
    setError('');

    try {
      const response = await authApi.login({ email, password });
      localStorage.setItem('acxiomcrm_token', response.data.token);
      localStorage.setItem('acxiomcrm_user', JSON.stringify(response.data.data));
      navigate('/dashboard');
    } catch (loginError) {
      setError(loginError.response?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-card">
        <div className="auth-hero">
          <div className="brand-mark big">A</div>
          <h1>AcxiomCRM</h1>
          <p>Welcome to the AcxiomCRM</p>
        </div>
        <form className="auth-form" onSubmit={submit}>
          <h2>Login</h2>
          <label>Email</label>
          <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" />
          <label>Password</label>
          <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" />
          {error ? <div className="error-box">{error}</div> : null}
          <button className="btn btn-primary" type="submit">Login</button>
          <p className="muted">No account? <Link to="/register">Register</Link></p>
        </form>
      </div>
    </div>
  );
}
