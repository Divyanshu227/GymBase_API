import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, Lock, Mail } from 'lucide-react';
import API_BASE from '../api';

const Login = () => {
  const [email,    setEmail]    = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, { email, password });
      localStorage.setItem('token', response.data.token);
      console.log(response.data);
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Activity size={30} color="var(--accent-blue)" />
          </div>
        </div>

        <h2 className="auth-title">Welcome Back</h2>
        <p className="auth-subtitle">Sign in to your GymBase Developer Account</p>

        {error && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon"><Mail size={17} /></span>
              <input
                type="email"
                className="form-input"
                placeholder="developer@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <div className="form-label-row">
              <label className="form-label">Password</label>
              <Link to="/forgot-password" className="forgot-link">Forgot Password?</Link>
            </div>
            <div className="input-wrapper">
              <span className="input-icon"><Lock size={17} /></span>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Authenticating…' : 'Sign In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account?{' '}
          <Link to="/register" className="auth-link">Register</Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
