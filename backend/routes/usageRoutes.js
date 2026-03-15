const express = require('express');
const router = express.Router();
const authenticateToken = require('../middlewares/authMiddleware');
const usageController = require('../controllers/usageController');

router.get('/', authenticateToken, usageController.getUsage);

module.exports = router;
