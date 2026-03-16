import React, { useEffect, useState, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import API_BASE from '../api';

const VerifyEmail = () => {
  const { token } = useParams();
  const [status,  setStatus]  = useState('loading');
  const [message, setMessage] = useState('');
  const hasFetched = useRef(false);

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        const response = await axios.get(`${API_BASE}/api/auth/verify-email/${token}`);
        setStatus('success');
        setMessage(response.data.message);
      } catch (err) {
        setStatus('error');
        setMessage(err.response?.data?.error || 'Verification failed. Token may be invalid or expired.');
      }
    };

    if (token) {
      if (!hasFetched.current) {
        hasFetched.current = true;
        verifyEmail();
      }
    } else {
      setStatus('error');
      setMessage('No verification token provided.');
    }
  }, [token]);

  return (
    <div className="auth-container">
      <div className="auth-card verify-card">
        {status === 'loading' && (
          <>
            <div className="auth-logo">
              <Loader size={44} color="var(--accent-blue)" className="spinner" />
            </div>
            <h2 className="auth-title">Verifying Email…</h2>
            <p className="auth-subtitle">Please wait while we verify your email address.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div className="auth-logo">
              <CheckCircle size={52} color="var(--accent-green)" />
            </div>
            <h2 className="auth-title">Email Verified!</h2>
            <p className="auth-subtitle">{message}</p>
            <Link to="/login" className="btn" style={{ marginTop: '8px', textDecoration: 'none' }}>
              Go to Sign In
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div className="auth-logo">
              <XCircle size={52} color="var(--accent-red)" />
            </div>
            <h2 className="auth-title">Verification Failed</h2>
            <p className="auth-subtitle" style={{ color: 'var(--accent-red)' }}>{message}</p>
            <Link to="/register" className="btn btn-outline" style={{ marginTop: '8px', textDecoration: 'none', display: 'block', textAlign: 'center' }}>
              Back to Register
            </Link>
          </>
        )}
      </div>
    </div>
  );
};

export default VerifyEmail;
