import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import {
  Elements,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js';
import axios from 'axios';
import { ArrowLeft, ShieldCheck, Lock, CreditCard, Loader2 } from 'lucide-react';
import API_BASE from '../api';

const stripePublishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

const CheckoutForm = ({ planId, planName, price }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!stripe || !elements) return;
    setProcessing(true);
    setError(null);

    try {
      const token = localStorage.getItem('token');
      const { data } = await axios.post(
        `${API_BASE}/api/payment/create-checkout-session`,
        { planId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error('Failed to get checkout URL');
      }
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Payment failed');
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <div className="payment-summary">
        <div className="plan-badge">{planName}</div>
        <div className="checkout-plan-price">${price}<span>/month</span></div>
      </div>

      <div className="secure-info">
        <ShieldCheck size={16} />
        <span>Secure encrypted payment via Stripe</span>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <button
        disabled={processing || !stripe}
        className="btn btn-green checkout-btn"
        type="submit"
      >
        {processing ? (
          <><Loader2 className="spinner" size={18} /> Processing...</>
        ) : (
          <><Lock size={16} /> Pay ${price} Now</>
        )}
      </button>

      <p className="payment-footer-text">
        By continuing, you agree to our Terms of Service and Privacy Policy. 
        Your subscription will renew automatically.
      </p>
    </form>
  );
};

const PaymentPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const query = new URLSearchParams(location.search);
  const planId = query.get('plan') || 'pro';
  
  const planDetails = {
    pro: { name: 'Developer Pro', price: '10.99' },
    business: { name: 'Business', price: '25.99' }
  };

  const currentPlan = planDetails[planId] || planDetails.pro;

  return (
    <div className="auth-container">
      <div className="auth-card checkout-card">
        <button 
          onClick={() => navigate('/pricing')}
          className="btn-ghost btn-sm back-btn"
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div className="auth-logo">
          <div className="auth-logo-icon">
            <CreditCard size={28} color="var(--accent-blue)" />
          </div>
        </div>

        <h2 className="auth-title">Complete Payment</h2>
        <p className="auth-subtitle">Finalize your upgrade to {currentPlan.name}</p>

        {!stripePromise ? (
          <div className="alert alert-error">
            Stripe is not configured. Add VITE_STRIPE_PUBLISHABLE_KEY and redeploy the frontend.
          </div>
        ) : (
          <Elements stripe={stripePromise}>
            <CheckoutForm
              planId={planId}
              planName={currentPlan.name}
              price={currentPlan.price}
            />
          </Elements>
        )}

        <div className="payment-trust-badges">
          <img src="https://upload.wikimedia.org/wikipedia/commons/b/ba/Stripe_Logo%2C_revised_2016.svg" alt="Stripe" height="20" />
          <div className="trust-divider"></div>
          <div className="secure-badge">
            <Lock size={12} />
            SSL SECURE
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentPage;
