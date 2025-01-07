const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  restaurant: { type: String, required: true },
  cuisine: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
});

module.exports = mongoose.model("Restaurant", restaurantSchema);