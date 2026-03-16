import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { Lock, Settings, LayoutDashboard } from 'lucide-react';
import API_BASE from '../api';

const ResetPassword = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    setMessage('');
    setError('');
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE}/api/auth/reset-password/${token}`, { password });
      setMessage(response.data.message);
      setLoading(false);
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to reset password. Token may be invalid or expired.');
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
          <Settings size={48} color="var(--accent-blue)" />
        </div>
        <h2 className="auth-title">Create New Password</h2>
        <p className="auth-subtitle">Please enter your new password.</p>
        
        {message && <div className="alert alert-success">{message} Redirecting to login...</div>}
        {error && <div className="alert alert-error">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label">New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>
          </div>
          
          <div className="form-group">
            <label className="form-label">Confirm New Password</label>
            <div style={{ position: 'relative' }}>
              <Lock size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: 'var(--text-secondary)' }} />
              <input 
                type="password" 
                className="form-input" 
                style={{ paddingLeft: '40px' }}
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength="6"
              />
            </div>
          </div>
          
          <button type="submit" className="btn" disabled={loading || message}>
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>
        
        <div className="auth-footer" style={{ marginTop: '20px' }}>
          <Link to="/login" className="auth-link">Back to Sign In</Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPassword;
