require('dotenv').config(); // ✅ Loads Railway env vars

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const db = require('./config/db');
const authRoutes = require('./routes/authroutes');

const app = express();

// ─── Middleware ───────────────────────────────
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// ─── CORS Setup ───────────────────────────────
const allowedOrigins = [
  'http://localhost:5174',
  'https://noorjobportal.netlify.app'
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) {
      cb(null, true);
    } else {
      console.warn(`❌ CORS blocked for origin: ${origin}`);
      cb(null, false); // ✅ Prevents crash, logs warning
    }
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

// ─── Logging ───────────────────────────────────
app.use((req, res, next) => {
  console.log(`📡 Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

// ─── Routes ────────────────────────────────────
app.get('/', (req, res) => res.send('✅ Job Portal Backend is Live'));
app.use('/api/auth', authRoutes);

// ─── 404 Handler ───────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: `Route not found: ${req.method} ${req.originalUrl}`
  });
});

// ─── Server Start ──────────────────────────────
const PORT = process.env.PORT || 8000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
