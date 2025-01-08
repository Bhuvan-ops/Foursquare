const express = require('express');
const mongoose = require('mongoose');
const Review = require('../models/review_model');
const User = require('../models/user_model');
const Restaurant = require('../models/restaurant_model');
const STATUS_CODES = require('../constants');
const authenticate = require("../middlewares/auth_middleware.js");

const router = express.Router();

router.post('/add', authenticate, async (req, res) => {
    try {
      const { userId, restaurantId, rating, comment } = req.body;
  
      const user = await User.findById(userId);
      const restaurant = await Restaurant.findById(restaurantId);
  
      if (!user || !restaurant) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'User or Restaurant not found' });
      }

      const existingReview = await Review.findOne({ user: userId, restaurant: restaurantId });

      if (existingReview) {
        return res.status(STATUS_CODES.BAD_REQUEST).json({ message: 'You have already reviewed this restaurant' });
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
  
      res.status(STATUS_CODES.CREATED).json(updatedRestaurant);
    } catch (error) {
      console.error(error);
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
  });

  router.delete('/delete/:reviewId', authenticate, async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { userId } = req.body;
  
      const review = await Review.findById(reviewId);
  
      if (!review) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Review not found' });
      }
  
      if (review.user.toString() !== userId) {
        return res.status(STATUS_CODES.FORBIDDEN).json({ message: 'You are not authorized to delete this review' });
      }
  
      await Review.findByIdAndDelete(reviewId);
  
      await Restaurant.findByIdAndUpdate(
        review.restaurant,
        { $pull: { reviews: reviewId } },
        { new: true }
      );
  
      res.status(STATUS_CODES.SUCCESS).json({ message: 'Review deleted successfully' });
    } catch (error) {
      console.error(error);
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
  });

  router.put('/update/:reviewId', authenticate, async (req, res) => {
    try {
      const { reviewId } = req.params;
      const { userId, rating, comment } = req.body;
    
      const reviews = restaurant.reviews.sort((a, b) => b.rating - a.rating);
    
      if (!review) {
        return res.status(STATUS_CODES.NOT_FOUND).json({ message: 'Review not found' });
      }
    
      if (review.user.toString() !== userId) {
        return res.status(STATUS_CODES.FORBIDDEN).json({ message: 'You are not authorized to update this review' });
      }
    
      review.rating = rating;
      review.comment = comment;
    
      await review.save();
    
      const updatedRestaurant = await Restaurant.findById(review.restaurant).populate('reviews');
    
      res.status(STATUS_CODES.SUCCESS).json({ message: 'Review updated successfully', restaurant: updatedRestaurant });
    } catch (error) {
      console.error(error);
      res.status(STATUS_CODES.INTERNAL_SERVER_ERROR).json({ message: 'Server error' });
    }
  });  
  
module.exports = router;
