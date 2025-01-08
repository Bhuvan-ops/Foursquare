const express = require("express");
const Restaurant = require("../models/restaurant_model.js");
const Location = require("../models/location_model.js");
const authenticate = require("../middlewares/auth_middleware.js");
const STATUS_CODES = require("../constants.js");

const router = express.Router();

router.post("/add", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "Access forbidden: Admin role required" });
    }

    const { restaurant, timings, cuisine, rating, area } = req.body;

    const location = await Location.findOne({
      area: { $regex: `^${area}$`, $options: 'i' },
    });
        if (!location) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Location not found" });
    }

    const newRestaurant = new Restaurant({
      restaurant,
      timings,
      cuisine,
      rating,
      location: location._id,
    });

    await newRestaurant.save();
    location.restaurants.push(newRestaurant._id);
    await location.save();

    res.status(STATUS_CODES.CREATED).json({
      message: "Restaurant added successfully",
      restaurant: newRestaurant,
    });
  } catch (err) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: "Error adding restaurant",
      error: err.message,
    });
  }
});

router.get("/:restaurantId", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.restaurantId).populate("location","area").populate("reviews","-restaurant");

    if (!restaurant) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Restaurant not found" });
    }

    const reviews = restaurant.reviews.sort((a, b) => b.rating - a.rating);
    let totalRating = 0;
    reviews.forEach((review) => {
      totalRating += review.rating;
    });

    const averageRating = reviews.length > 0 ? (totalRating / reviews.length).toFixed(1) : 0;
    restaurant.rating = averageRating;

    res.status(STATUS_CODES.CREATED).json({ restaurant });
  } catch (err) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching restaurant details",
      error: err.message,
    });
  }
});

module.exports = router;
