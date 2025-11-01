require('dotenv').config({ path: '.env.local' });

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');

const db = require('./config/db');
const authRoutes = require('./routes/authroutes');

const app = express();

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(rateLimit({ windowMs: 15 * 60 * 1000, max: 100 }));

const allowedOrigins = [
  'http://localhost:5174',
  'https://noorjobportal.netlify.app'
];

app.use(cors({
  origin: (origin, cb) => {
    if (!origin || allowedOrigins.includes(origin)) cb(null, true);
    else cb(new Error(`CORS blocked for origin: ${origin}`));
  },
  methods: ['GET', 'POST'],
  credentials: true
}));

app.use((req, res, next) => {
  console.log(`📡 Incoming request: ${req.method} ${req.originalUrl}`);
  next();
});

app.get('/', (req, res) => res.send('✅ Job Portal Backend is Live'));
app.use('/api/auth', authRoutes);

app.use((req, res) => {
  res.status(404).json({ status: 'error', message: `Route not found: ${req.method} ${req.originalUrl}` });
});

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
