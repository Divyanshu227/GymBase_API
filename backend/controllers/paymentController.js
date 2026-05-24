const stripe = process.env.STRIPE_SECRET_KEY ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;
const User = require('../models/User');
const FRONTEND_URL = process.env.FRONTEND_URL || '';

const PLANS = {
  pro: {
    name: 'Developer Pro',
    price: 1099, // in cents
    id: 'price_pro_monthly' // Replace with your actual Stripe Price ID
  },
  business: {
    name: 'Business',
    price: 2599, // in cents
    id: 'price_business_monthly' // Replace with your actual Stripe Price ID
  }
};

const PLAN_ALIASES = {
  'developer pro': 'pro',
  'developer-pro': 'pro',
  developerpro: 'pro',
};

const normalizePlanId = (planId) => {
  if (typeof planId !== 'string') return '';
  const normalized = planId.trim().toLowerCase();
  return PLAN_ALIASES[normalized] || normalized;
};

exports.createCheckoutSession = async (req, res) => {
  try {
    const planId = normalizePlanId(req.body?.planId);
    const userId = req.user.id;

    if (!stripe) {
      console.error('[GymBase_API] Stripe not configured: STRIPE_SECRET_KEY is missing');
      return res.status(500).json({ error: 'Stripe is not configured on the server. Add STRIPE_SECRET_KEY to backend/.env for local dev or set STRIPE_SECRET_KEY in your deployment environment variables.' });
    }

    if (!PLANS[planId]) {
      return res.status(400).json({ error: 'Invalid plan selected' });
    }

    if (!FRONTEND_URL) {
      return res.status(500).json({ error: 'FRONTEND_URL is not configured on the server' });
    }

    const user = await User.findOne({ id: userId });
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    // Creating a checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: PLANS[planId].name,
            },
            unit_amount: PLANS[planId].price,
            recurring: {
              interval: 'month',
            },
          },
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${FRONTEND_URL}/payment-success?session_id={CHECKOUT_SESSION_ID}&plan=${planId}`,
      cancel_url: `${FRONTEND_URL}/payment-failure?plan=${planId}`,
      customer_email: user.email,
      metadata: {
        userId: user.id,
        planId: planId
      },
    });

    res.json({ sessionId: session.id, url: session.url });
  } catch (error) {
    console.error('Stripe Session Error:', error);
    res.status(500).json({ error: 'Failed to create payment session' });
  }
};

exports.confirmPayment = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const userId = req.user.id;

    if (!stripe) {
      console.error('[GymBase_API] Stripe not configured: STRIPE_SECRET_KEY is missing');
      return res.status(500).json({ error: 'Stripe is not configured on the server. Add STRIPE_SECRET_KEY to backend/.env for local dev or set STRIPE_SECRET_KEY in your deployment environment variables.' });
    }

    // Retrieve the session from Stripe
    const session = await stripe.checkout.sessions.retrieve(sessionId);

    if (session.payment_status !== 'paid') {
      return res.status(400).json({ error: 'Payment not completed' });
    }

    // Security check: Ensure this session belongs to the user
    if (session.metadata.userId !== userId) {
      return res.status(403).json({ error: 'Unauthorized confirmation' });
    }

    const { planId } = session.metadata;

    // Calculate dates
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);

    // Get receipt URL
    let receiptUrl = null;
    try {
      let chargeId = null;
      if (session.payment_intent) {
        const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
        chargeId = pi.latest_charge;
      } else if (session.invoice) {
        const inv = await stripe.invoices.retrieve(session.invoice);
        chargeId = inv.charge;
      }

      if (chargeId) {
        const charge = await stripe.charges.retrieve(chargeId);
        receiptUrl = charge.receipt_url;
      }
    } catch (chargeErr) {
      console.error('Confirm Payment Receipt Error:', chargeErr);
    }

    // Update user
    const updatedUser = await User.findOneAndUpdate(
      { id: userId },
      { 
        plan: planId,
        subscription_start_date: startDate,
        subscription_end_date: endDate,
        last_payment_receipt_url: receiptUrl
      },
      { new: true }
    );

    res.json({ 
      success: true, 
      plan: planId,
      subscription_end_date: endDate
    });
  } catch (error) {
    console.error('Payment Confirmation Error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
};

exports.handleWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  if (!stripe) {
    console.error('[GymBase_API] Stripe webhook called but STRIPE_SECRET_KEY is missing');
    return res.status(500).json({ error: 'Stripe is not configured on the server. Webhook cannot be processed until STRIPE_SECRET_KEY and STRIPE_WEBHOOK_SECRET are set.' });
  }

  try {
    event = stripe.webhooks.constructEvent(
      req.body, 
      sig, 
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const { userId, planId } = session.metadata;

    try {
      // Fetch the subscription details to get start/end dates if available
      // For simple monthly subscription, we can just calculate them
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1); // 1 month from now

      // Try to get receipt URL from the charge
      let receiptUrl = null;
      try {
        let chargeId = null;
        
        if (session.payment_intent) {
          const pi = await stripe.paymentIntents.retrieve(session.payment_intent);
          chargeId = pi.latest_charge;
        } else if (session.invoice) {
          const inv = await stripe.invoices.retrieve(session.invoice);
          chargeId = inv.charge;
        }
        
        if (chargeId) {
          const charge = await stripe.charges.retrieve(chargeId);
          receiptUrl = charge.receipt_url;
        }
      } catch (chargeErr) {
        console.error('Failed to fetch receipt URL:', chargeErr);
      }

      await User.findOneAndUpdate(
        { id: userId },
        { 
          plan: planId,
          subscription_start_date: startDate,
          subscription_end_date: endDate,
          last_payment_receipt_url: receiptUrl
        }
      );
      console.log(`User ${userId} upgraded to ${planId}. Dates: ${startDate} - ${endDate}`);
    } catch (err) {
      console.error('Database update failed after webhook:', err);
    }
  }

  res.json({ received: true });
};
