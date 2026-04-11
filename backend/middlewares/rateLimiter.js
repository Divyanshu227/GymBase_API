const jwt = require('jsonwebtoken');
const DailyUsage = require('../models/DailyUsage');
const MonthlyUsage = require('../models/MonthlyUsage');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const PLAN_LIMITS = {
  free: { daily: 50, monthly: 500 },
  pro: { daily: 500, monthly: 5000 },
  business: { daily: Infinity, monthly: Infinity }
};

const getFormattedDate = (date) => {
  return date.toISOString().split('T')[0];
};

const getFormattedMonth = (date) => {
  return date.toISOString().substring(0, 7);
};

const apiLimiterMiddleware = async (req, res, next) => {
  const apiKey = req.header('x-api-key');
  const authHeader = req.header('Authorization');
  let user;

  try {
    if (apiKey) {
      user = await User.findOne({ api_key: apiKey });
      if (!user) {
        return res.status(401).json({ error: 'Invalid API Key' });
      }
      if (!user.is_verified) {
        return res.status(403).json({ error: 'Please verify your email to use the API' });
      }
      req.user = { id: user.id, isApiKey: true };
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      user = await User.findOne({ id: decoded.id });
      if (!user) return res.status(401).json({ error: 'User not found' });
      req.user = decoded; 
    } else {
      return res.status(401).json({ error: 'Missing authentication. Provide x-api-key header or Bearer token' });
    }

    const plan = user.plan || 'free';
    const dailyLimit = user.custom_daily_limit || PLAN_LIMITS[plan].daily;
    const monthlyLimit = user.custom_monthly_limit || PLAN_LIMITS[plan].monthly;

    const now = new Date();
    const currentDate = getFormattedDate(now);
    const currentMonth = getFormattedMonth(now);

    const dailyUsage = await DailyUsage.findOneAndUpdate(
      { user_id: user.id, date: currentDate },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    if (dailyLimit !== Infinity && dailyUsage.count > dailyLimit) {
      return res.status(429).json({ 
        error: `Daily API limit exceeded. Current plan: ${plan}. Limit: ${dailyLimit} calls/day`,
        plan: plan,
        limit: dailyLimit
      });
    }

    const monthlyUsage = await MonthlyUsage.findOneAndUpdate(
      { user_id: user.id, month: currentMonth },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    if (monthlyLimit !== Infinity && monthlyUsage.count > monthlyLimit) {
      return res.status(429).json({ 
        error: `Monthly API limit exceeded. Current plan: ${plan}. Limit: ${monthlyLimit} calls/month`,
        plan: plan,
        limit: monthlyLimit
      });
    }

    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Valid token is required' });
    }
    console.error('Rate Limiter Error:', error);
    res.status(500).json({ error: 'Internal Server Error during rate validation' });
  }
};

module.exports = apiLimiterMiddleware;
