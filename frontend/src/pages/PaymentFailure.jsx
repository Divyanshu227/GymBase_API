import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { XCircle, AlertCircle, RefreshCw, ArrowLeft } from 'lucide-react';

const PaymentFailure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const query = new URLSearchParams(location.search);
  const plan = query.get('plan') || 'pro';

  return (
    <div className="auth-container">
      <div className="auth-card failure-card">
        <div className="failure-animation-container">
          <div className="failure-glow"></div>
          <XCircle size={80} className="failure-icon-animated" color="var(--accent-red)" />
        </div>

        <h1 className="auth-title">Payment Failed</h1>
        <p className="auth-subtitle">
          We couldn't process your payment for the {plan.charAt(0).toUpperCase() + plan.slice(1)} plan.
          Don't worry, no charges were made.
        </p>

        <div className="failure-alert">
          <AlertCircle size={20} />
          <p>Common reasons: insufficient funds, expired card, or bank security blocks.</p>
        </div>

        <div className="failure-actions">
          <button 
            onClick={() => navigate(`/payment?plan=${plan}`)}
            className="btn btn-primary w-full"
          >
            <RefreshCw size={18} /> Try Again
          </button>
          
          <button 
            onClick={() => navigate('/pricing')}
            className="btn-ghost w-full mt-4"
          >
            <ArrowLeft size={18} /> Back to Pricing
          </button>
        </div>

        <p className="failure-footer">
          If you continue to have trouble, please contact our support team.
        </p>
      </div>
    </div>
  );
};

export default PaymentFailure;
