const express = require('express');
const router = express.Router();
const paymentController = require('../controllers/paymentController');
const authenticateToken = require('../middlewares/authMiddleware');

// Protected routes
router.post('/create-checkout-session', authenticateToken, paymentController.createCheckoutSession);
router.get('/confirm-payment/:sessionId', authenticateToken, paymentController.confirmPayment);

module.exports = router;
