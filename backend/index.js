const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');

dotenv.config({ path: path.join(__dirname, '.env') });

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

// Global safety: catch unexpected rejections and exceptions to avoid Vercel function crashes
process.on('uncaughtException', (err) => {
  console.error('[GymBase_API] Uncaught Exception:', err);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('[GymBase_API] Unhandled Rejection at:', promise, 'reason:', reason);
});

let initDb, isDbReady, MONGO_URI;
let authRoutes, usageRoutes, exerciseRoutes, paymentRoutes, paymentController;
try {
  const dbModule = require('./config/db');
  initDb = dbModule.initDb;
  isDbReady = dbModule.isDbReady;
  MONGO_URI = dbModule.MONGO_URI;

  authRoutes = require('./routes/authRoutes');
  usageRoutes = require('./routes/usageRoutes');
  exerciseRoutes = require('./routes/exerciseRoutes');
  paymentRoutes = require('./routes/paymentRoutes');
  paymentController = require('./controllers/paymentController');
} catch (err) {
  console.error('[GymBase_API] Failed to load modules at startup:', err);
  // Fallback: define minimal handlers so the function responds instead of crashing
  initDb = async () => false;
  isDbReady = () => false;
  MONGO_URI = null;
  authRoutes = express.Router();
  authRoutes.all(/.*/, (req, res) => res.status(500).json({ error: 'Server startup error' }));
  usageRoutes = express.Router();
  usageRoutes.all(/.*/, (req, res) => res.status(500).json({ error: 'Server startup error' }));
  exerciseRoutes = express.Router();
  exerciseRoutes.all(/.*/, (req, res) => res.status(500).json({ error: 'Server startup error' }));
  paymentRoutes = express.Router();
  paymentRoutes.all(/.*/, (req, res) => res.status(500).json({ error: 'Server startup error' }));
  paymentController = {
    handleWebhook: (req, res) => res.status(500).send('Server startup error'),
  };
}

const parseOrigins = (value = '') =>
  value
    .split(',')
    .map((origin) => origin.trim().replace(/\/$/, ''))
    .filter(Boolean);

const devOrigins = NODE_ENV === 'production' ? [] : ['http://localhost:5173'];
const allowedOrigins = [
  ...parseOrigins(process.env.CORS_ORIGINS),
  ...parseOrigins(process.env.FRONTEND_URL),
  ...devOrigins,
];

const isAllowedOrigin = (origin) => {
  if (!origin) return true;
  const normalizedOrigin = origin.replace(/\/$/, '');
  return allowedOrigins.includes(normalizedOrigin);
};

const corsOptions = {
  origin(origin, callback) {
    if (isAllowedOrigin(origin)) {
      callback(null, true);
      return;
    }

    console.warn(`CORS blocked origin: ${origin || 'unknown'}`);
    callback(new Error(`CORS blocked origin: ${origin}`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-api-key', 'stripe-signature'],
  optionsSuccessStatus: 204,
};

console.log('[GymBase_API] Runtime config:', {
  nodeEnv: NODE_ENV,
  vercel: !!process.env.VERCEL,
  hasMongoUri: !!MONGO_URI,
  mongoUriSource: process.env.MONGO_URI ? 'MONGO_URI' : process.env.MONGODB_URI ? 'MONGODB_URI' : 'missing',
  hasJwtSecret: !!process.env.JWT_SECRET,
  hasFrontendUrl: !!process.env.FRONTEND_URL,
  corsOrigins: allowedOrigins,
});

app.use(cors(corsOptions));
app.options(/.*/, cors(corsOptions));
// Stripe webhooks require the raw request body for signature verification.
app.post('/api/payment/webhook', express.raw({ type: 'application/json' }), paymentController.handleWebhook);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

initDb();

app.get('/', (req, res) => {
  res.status(200).json({ status: 'healthy', message: 'GymBase API is running' });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

app.get('/api/diagnostics', (req, res) => {
  res.status(200).json({
    status: 'ok',
    nodeEnv: NODE_ENV,
    vercel: !!process.env.VERCEL,
    hasMongoUri: !!MONGO_URI,
    mongoUriSource: process.env.MONGO_URI ? 'MONGO_URI' : process.env.MONGODB_URI ? 'MONGODB_URI' : 'missing',
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasFrontendUrl: !!process.env.FRONTEND_URL,
    corsOrigins: allowedOrigins,
    dbReady: typeof isDbReady === 'function' ? isDbReady() : false,
  });
});

app.get('/favicon.ico', (req, res) => {
  res.status(204).end();
});

app.get('/favicon.png', (req, res) => {
  res.status(204).end();
});

app.use('/api', async (req, res, next) => {
  if (isDbReady()) {
    next();
    return;
  }

  const connected = await initDb();
  if (connected || isDbReady()) {
    next();
    return;
  }

  console.error(`[GymBase_API] Database not ready for ${req.method} ${req.originalUrl}`);
  res.status(503).json({ error: 'Database connection is not ready' });
});

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', authRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/exercises', exerciseRoutes);
app.use('/api/payment', paymentRoutes);

if (NODE_ENV === 'production') {
  const frontendBuild = path.join(__dirname, '..', 'frontend', 'dist');
  if (fs.existsSync(frontendBuild)) {
    app.use(express.static(frontendBuild));
    app.get(/.*/, (req, res) => {
      res.sendFile(path.join(frontendBuild, 'index.html'));
    });
  } else {
    console.warn(`[GymBase_API] Frontend build not found at ${frontendBuild}; skipping static file serving.`);
  }
}

if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`[GymBase_API] Server running on port ${PORT} (${NODE_ENV})`);
  });
}

module.exports = app;
