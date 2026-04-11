const DailyUsage = require('../models/DailyUsage');
const MonthlyUsage = require('../models/MonthlyUsage');
const User = require('../models/User');
const crypto = require('crypto');

const getFormattedDate = (date) => date.toISOString().split('T')[0];
// date format is YYYY-MM-DD
// split('T') splits the date string into two parts, the date and the time
// [0] gets the first part, which is the date.
// eg- 2026-03-31T15:38:54+05:30 -> 2026-03-31
// string method -> split('T') -> returns an array of strings
// [0] -> returns the first element of the array
const getFormattedMonth = (date) => date.toISOString().substring(0, 7);
// month format is YYYY-MM
// substring(0, 7) gets the first 7 characters, which is the month.
// eg- 2026-03-31T15:38:54+05:30 -> 2026-03
// string method -> substring(0, 7) -> returns the first 7 characters of the string
const PLAN_LIMITS = {
  free: { daily: 50, monthly: 500 },
  pro: { daily: 500, monthly: 5000 },
  business: { daily: Infinity, monthly: Infinity }
};

exports.getUsage = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentDate = getFormattedDate(now);
    const currentMonth = getFormattedMonth(now);

    let user = await User.findOne({ id: userId });
    if (!user) return res.status(404).json({ error: 'User not found' });
    
    // Auto-generate api key
    if (!user.api_key) {
      user.api_key = 'gb_' + crypto.randomBytes(24).toString('hex');
      await user.save();
    }

    const plan = user.plan || 'free';
    const dailyLimit = user.custom_daily_limit || PLAN_LIMITS[plan].daily;
    const monthlyLimit = user.custom_monthly_limit || PLAN_LIMITS[plan].monthly;

    const dailyResult = await DailyUsage.findOne({ user_id: userId, date: currentDate });
    const dailyCount = dailyResult ? dailyResult.count : 0;

    const monthlyResult = await MonthlyUsage.findOne({ user_id: userId, month: currentMonth });
    const monthlyCount = monthlyResult ? monthlyResult.count : 0;

    const sevenDaysAgoDate = new Date();
    sevenDaysAgoDate.setDate(now.getDate() - 6); 
    const startOfRange = getFormattedDate(sevenDaysAgoDate);
    
    const historyResult = await DailyUsage.find({
      user_id: userId,
      date: { $gte: startOfRange }
    });
    
    const historyMap = {};
    for (const record of historyResult) {
      historyMap[record.date] = record.count;
    }
    
    const history = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(sevenDaysAgoDate);
      d.setDate(sevenDaysAgoDate.getDate() + i);
      const dStr = getFormattedDate(d);
      
      const dayName = new Intl.DateTimeFormat('en-US', { weekday: 'short' }).format(d);
      
      history.push({
        date: dStr,
        day: dayName,
        calls: historyMap[dStr] || 0
      });
    }

    res.json({
      daily: {
        used: dailyCount,
        limit: dailyLimit
      },
      monthly: {
        used: monthlyCount,
        limit: monthlyLimit
      },
      plan: plan,
      history,
      api_key: user.api_key,
      subscription_start_date: user.subscription_start_date,
      subscription_end_date: user.subscription_end_date,
      last_payment_receipt_url: user.last_payment_receipt_url
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ error: 'Server error fetching usage data' });
  }
};
