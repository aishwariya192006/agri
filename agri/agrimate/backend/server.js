import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';

import authRoutes          from './routes/auth.js';
import aiRoutes            from './routes/ai.js';
import analysisRoutes      from './routes/analysis.js';
import farmRoutes          from './routes/farm.js';
import weatherRoutes       from './routes/weather.js';
import diseaseRoutes       from './routes/disease.js';
import soilRoutes          from './routes/soil.js';
import chatRoutes          from './routes/chat.js';
import alertRoutes         from './routes/alerts.js';
import marketRoutes        from './routes/market.js';
import cropRoutes          from './routes/crops.js';
import notificationRoutes  from './routes/notifications.js';

const app  = express();
const PORT = process.env.PORT || 5000;

const allowedOrigins = [
  process.env.CORS_ORIGIN,
  'http://localhost:5173',
  'http://localhost:5174',
  'http://localhost:5175',
  'http://localhost:5176',
  'https://agri11-06-frontend.onrender.com',
].filter(Boolean);

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error(`Origin ${origin} not allowed`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json({ limit: '15mb' }));

/* Security headers */
app.use((_req, res, next) => {
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('X-Frame-Options', 'DENY');
  next();
});

mongoose.connect(process.env.MONGODB_URI, {
  serverSelectionTimeoutMS: 10000,
  socketTimeoutMS: 45000,
})
  .then(() => console.log('MongoDB Connected ✅'))
  .catch(err => console.error('MongoDB Failed ❌', err.message));

/* Health */
app.get('/',           (_req, res) => res.send('🚀 AgriMate API running'));
app.get('/api/health', (_req, res) => res.json({ status: 'ok', service: 'agrimate-api', ts: Date.now() }));

/* Original routes */
app.use('/api/auth',     authRoutes);
app.use('/api/ai',       aiRoutes);
app.use('/api/analysis', analysisRoutes);
app.use('/api/farm',     farmRoutes);
app.use('/api/weather',  weatherRoutes);

/* New MongoDB-backed routes */
app.use('/api/disease',       diseaseRoutes);
app.use('/api/soil',          soilRoutes);
app.use('/api/chat',          chatRoutes);
app.use('/api/alerts',        alertRoutes);
app.use('/api/market',        marketRoutes);
app.use('/api/crops',         cropRoutes);
app.use('/api/notifications', notificationRoutes);

/* Global error handler */
app.use((err, _req, res, _next) => {
  console.error(err.message);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

app.listen(PORT, () => console.log(`AgriMate API → http://localhost:${PORT}`));
