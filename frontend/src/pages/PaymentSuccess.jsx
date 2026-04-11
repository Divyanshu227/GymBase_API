import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { CheckCircle2, ArrowRight, Sparkles, Loader2, AlertCircle } from 'lucide-react';
import axios from 'axios';
import API_BASE from '../api';

const PaymentSuccess = () => {
  const [verifying, setVerifying] = React.useState(true);
  const [error, setError] = React.useState(null);
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const sessionId = query.get('session_id');
  const plan = query.get('plan') || 'Pro';

  React.useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId) {
        setVerifying(false);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        await axios.get(`${API_BASE}/api/payment/confirm-payment/${sessionId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (err) {
        console.error('Failed to confirm payment:', err);
        setError('We couldn\'t verify your payment. Please contact support if your account isn\'t upgraded.');
      } finally {
        setVerifying(false);
      }
    };

    confirmPayment();
  }, [sessionId]);

  if (verifying) {
    return (
      <div className="auth-container">
        <div className="auth-card success-card">
          <Loader2 size={60} className="spinner" color="var(--accent-blue)" style={{ margin: '0 auto 20px' }} />
          <h2 className="auth-title">Verifying Payment...</h2>
          <p className="auth-subtitle">Just a moment while we upgrade your account.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card success-card">
        <div className="success-animation-container">
          <div className="success-glow"></div>
          <CheckCircle2 size={80} className="success-icon-animated" color="var(--accent-green)" />
        </div>

        <h1 className="auth-title">{error ? 'Payment Issue' : 'Payment Successful!'}</h1>
        <p className="auth-subtitle">
          {error ? error : (
            <>Welcome to the <strong>{plan.charAt(0).toUpperCase() + plan.slice(1)}</strong> club. Your account has been upgraded successfully.</>
          )}
        </p>

        {!error && (
          <div className="success-details">
            <div className="success-detail-item">
              <Sparkles size={18} color="var(--accent-yellow)" />
              <span>All premium features are now unlocked</span>
            </div>
            <div className="success-detail-item">
              <CheckCircle2 size={18} color="var(--accent-green)" />
              <span>API limits have been increased</span>
            </div>
          </div>
        )}

        {error && (
          <div className="failure-alert">
            <AlertCircle size={20} />
            <p>Verification failed, but your payment might still have gone through. Check your email for a receipt.</p>
          </div>
        )}

        <div className="success-actions">
          <button 
            onClick={() => navigate('/dashboard')}
            className="btn btn-green w-full success-btn"
          >
            Go to Dashboard <ArrowRight size={18} />
          </button>
        </div>

        <p className="success-footer">
          A receipt has been sent to your email. You can also download it from your dashboard.
        </p>
      </div>
    </div>
  );
};

export default PaymentSuccess;
