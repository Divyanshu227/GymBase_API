const express = require('express');
const router = express.Router();
const exerciseController = require('../controllers/exerciseController');
const apiLimiterMiddleware = require('../middlewares/rateLimiter');
router.use('/', apiLimiterMiddleware);

router.get('/', exerciseController.getAllExercises);
router.get('/id/:id', exerciseController.getExerciseById);
router.get('/name/:name', exerciseController.getExerciseByName);
router.get('/muscle/:muscle', exerciseController.getExercisesByMuscle);

module.exports = router;
