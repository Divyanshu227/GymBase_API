import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Activity, Lock, Mail } from 'lucide-react';
import API_BASE from '../api';

const Register = () => {
  const [email,    setEmail]   = useState('');
  const [password, setPassword] = useState('');
  const [error,    setError]   = useState('');
  const [success,  setSuccess] = useState(false);
  const [loading,  setLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await axios.post(`${API_BASE}/api/auth/register`, { email, password });
      setSuccess(true);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed. Please try again.');
      setSuccess(false);
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

        <h2 className="auth-title">Create Account</h2>
        <p className="auth-subtitle">Join the GYMBASE_API Platform and start building.</p>

        {error   && <div className="alert alert-error">{error}</div>}
        {success && (
          <div className="alert alert-success">
            🎉 Registration successful! Please check your email to verify your account before logging in.
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label" htmlFor='email'>Email Address</label>
            <div className="input-wrapper">
              <span className="input-icon"><Mail size={17} /></span>
              <input
                id='email'
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
            <label className="form-label" htmlFor='password'>Password</label>
            <div className="input-wrapper">
              <span className="input-icon"><Lock size={17} /></span>
              <input
                id='password'
                type="password"
                className="form-input"
                placeholder="Create a strong password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn" disabled={loading || success}>
            {loading ? 'Creating Account…' : 'Create Account'}
          </button>
        </form>

        <div className="auth-footer">
          Already have an account?{' '}
          <Link to="/login" className="auth-link">Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default Register;
