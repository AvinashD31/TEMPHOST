require('dotenv').config();
const express = require('express')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser');
const cors = require('cors')
const connectDB = require('./config/database');
const routes = require('./routes'); 

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('Could not connect to MongoDB:', err));




const app = express();
// Connect to Database
connectDB();

// Add the correct CORS configuration here, before any routes
app.use(cors({
  origin: process.env.FRONTEND_URL || "http://localhost:5173", // Remove trailing slash
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // Make sure cookie-parser is used

//Routes
app.use('/api', routes);
app.use('/api', require('./routes/product'));

// Import routes
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const orderRoutes = require('./routes/orderRoutes');
const addressRoutes = require('./routes/address');
const Product = require('./routes/product');
const adminRouter = require('./routes/adminRoutes');
const returnRoutes = require('./routes/returnRoutes');

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api', userRoutes);  // This will handle /api/users/...
app.use('/api', orderRoutes);
app.use('/api/addresses', addressRoutes);
app.use('/api', Product);
app.use('/api/admin', adminRouter);
app.use('/api', returnRoutes);

// Log to verify route mounting
console.log('Mounting order routes');

// Add this before your routes
app.use((req, res, next) => {
  console.log('Incoming request:', req.method, req.path);
  next();
});

// Mount routes
app.use('/api', orderRoutes);

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

