const express = require("express");
const Restaurant = require("../models/Restaurant");
const Location = require("../models/Location");
const authenticate = require("../middleware/authenticate");
const STATUS_CODES = require("../constants.js");

const router = express.Router();

router.post("/addrestaurant", authenticate, async (req, res) => {
  try {
    if (req.user.role !== "admin") {
      return res
        .status(STATUS_CODES.FORBIDDEN)
        .json({ message: "Access forbidden: Admin role required" });
    }

    const { restaurant, cuisine, rating, area } = req.body;

    const location = await Location.findById(area);
    if (!location) {
      return res
        .status(STATUS_CODES.NOT_FOUND)
        .json({ message: "Location not found" });
    }

    const newRestaurant = new Restaurant({
      restaurant,
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

router.get("/:id", async (req, res) => {
  try {
    const restaurant = await Restaurant.findById(req.params.id).populate("location");

    if (!restaurant) {
      return res.status(STATUS_CODES.NOT_FOUND).json({ message: "Restaurant not found" });
    }

    res.status(STATUS_CODES.OK).json({ restaurant });
  } catch (err) {
    res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({
      message: "Error fetching restaurant details",
      error: err.message,
    });
  }
});

module.exports = router;
