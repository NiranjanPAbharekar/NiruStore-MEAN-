import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';

import Product from './model/Product.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8040;
const MONGODB_URL = process.env.MongoDB_URL;


// =========================================================
// MIDDLEWARE
// =========================================================

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


// =========================================================
// MONGODB CONNECTION
// =========================================================

console.log('MongoDB URL loaded:', !!MONGODB_URL);

mongoose
  .connect(MONGODB_URL)
  .then(() => {

    console.log('MongoDB connected successfully');

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });

  })
  .catch((error) => {

    console.error(
      'Error connecting to MongoDB:',
      error
    );

  });


// =========================================================
// TEST ROUTE
// =========================================================

app.get('/', (req, res) => {

  res.send(
    'Product Backend Server is Running 🚀'
  );

});


// =========================================================
// ADD PRODUCT
// =========================================================


app.post('/Admin/AdminProducts', async (req, res) => {
  try {
    console.log('ADD PRODUCT BODY:', req.body);

    const {
      brand,
      productName,
      category,
      price,
      discount,
      discountedPrice,
      stock,
      status,
      description,
      image,
      subImages,
      color,
      rating,
      reviews,
      badge
    } = req.body;

    // =====================================
    // VALIDATION
    // =====================================

    if (
      !brand?.trim() ||
      !productName?.trim() ||
      !category?.trim() ||
      price === undefined ||
      price === null ||
      price === ''
    ) {
      return res.status(400).json({
        status: 'error',
        message:
          'Brand, product name, category and price are required'
      });
    }

    const numericPrice = Number(price);
    const numericDiscount = Number(discount ?? 0);
    const numericStock = Number(stock ?? 0);

    if (
      !Number.isFinite(numericPrice) ||
      numericPrice < 0 ||
      !Number.isFinite(numericDiscount) ||
      numericDiscount < 0 ||
      numericDiscount > 100 ||
      !Number.isFinite(numericStock) ||
      numericStock < 0
    ) {
      return res.status(400).json({
        status: 'error',
        message:
          'Price, discount or stock contains an invalid value'
      });
    }

    const calculatedDiscountedPrice = Number(
      (
        numericPrice -
        (numericPrice * numericDiscount) / 100
      ).toFixed(2)
    );

    // =====================================
    // CREATE PRODUCT
    // =====================================

    const product = new Product({
      brand: brand.trim(),
      productName: productName.trim(),
      category: category.trim(),

      price: numericPrice,
      discount: numericDiscount,

      discountedPrice:
        discountedPrice !== undefined &&
        discountedPrice !== null
          ? Number(discountedPrice)
          : calculatedDiscountedPrice,

      stock: numericStock,

      status: status || 'Active',
      description: description || '',
      image: image || '',

      color: color || 'Black',

      subImages: Array.isArray(subImages)
        ? subImages
            .filter((item) => typeof item === 'string')
            .map((item) => item.trim())
            .filter(Boolean)
            .slice(0, 5)
        : [],

      rating: Number(rating) || 0,
      reviews: Number(reviews) || 0,
      badge: badge || ''
    });

    // =====================================
    // SAVE PRODUCT
    // =====================================

    const savedProduct = await product.save();

    console.log(
      'PRODUCT SAVED SUCCESSFULLY:',
      savedProduct._id
    );

    return res.status(201).json({
      status: 'success',
      message: 'Product added successfully',
      product: savedProduct
    });

  } catch (error) {
    console.error('ERROR ADDING PRODUCT:', error);

    return res.status(500).json({
      status: 'error',
      message: error.message || 'Internal Server Error'
    });
  }
});



// =========================================================
// GET ALL PRODUCTS
// =========================================================

app.get('/Admin/AdminProducts', async (req, res) => {

  try {

    const products =
      await Product.find()
        .sort({
          createdAt: -1
        });


    return res.status(200).json({

      status: 'success',

      products

    });


  } catch (error) {

    console.error(
      'ERROR FETCHING PRODUCTS:',
      error
    );


    return res.status(500).json({

      status: 'error',

      message:
        'Failed to fetch products',

      error:
        error.message

    });

  }

});