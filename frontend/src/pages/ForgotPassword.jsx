import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Mail, ArrowLeft, Key } from 'lucide-react';
import API_BASE from '../api';

const ForgotPassword = () => {
  const [email,   setEmail]   = useState('');
  const [message, setMessage] = useState('');
  const [error,   setError]   = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/auth/forgot-password`, { email });
      setMessage(response.data.message);
      setLoading(false);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to send reset email.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-logo">
          <div className="auth-logo-icon">
            <Key size={28} color="var(--accent-blue)" />
          </div>
        </div>

        <h2 className="auth-title">Forgot Password</h2>
        <p className="auth-subtitle">Enter your email and we'll send you a reset link.</p>

        {message && <div className="alert alert-success">{message}</div>}
        {error   && <div className="alert alert-error">{error}</div>}

        <form onSubmit={handleSubmit}>
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

          <button type="submit" className="btn" disabled={loading}>
            {loading ? 'Sending Link…' : 'Send Reset Link'}
          </button>
        </form>

        <div className="auth-footer">
          <Link to="/login" className="auth-link" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
            <ArrowLeft size={15} /> Back to Sign In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
