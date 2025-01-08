const express = require('express');
const User = require('../models/user_model');
const Review = require('../models/review_model');
const STATUS_CODES = require("../constants.js");
const authenticate = require("../middlewares/auth_middleware.js");

const router = express.Router();

router.get("/users", authenticate, async (req, res) => {
  if (req.user.role !== "admin") {
    return res
      .status(STATUS_CODES.FORBIDDEN)
      .json({ message: "Access forbidden: Admin role required" });
  }

  try {
    const users = await User.find().select("-password");
    res.json(users);
  } catch (err) {
    res
      .status(STATUS_CODES.INTERNAL_SERVER_ERROR)
      .json({ message: "Error fetching users", error: err.message });
  }
});

router.get('/profile/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).select('username');

    if (!user) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'User not found' });
    }

    const reviews = await Review.find({ user: userId })
      .populate('restaurant', 'restaurant')
      .select('rating comment restaurant');

    res.status(STATUS_CODES.SUCCESS).json({
      user,
      reviews,
    });
  } catch (error) {
    console.error(error);
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
  }
});

module.exports = router;
