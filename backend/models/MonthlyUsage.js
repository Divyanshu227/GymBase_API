const mongoose = require('mongoose');

const MonthlyUsageSchema = new mongoose.Schema({
  user_id: {
    type: String,
    required: true
  },
  month: {
    type: String,
    required: true
  },
  count: {
    type: Number,
    default: 0
  }
});

MonthlyUsageSchema.index({ user_id: 1, month: 1 }, { unique: true });

module.exports = mongoose.model('MonthlyUsage', MonthlyUsageSchema);
