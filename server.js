require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");

const authRoutes = require("./routes/auth.js");
const locationRoutes = require("./routes/location.js");
const restaurantRoutes = require("./routes/restaurant.js");
const reviewRoutes = require("./routes/review.js");
const userRoutes = require("./routes/user.js")

const STATUS_CODES = require("./constants.js");
const PORT = process.env.PORT || 5000;

const app = express();

app.use(express.json());

app.use("/auth", authRoutes);
app.use("/location", locationRoutes);
app.use("/restaurant", restaurantRoutes);
app.use("/review", reviewRoutes);
app.use("/user", userRoutes);

mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => {
    console.log("MongoDB connected successfully");
  })
  .catch((err) => {
    console.error("Error connecting to MongoDB:", err.message);
  });

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
