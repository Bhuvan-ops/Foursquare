const express = require("express");
const Location = require("../models/location_model.js");
const Restaurant = require("../models/restaurant_model.js");
const authenticate = require("../middlewares/auth_middleware.js");
const STATUS_CODES = require("../constants.js");

const router = express.Router();

router.post("/add", authenticate, async (req, res) => {
  const { area, district, state, restaurants } = req.body;
  try {
    if (req.user.role !== "admin") {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "Access forbidden: Admin role required" });
    }

    if (!area || !district || !state) {
      return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Missing required fields" });
    }

    const location = new Location({
      area,
      district,
      state,
      restaurants: restaurants || [],
    });

    await location.save();
    res.status(STATUS_CODES.CREATED).json({ message: "Location added successfully", location });
  } catch (err) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: "Error adding location", error: err.message });
  }
});

router.get("/:locationId", async (req, res) => {
  const { locationId } = req.params;

  if (!locationId) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Enter the details to search" });
  }

  try {
    const location = await Location.findOne({ _id: locationId }).select('-restaurants')
    .populate('restaurants', 'restaurant');
    if (!location) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Location not found" });
    }

    const restaurants = await Restaurant.find({ location: location._id })
    .select('restaurant')
    .exec();
  
    res.json({ location });
  } catch (err) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: "Error searching location and restaurants",
      error: err.message,
    });
  }
});

module.exports = router;
