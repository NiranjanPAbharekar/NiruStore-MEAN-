

import express from 'express';
import Review from '../model/Review.js';

const router = express.Router();

// ========================================
// GET ALL REVIEWS
// ========================================

router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .select('-email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      reviews
    });

  } catch (error) {
    console.error('GET REVIEWS ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch reviews',
      error: error.message
    });
  }
});

// ========================================
// ADD NEW REVIEW
// ========================================

router.post('/', async (req, res) => {
  try {
    const {
      name,
      email,
      brand,
      rating,
      review,
      recommend
    } = req.body;

    // Validate required fields
    if (
      !name?.trim() ||
      !email?.trim() ||
      !brand?.trim() ||
      !review?.trim() ||
      rating === undefined ||
      rating === null
    ) {
      return res.status(400).json({
        success: false,
        message: 'Please fill in all required fields.'
      });
    }

    const numericRating = Number(rating);

    if (
      !Number.isInteger(numericRating) ||
      numericRating < 1 ||
      numericRating > 5
    ) {
      return res.status(400).json({
        success: false,
        message: 'Rating must be between 1 and 5.'
      });
    }

    const newReview = await Review.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      brand: brand.trim(),
      rating: numericRating,
      review: review.trim(),
      recommend: Boolean(recommend)
    });

    // Do not expose the customer's email
    const savedReview = {
      _id: newReview._id,
      name: newReview.name,
      brand: newReview.brand,
      rating: newReview.rating,
      review: newReview.review,
      recommend: newReview.recommend,
      createdAt: newReview.createdAt
    };

    res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted.',
      review: savedReview
    });

  } catch (error) {
    console.error('ADD REVIEW ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to submit review.',
      error: error.message
    });
  }
});

export default router;
