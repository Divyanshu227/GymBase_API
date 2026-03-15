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
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', UserSchema);
