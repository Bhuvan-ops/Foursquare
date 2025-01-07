const mongoose = require("mongoose");

const locationSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true,
    unique: true,
  },
  district: {
    type: String,
    required: true,
  },
  state: {
    type: String,
    required: true,
  },
  restaurants: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Restaurant",
    },
  ],
});

module.exports = mongoose.model("Location", locationSchema);