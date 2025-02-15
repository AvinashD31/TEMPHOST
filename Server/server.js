require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
const cors = require('cors')
const connectDB = require('./config/database');
const routes = require('./routes'); 
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');

const app = express();

// Connect to Database
connectDB();

// Add the correct CORS configuration here, before any routes
const corsOptions = {
  origin: process.env.NODE_ENV === 'production' 
    ? process.env.FRONTEND_URL 
    : ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  exposedHeaders: ['set-cookie'],
  maxAge: 86400, // 24 hours
};

app.use(cors(corsOptions));

// Add security headers for production
if (process.env.NODE_ENV === 'production') {
  app.use(helmet());
  app.use(compression());
  
  // Add rate limiting
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // limit each IP to 100 requests per windowMs
  });
  app.use(limiter);
}

// Logging middleware should be one of the first middleware
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.path);
  next();
});

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/address');
const productRoutes = require('./routes/product');  // Changed variable name for consistency
const adminRouter = require('./routes/adminRoutes');
const returnRoutes = require('./routes/returnRoutes');

// Mount routes (remove duplicates)
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);
app.use('/api', orderRoutes);  // Keep only one instance
app.use('/api/addresses', addressRoutes);
app.use('/api', productRoutes);
app.use('/api/admin', adminRouter);
app.use('/api', returnRoutes);

// Add a test route directly in server.js
app.get('/api/test-server', (req, res) => {
  res.json({ message: 'Server is working' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ message: 'Server error', error: err.message });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log('Available routes:');
  app._router.stack.forEach(r => {
    if (r.route && r.route.path) {
      console.log(r.route.path);
    }
  });
});

