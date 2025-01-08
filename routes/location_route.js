const express = require("express");
const Location = require("../models/location_model.js");
const Restaurant = require("../models/restaurant_model.js");
const authenticate = require("../middleware/auth_middleware.js");
const STATUS_CODES = require("../constants.js");

const router = express.Router();

router.post("/addlocation", authenticate, async (req, res) => {
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

router.get("/search", async (req, res) => {
  const { area } = req.query;

  if (!area) {
    return res.status(STATUS_CODES.BAD_REQUEST).json({ message: "Enter the details to search" });
  }

  try {
    const location = await Location.findOne({
      area: { $regex: area, $options: "i" },
    });

    if (!location) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Location not found" });
    }

    const restaurants = await Restaurant.find({ location: location._id })
    .select('restaurant')
    .exec();
  
    res.json({ location, restaurants });
  } catch (err) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: "Error searching location and restaurants",
      error: err.message,
    });
  }
});

module.exports = router;
