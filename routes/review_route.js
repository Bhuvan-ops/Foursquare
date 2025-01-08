const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/Review');
const User = require('../models/User');
const Restaurant = require('../models/Restaurant');

const router = express.Router();

router.post('/addreview', async (req, res) => {
    try {
      const { userId, restaurantId, rating, comment } = req.body;
  
      const user = await User.findById(userId);
      const restaurant = await Restaurant.findById(restaurantId);
  
      if (!user || !restaurant) {
        return res.status(400).json({ message: 'User or Restaurant not found' });
      }

      const existingReview = await Review.findOne({ user: userId, restaurant: restaurantId });

      if (existingReview) {
        return res.status(400).json({ message: 'You have already reviewed this restaurant' });
      }
  
      const newReview = new Review({
        user: userId,
        restaurant: restaurantId,
        rating,
        comment,
      });
  
      await newReview.save();
  
      await Restaurant.findByIdAndUpdate(
        restaurantId,
        { $push: { reviews: newReview._id } },
        { new: true }
      );
  
      const updatedRestaurant = await Restaurant.findById(restaurantId).populate('reviews');
  
      res.status(201).json(updatedRestaurant);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });

  router.delete('/deletereview/:reviewId', async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { userId } = req.body;
  
      const review = await Review.findById(reviewId);
  
      if (!review) {
        return res.status(404).json({ message: 'Review not found' });
      }
  
      if (review.user.toString() !== userId) {
        return res.status(403).json({ message: 'You are not authorized to delete this review' });
      }
  
      await Review.findByIdAndDelete(reviewId);
  
      await Restaurant.findByIdAndUpdate(
        review.restaurant,
        { $pull: { reviews: reviewId } },
        { new: true }
      );
  
      res.status(200).json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Server error' });
    }
  });
  
module.exports = router;
