require('dotenv').config({ path: '.env.local' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const db = require('./config/db');
const authRoutes = require('./routes/authroutes');

const app = express();

// ─── Security Middleware ─────────────────────────────────────
app.use(helmet());

// ─── Rate Limiting ───────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false
});
app.use(limiter);

// ─── CORS Configuration ──────────────────────────────────────
const allowedOrigins = [
  'http://localhost:5174',
  'https://noorjobportal.netlify.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      console.warn(`❌ CORS blocked for origin: ${origin}`);
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

// ─── Middleware ──────────────────────────────────────────────
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// ─── Global Request Logger ───────────────────────────────────
app.use((req, res, next) => {
  console.log(`📡 Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// ─── Health Check ────────────────────────────────────────────
app.get('/', (req, res) => {
  res.send('✅ Job Portal Backend is Live');
});

// ─── Routes ──────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── 404 Handler ─────────────────────────────────────────────
app.use((req, res) => {
  console.warn(`❌ Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ─── Server Start ────────────────────────────────────────────
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
