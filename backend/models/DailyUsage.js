const mongoose = require('mongoose');

const DailyUsageSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
});

DailyUsageSchema.index({ user_id: 1, date: 1 }, { unique: true });

module.exports = mongoose.model('DailyUsage', DailyUsageSchema);
