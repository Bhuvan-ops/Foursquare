const express = require("express");
const Review = require("../models/Review");
const Restaurant = require("../models/Restaurant");
const User = require("../models/User");
const authenticate = require("../middleware/authenticate");
const STATUS_CODES = require("../constants.js");

const router = express.Router();

router.post("/addreview", authenticate, async (req, res) => {
  try {
    const { restaurantId, rating, comment } = req.body;
    const restaurant = await Restaurant.findById(restaurantId);
    if (!restaurant) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Restaurant not found" });
    }

    const existingReview = await Review.findOne({ user: req.user._id, restaurant: restaurantId });
    if (existingReview) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "You have already reviewed this restaurant" });
    }

    const newReview = new Review({
      user: req.user._id,
      restaurant: restaurantId,
      rating,
      comment,
    });

    await newReview.save();

    res.status(STATUS_CODES.CREATED).json({
      message: "Review added successfully",
      review: newReview,
    });
  } catch (err) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: "Error adding review",
      error: err.message,
    });
  }
});

router.get("/:restaurantId", async (req, res) => {
  try {
    const reviews = await Review.find({ restaurant: req.params.restaurantId })
      .populate("user", "username")
      .exec();

    if (!reviews || reviews.length === 0) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "No reviews found for this restaurant" });
    }

    res.status(STATUS_CODES.OK).json({ reviews });
  } catch (err) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching reviews",
      error: err.message,
    });
  }
});

router.get("/review/:id", async (req, res) => {
  try {
    const review = await Review.findById(req.params.id).populate("user", "username restaurant");

    if (!review) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Review not found" });
    }

    res.status(STATUS_CODES.OK).json({ review });
  } catch (err) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching review",
      error: err.message,
    });
  }
});

module.exports = router;
