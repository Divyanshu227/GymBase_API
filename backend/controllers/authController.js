const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const User = require('../models/User');

const JWT_SECRET = process.env.JWT_SECRET ;
const FRONTEND_URL = process.env.FRONTEND_URL ;

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST ,
  port: process.env.SMTP_PORT ,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

exports.register = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      if (user.is_verified) {
        return res.status(400).json({ error: 'Email already registered and verified.' });
      }
      
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      const verificationToken = crypto.randomBytes(32).toString('hex');

      user.password_hash = passwordHash;
      user.verification_token = verificationToken;
      await user.save();
      
    } else {
      const salt = await bcrypt.genSalt(10);
      const passwordHash = await bcrypt.hash(password, salt);
      
      const verificationToken = crypto.randomBytes(32).toString('hex');
      const apiKey = 'gb_' + crypto.randomBytes(24).toString('hex');
      
      user = new User({
        email,
        password_hash: passwordHash,
        verification_token: verificationToken,
        api_key: apiKey,
        is_verified: false
      });
      
      await user.save();
    }

    if (process.env.SMTP_USER) {
      const verifyUrl = `${FRONTEND_URL}/verify-email/${user.verification_token}`;
      
      const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Welcome to GymBase API</h2>
        <p style="color: #555; font-size: 16px;">Hello,</p>
        <p style="color: #555; font-size: 16px;">Thank you for registering. Please confirm your email address to activate your account and access our services.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
        </div>
        <p style="color: #555; font-size: 14px;">If the button above does not work, you can copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #007bff; font-size: 14px;"><a href="${verifyUrl}">${verifyUrl}</a></p>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">If you did not create an account, no further action is required.</p>
      </div>
      `;

      await transporter.sendMail({
        from: `"GymBase API" <${process.env.email}>`,
        to: email,
        subject: 'Verify your GymBase API Account',
        text: `Please verify your email by clicking the link: ${verifyUrl}`,
        html: emailTemplate
      });
    } else {
      console.log('Sending Registration Email. SMTP not fully configured, skip actual email sending for:', email);
      console.log('Verification token:', user.verification_token);
    }

    res.status(201).json({ message: 'User registered successfully. Please verify your email.', userId: user.id });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.params;

  try {
    const user = await User.findOne({ verification_token: token });

    if (!user) {
      return res.status(400).json({ error: 'Invalid or expired verification token' });
    }

    user.is_verified = true;
    user.verification_token = undefined;
    await user.save();

    res.json({ message: 'Email successfully verified. You can now login.' });
  } catch (error) {
    console.error('Verification error:', error);
    res.status(500).json({ error: 'Server error during email verification' });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    if (!user.is_verified) {
      // Re-send verification email
      const verificationToken = crypto.randomBytes(32).toString('hex');
      user.verification_token = verificationToken;
      await user.save();

      if (process.env.SMTP_USER) {
        const verifyUrl = `${FRONTEND_URL}/verify-email/${verificationToken}`;
        
        const emailTemplate = `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
          <h2 style="color: #333; text-align: center;">Welcome to GymBase API</h2>
          <p style="color: #555; font-size: 16px;">Hello,</p>
          <p style="color: #555; font-size: 16px;">You tried to login but your email is not verified. Please confirm your email address to activate your account.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${verifyUrl}" style="background-color: #007bff; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Verify Email Address</a>
          </div>
          <p style="color: #555; font-size: 14px;">If the button above does not work, you can copy and paste the following link into your browser:</p>
          <p style="word-break: break-all; color: #007bff; font-size: 14px;"><a href="${verifyUrl}">${verifyUrl}</a></p>
        </div>
        `;

        await transporter.sendMail({
          from: `"GymBase API" <${process.env.email}>`,
          to: email,
          subject: 'Action Required: Verify your GymBase API Account',
          text: `Please verify your email by clicking the link: ${verifyUrl}`,
          html: emailTemplate
        });
      }

      return res.status(403).json({ error: 'Please verify your email before logging in. A new verification link has been sent to your email.' });
    }

    const isMatch = await bcrypt.compare(password, user.password_hash);

    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user.id }, JWT_SECRET, { expiresIn: '30d' });

    res.json({ message: 'Login successful', token });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
};

exports.forgotPassword = async (req, res) => {
  const { email } = req.body || {};

  if (!email) {
    return res.status(400).json({ error: 'Email is required' });
  }

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ error: 'User with that email does not exist' });
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.reset_password_token = resetToken;
    user.reset_password_expires = Date.now() + 3600000;
    await user.save();

    if (process.env.SMTP_USER) {
      const resetUrl = `${FRONTEND_URL}/reset-password/${resetToken}`;
      
      const emailTemplate = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 10px;">
        <h2 style="color: #333; text-align: center;">Reset Your Password</h2>
        <p style="color: #555; font-size: 16px;">Hello,</p>
        <p style="color: #555; font-size: 16px;">You are receiving this email because you (or someone else) have requested the reset of the password for your account.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #28a745; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; font-weight: bold; font-size: 16px;">Reset Password</a>
        </div>
        <p style="color: #555; font-size: 14px;">If the button above does not work, you can copy and paste the following link into your browser:</p>
        <p style="word-break: break-all; color: #28a745; font-size: 14px;"><a href="${resetUrl}">${resetUrl}</a></p>
        <p style="color: #555; font-size: 14px; font-weight: bold;">This link will expire in 1 hour.</p>
        <p style="color: #999; font-size: 12px; text-align: center; margin-top: 40px;">If you did not request this, please ignore this email and your password will remain unchanged.</p>
      </div>
      `;

      await transporter.sendMail({
        from: '"GymBase API" <noreply@gymbase.local>',
        to: email,
        subject: 'Password Reset Request',
        text: `You requested a password reset. Please go to this link to reset your password: ${resetUrl}`,
        html: emailTemplate
      });
    } else {
      console.log('Sending Password Reset Email. SMTP not fully configured.');
      console.log('Reset token:', resetToken);
    }

    res.json({ message: 'Password reset link sent to email' });
  } catch (error) {
    console.error('Forgot password error:', error);
    res.status(500).json({ error: 'Server error during password reset request' });
  }
};

exports.resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body || {};

  if (!password) {
    return res.status(400).json({ error: 'New password is required' });
  }

  try {
    const user = await User.findOne({ 
      reset_password_token: token,
      reset_password_expires: { $gt: Date.now() } 
    });

    if (!user) {
      return res.status(400).json({ error: 'Password reset token is invalid or has expired' });
    }

    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    user.password_hash = passwordHash;
    user.reset_password_token = undefined;
    user.reset_password_expires = undefined;
    await user.save();

    res.json({ message: 'Password has been updated successfully' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ error: 'Server error during password reset' });
  }
};
