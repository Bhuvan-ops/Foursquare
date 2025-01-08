const express = require('express');
const User = require('../models/User');
const Review = require('../models/Review');

const router = express.Router();

router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('username');

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const reviews = await Review.find({ user: userId })
      .populate('restaurant', 'restaurant')
      .select('rating comment restaurant');

    res.status(200).json({
      user,
      reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;
