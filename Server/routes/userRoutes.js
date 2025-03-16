const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Order = require('../models/Order');
const mongoose = require('mongoose');

// Get user by ID
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password'); // Exclude password
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user
router.put('/:id', async (req, res) => {
  try {
    const { name, email, mobile } = req.body;
    
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, email, mobile },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error updating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get user orders
router.get('/users/:userId/orders', async (req, res) => {
  try {
    const { userId } = req.params;
    
    // Validate userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const orders = await Order.find({ userId })
      .sort({ createdAt: -1 })
      .lean();

    if (!orders || orders.length === 0) {
      return res.status(404).json({ 
        message: 'No orders found for this user',
        userId: userId
      });
    }

    res.json(orders);
  } catch (error) {
    console.error('Error fetching orders:', error);
    res.status(500).json({ 
      message: 'Server error',
      error: error.message 
    });
  }
});

// Update user address and mobile
router.put('/:userId/address', async (req, res) => {
  try {
    const { userId } = req.params;
    const { address, mobile } = req.body;

    if (!address) {
      return res.status(400).json({ message: 'Address data is required' });
    }

    // Validate the userId
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ message: 'Invalid user ID format' });
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        $set: { 
          address,
          mobile: mobile || '' // Update mobile if provided
        } 
      },
      { new: true, runValidators: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user information:', error);
    res.status(500).json({ 
      message: 'Failed to update user information',
      error: error.message 
    });
  }
});

module.exports = router; 