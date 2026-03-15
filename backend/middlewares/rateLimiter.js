const jwt = require('jsonwebtoken');
const DailyUsage = require('../models/DailyUsage');
const MonthlyUsage = require('../models/MonthlyUsage');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET;
const DAILY_LIMIT = 50;
const MONTHLY_LIMIT = 500;

const getFormattedDate = (date) => {
  return date.toISOString().split('T')[0];
};

const getFormattedMonth = (date) => {
  return date.toISOString().substring(0, 7);
};

const apiLimiterMiddleware = async (req, res, next) => {
  const apiKey = req.header('x-api-key');
  const authHeader = req.header('Authorization');
  let userId;

  try {
    if (apiKey) {
      const user = await User.findOne({ api_key: apiKey });
      if (!user) {
        return res.status(401).json({ error: 'Invalid API Key' });
      }
      if (!user.is_verified) {
        return res.status(403).json({ error: 'Please verify your email to use the API' });
      }
      userId = user.id;
      req.user = { id: userId, isApiKey: true };
    } else if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, JWT_SECRET);
      userId = decoded.id;
      req.user = decoded; 
    } else {
      return res.status(401).json({ error: 'Missing authentication. Provide x-api-key header or Bearer token' });
    }

    const now = new Date();
    const currentDate = getFormattedDate(now);
    const currentMonth = getFormattedMonth(now);

    const dailyUsage = await DailyUsage.findOneAndUpdate(
      { user_id: userId, date: currentDate },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    if (dailyUsage.count > DAILY_LIMIT) {
      return res.status(429).json({ error: 'Daily API limit exceeded (50 calls per day)' });
    }

    const monthlyUsage = await MonthlyUsage.findOneAndUpdate(
      { user_id: userId, month: currentMonth },
      { $inc: { count: 1 } },
      { upsert: true, new: true }
    );

    if (monthlyUsage.count > MONTHLY_LIMIT) {
      return res.status(429).json({ error: 'Monthly API limit exceeded (500 calls per month)' });
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
