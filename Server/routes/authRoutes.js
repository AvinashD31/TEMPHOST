const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5 // limit each IP to 5 requests per windowMs
});

// Debug middleware specific to auth routes
router.use((req, res, next) => {
  console.log('Auth Route:', req.method, req.path);
  console.log('Headers:', req.headers);
  next();
});

// Login route
router.post('/login', loginLimiter, async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Sanitize inputs
    if (!email || !password || typeof email !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ message: 'Invalid input' });
    }

    // Find user
    const user = await User.findOne({ email });
    console.log('Login - Found User:', {
      id: user._id,
      email: user.email,
      role: user.role,
      fullUser: user.toObject()
    });

    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    // Verify password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    // Create token with role included
    const payload = {
      id: user._id,
      email: user.email,
      role: user.role,  // Make sure role is included in token
    };

    const token = jwt.sign(
      payload,
      process.env.JWT_SECRET,
      { expiresIn: '8h' } // Reduced token expiration
    );

    // Send response with full user object
    const userResponse = {
      id: user._id,
      email: user.email,
      role: user.role,
      name: user.name,
      mobile:user.mobile,
    };

    console.log('Login - Sending Response:', userResponse);

    res.json({
      token,
      user: userResponse
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Authentication failed' });
  }
});

router.get('/profile', auth, async (req, res) => {
  try {
    console.log('Profile request received');
    console.log('User from token:', req.user);

    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Cache-Control', 'no-store');

    const user = await User.findById(req.user.id).select('-password');
    
    if (!user) {
      console.log('User not found in database');
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    console.log('Sending user profile response');
    const userResponse = {
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        mobile: user.mobile,
        addresses: user.addresses || []
      }
    };

    return res.json(userResponse);
  } catch (error) {
    console.error('Profile fetch error:', error);
    return res.status(500).json({ 
      success: false,
      message: 'Error fetching user profile',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Register route
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, mobile } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });

    console.log(existingUser);
    
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      mobile,
    });

    await user.save();

    // Create JWT token
    const token = jwt.sign(
      { userId: user._id },
      process.env.JWT_SECRET,
      { expiresIn: '2h' }
    );

    res.status(201).json({
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        phone: user.phone
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 