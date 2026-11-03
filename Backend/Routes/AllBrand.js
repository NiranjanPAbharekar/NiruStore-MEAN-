import express from 'express';
import Brand from '../model/Brand.js';

const router = express.Router();

// GET ALL BRANDS
router.get('/', async (req, res) => {

  try {

    const brands = await Brand.find({
      status: 'Active'
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      brands
    });

  } catch (error) {

    console.error('GET BRANDS ERROR:', error);

    res.status(500).json({
      success: false,
      message: 'Unable to fetch brands',
      error: error.message
    });

  }

});

export default router;