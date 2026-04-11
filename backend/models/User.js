const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const UserSchema = new mongoose.Schema({
  id: {
    type: String,
    default: uuidv4,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password_hash: {
    type: String,
    required: true
  },
  is_verified: {
    type: Boolean,
    default: false
  },
  verification_token: {
    type: String
  },
  reset_password_token: {
    type: String
  },
  reset_password_expires: {
    type: Date
  },
  api_key: {
    type: String,
    unique: true,
    sparse: true
  },
  plan: {
    type: String,
    enum: ['free', 'pro', 'business'],
    default: 'free'
  },
  custom_daily_limit: {
    type: Number
  },
  custom_monthly_limit: {
    type: Number
  },
  subscription_start_date: {
    type: Date
  },
  subscription_end_date: {
    type: Date
  },
  last_payment_receipt_url: {
    type: String
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
