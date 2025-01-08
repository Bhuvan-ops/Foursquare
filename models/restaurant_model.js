const mongoose = require("mongoose");

const restaurantSchema = new mongoose.Schema({
  restaurant: { type: String, required: true },
  cuisine: { type: String, required: true },
  timings: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  location: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Location",
    required: true,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ]
});

module.exports = mongoose.model("Restaurant", restaurantSchema);