require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');

const connectDb = require('./config/mongoDb');
const seedMenu = require('./seed/menuSeed');

const authRoutes = require('./routes/authRoutes');
const menuRoutes = require('./routes/menuRoutes');
const cartRoutes = require('./routes/cartRoutes');
const orderRoutes = require('./routes/orderRoutes');
const profileRoutes = require('./routes/profileRoutes');
const settingsRoutes = require('./routes/settingsRoutes');

const app = express();

// Security headers
app.use(helmet());

// CORS — restrict to your frontend domain(s)
const allowedOrigins = [
  'https://savourfiesta-webapplication.vercel.app',
  'http://localhost:5173'
];
app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, Postman in dev)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));

// Body size limit — prevent DoS via large payloads
app.use(express.json({ limit: '10kb' }));

// Static file serving with aggressive caching (images won't change often)
app.use('/uploads', express.static('uploads', {
  maxAge: '7d',                // Browser cache for 7 days
  etag: true,                  // Enable ETag for conditional requests
  lastModified: true,          // Enable Last-Modified header
  immutable: false,            // Allow revalidation after maxAge
  setHeaders: (res, path) => {
    // For images, set even more aggressive caching
    if (path.match(/\.(jpg|jpeg|png|webp|avif|gif|svg)$/i)) {
      res.setHeader('Cache-Control', 'public, max-age=2592000, stale-while-revalidate=86400'); // 30 days + 1 day stale
    }
  }
}));

// Rate limiting on auth endpoints — prevent brute-force
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 15, // max 15 requests per window per IP
  message: { message: 'Too many attempts, please try again after 15 minutes.' },
  standardHeaders: true,
  legacyHeaders: false
});

connectDb().then(() => {
  seedMenu(); // auto add products once
});

app.get("/", (req, res) => {
  res.send("Restaurant API is running 🚀");
});
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/menu', menuRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/order', orderRoutes);
app.use('/api/profile', profileRoutes);
app.use('/api/settings', settingsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`)
);
