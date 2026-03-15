const DailyUsage = require('../models/DailyUsage');
const MonthlyUsage = require('../models/MonthlyUsage');
const User = require('../models/User');
const crypto = require('crypto');

const getFormattedDate = (date) => date.toISOString().split('T')[0];
const getFormattedMonth = (date) => date.toISOString().substring(0, 7);

exports.getUsage = async (req, res) => {
  try {
    const userId = req.user.id;
    const now = new Date();
    const currentDate = getFormattedDate(now);
    const currentMonth = getFormattedMonth(now);

    const dailyResult = await DailyUsage.findOne({ user_id: userId, date: currentDate });
    const dailyCount = dailyResult ? dailyResult.count : 0;

    const monthlyResult = await MonthlyUsage.findOne({ user_id: userId, month: currentMonth });
    const monthlyCount = monthlyResult ? monthlyResult.count : 0;

    let user = await User.findOne({ id: userId });
    
    // Auto-generate api key
    if (user && !user.api_key) {
      user.api_key = 'gb_' + crypto.randomBytes(24).toString('hex');
      await user.save();
    }

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
        limit: 50
      },
      monthly: {
        used: monthlyCount,
        limit: 500
      },
      history,
      api_key: user ? user.api_key : null
    });
  } catch (error) {
    console.error('Error fetching usage:', error);
    res.status(500).json({ error: 'Server error fetching usage data' });
  }
};
