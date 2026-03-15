const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || 'development';

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const { initDb } = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const usageRoutes = require('./routes/usageRoutes');
const exerciseRoutes = require('./routes/exerciseRoutes');

initDb();

app.use('/images', express.static(path.join(__dirname, 'images')));
app.use('/api/auth', authRoutes);
app.use('/api/usage', usageRoutes);
app.use('/api/exercises', exerciseRoutes);

if (NODE_ENV === 'production') {
  const frontendBuild = path.join(__dirname, '..', 'frontend', 'dist');
  app.use(express.static(frontendBuild));
  app.get('*', (req, res) => {
    res.sendFile(path.join(frontendBuild, 'index.html'));
  });
}

app.listen(PORT, () => {
  console.log(`[GymBase_API] Server running on port ${PORT} (${NODE_ENV})`);
});
