import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Check,
  ArrowLeft,
  HelpCircle,
  Sparkles
} from 'lucide-react';

const Pricing = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(null); // stores planId being loaded
  const [error, setError] = useState('');

  const handleUpgrade = async (planId) => {
    if (planId === 'free') {
      navigate('/dashboard');
      return;
    }

    setLoading(planId);
    setError('');

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      navigate(`/payment?plan=${planId}`);
    } catch (err) {
      console.error('Payment Error:', err);
      setError(err.response?.data?.error || 'Failed to initiate payment. Please try again.');
    } finally {
      setLoading(null);
    }
  };

  const plans = [
    {
      id: 'free',
      name: 'Free',
      price: '$0',
      period: 'forever',
      description: 'Perfect for development and testing your integration.',
      features: [
        '50 API calls per day',
        '500 API calls per month',
        'Basic Exercise Database',
        'Community Support',
        'Single API Key'
      ],
      cta: 'Current Plan',
      highlight: false,
      recommended: false,
      style: 'blue'
    },
    {
      id: 'pro',
      name: 'Developer Pro',
      price: '$10.99',
      period: 'per month',
      description: 'Ideal for small projects and active development.',
      features: [
        '500 API calls per day',
        '5,000 API calls per month',
        'Full Exercise Database',
        'Priority Email Support',
        'Up to 3 API Keys',
        'Advanced Analytics'
      ],
      cta: 'Upgrade to Pro',
      highlight: true,
      recommended: true,
      style: 'green'
    },
    {
      id: 'business',
      name: 'Business',
      price: '$25.99',
      period: 'per month',
      description: 'Scale without limits and build professional apps.',
      features: [
        'Unlimited API calls',
        'Unlimited Daily requests',
        'Full Exercise Database',
        'Real-time Support',
        'Unlimited API Keys',
        'SLA Guarantee',
        'Custom Endpoints'
      ],
      cta: 'Go Unlimited',
      highlight: false,
      recommended: false,
      style: 'purple'
    }
  ];

  return (
    <div className="pricing-portal-layout">
      <div className="pricing-content">
        <div className="pricing-header">
          <button
            onClick={() => navigate('/dashboard')}
            className="btn btn-ghost btn-sm"
            style={{ marginBottom: '24px' }}
          >
            <ArrowLeft size={16} /> Back to Dashboard
          </button>

          <h1 className="technical-title" style={{ fontSize: '56px', textAlign: 'center' }}>
            Choose Your <span className="highlight-text">API Plan</span>
          </h1>
          <p className="hero-subtitle-technical" style={{ textAlign: 'center', margin: '0 auto 40px' }}>
            Flexible pricing built for developers. Scale your fitness application with the most comprehensive gym database.
          </p>
          {error && (
            <div className="alert alert-error" style={{ maxWidth: '600px', margin: '24px auto 0' }}>
              {error}
            </div>
          )}
        </div>

        <div className="stats-grid pricing-grid">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`stat-card plan-card ${plan.style} ${plan.recommended ? 'recommended' : ''}`}
              style={{ opacity: plan.name === 'Free' ? 0.9 : 1 }}
            >
              {plan.recommended && (
                <div className="plan-recommended-badge">
                  Recommended
                </div>
              )}
              <div style={{ marginBottom: '24px' }}>
                <div className={`stat-title ${plan.style}`} style={{ letterSpacing: '0.1em' }}>{plan.name}</div>
                <div className="stat-value plan-price-row">
                  {plan.price} <span>/{plan.period}</span>
                </div>
              </div>
              <p className="plan-description">{plan.description}</p>

              <ul className="plan-features">
                {plan.features.map(feature => (
                  <li key={feature} className="feature-item">
                    <div className={`feature-icon-wrapper ${plan.style}`}>
                      <Check size={12} color={`var(--accent-${plan.style})`} />
                    </div>
                    {feature}
                  </li>
                ))}
              </ul>

              <button
                className={`btn ${plan.recommended ? 'btn-green' : (plan.name === 'Free' ? 'btn-outline' : '')}`}
                style={{ height: '52px', fontSize: '16px' }}
                onClick={() => handleUpgrade(plan.id)}
                disabled={!!loading}
              >
                {loading === plan.id ? 'Processing...' : (
                  plan.recommended ? <>{plan.cta} <Sparkles size={18} /></> : plan.cta
                )}
              </button>
            </div>
          ))}
        </div>

        <div className="section-card faq-section">
          <div className="section-card-header" style={{ justifyContent: 'center', marginBottom: '16px' }}>
            <div className="section-card-icon blue"><HelpCircle size={18} /></div>
            <div className="section-card-title">Frequently Asked Questions</div>
          </div>
          <div className="faq-grid">
            <div className="faq-item">
              <h4>Can I upgrade or downgrade at any time?</h4>
              <p>Yes, your subscription is flexible. Changes are effective immediately and prorated.</p>
            </div>
            <div className="faq-item">
              <h4>What happens if I exceed my limit?</h4>
              <p>Your requests will return a 429 status code. Upgrade to a higher plan to increase your limits.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Pricing;
