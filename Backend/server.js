
import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';

import User from './model/user.js';
import Product from './model/Product.js';
import orderRoutes from './Routes/orderRoutes.js';
import userRoute from './Routes/userRoute.js';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import nodemailer from 'nodemailer';
import HomeContent from './model/HomeContent.js';
import AdminAuth from './Routes/AdminAuth.js';
import { requireAdmin } from './Middelware/requireAdmin.js';
import AllBrand from './Routes/AllBrand.js';
import AllReview from './Routes/AllReview.js';
import dns from 'node:dns';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8040;
const MONGODB_URL = process.env.MongoDB_URL;

// =====================================================
// DNS CONFIGURATION
// =====================================================

dns.setServers(['8.8.8.8', '8.8.4.4']);

// =====================================================
// CORS CONFIGURATION
// =====================================================

const allowedOrigins = [
  'http://localhost:4200',
  'https://astonishing-platypus-78395b.netlify.app'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked for origin: ${origin}`));
    }
  },
  methods: [
    'GET',
    'POST',
    'PUT',
    'DELETE',
    'PATCH',
    'OPTIONS'
  ],
  allowedHeaders: [
    'Content-Type',
    'Authorization'
  ]
}));

// =====================================================
// MIDDLEWARE
// =====================================================

app.use(express.json());

app.use(express.urlencoded({
  extended: true
}));

// =====================================================
// ORDER ROUTES
// =====================================================

app.use('/order', orderRoutes);

app.use('/api/users', userRoute);
app.use('/api/admin', AdminAuth);
app.use('/api/Brands', AllBrand);
app.use('/api/Reviews', AllReview);

// =====================================================
// GET TOTAL REGISTERED USERS — ADMIN DASHBOARD
// =====================================================

app.get('/api/users', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();

    return res.status(200).json({
      status: 'success',
      totalUsers
    });

  } catch (error) {
    console.error('Customer count error:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch customer count.'
    });
  }
});

// =====================================================
// TEST ROUTE
// =====================================================

app.get('/', (req, res) => {
  res.send('NiruStore Ecommerce Backend is Running 🚀');
});

// =====================================================
// API TEST
// =====================================================

app.get('/api/test', (req, res) => {
  res.json({
    status: 'success',
    message: 'API is working'
  });
});

// =====================================================
// REGISTER
// =====================================================

app.post('/api/register', async (req, res) => {
  try {
    console.log('REGISTER BODY:', req.body);

    const {
      fullName,
      email,
      password,
      confirmPassword,
      acceptTerms
    } = req.body;

    if (
      !fullName ||
      !email ||
      !password ||
      !confirmPassword
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'All fields are required'
      });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Passwords do not match'
      });
    }

    if (!acceptTerms) {
      return res.status(400).json({
        status: 'error',
        message: 'You must accept the terms and conditions'
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({
      email: normalizedEmail
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      name: fullName.trim(),
      email: normalizedEmail,
      password: hashedPassword,
      confirmpassword: hashedPassword,
      terms: acceptTerms
    });

    await newUser.save();

    return res.status(201).json({
      status: 'success',
      message: 'User registered successfully'
    });

  } catch (error) {
    console.error('ERROR DURING REGISTRATION:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error'
    });
  }
});

// =====================================================
// LOGIN — GENERATE JWT TOKEN
// =====================================================

app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'error',
        message: 'Email and password are required'
      });
    }

    const user = await User.findOne({
      email: email.trim().toLowerCase()
    });

    if (!user) {
      return res.status(404).json({
        status: 'error',
        message: 'User does not exist. Please signup first.'
      });
    }

    const isPasswordCorrect = await bcrypt.compare(
      password,
      user.password
    );

    if (!isPasswordCorrect) {
      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing from .env');

      return res.status(500).json({
        status: 'error',
        message: 'Authentication configuration error'
      });
    }

    const token = jwt.sign(
      {
        id: user._id.toString(),
        email: user.email
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {
    console.error('LOGIN ERROR:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error'
    });
  }
});

// =====================================================
// FORGOT PASSWORD — SEND RESET EMAIL
// =====================================================

app.post('/api/forgot-password', async (req, res) => {
  try {
    const email = req.body.email?.trim().toLowerCase();

    if (!email) {
      return res.status(400).json({
        status: 'error',
        message: 'Email is required.'
      });
    }

    const user = await User.findOne({ email });

    const genericMessage =
      'If an account exists for this email, a password reset link will be sent.';

    if (!user) {
      return res.status(200).json({
        status: 'success',
        message: genericMessage
      });
    }

    if (
      !process.env.EMAIL_USER ||
      !process.env.EMAIL_APP_PASSWORD ||
      !process.env.JWT_SECRET
    ) {
      throw new Error('Email or token configuration is missing.');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');

    const resetTokenHash = crypto
      .createHash('sha256')
      .update(resetToken)
      .digest('hex');

    user.resetPasswordToken = resetTokenHash;
    user.resetPasswordExpires = new Date(
      Date.now() + 15 * 60 * 1000
    );

    await user.save();

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_APP_PASSWORD
      }
    });

    try {
      await transporter.verify();
      console.log('Gmail authentication successful!');
    } catch (error) {
      console.error('Gmail authentication failed:', error.message);
    }

    const resetLink =
      `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      await transporter.sendMail({
        from: process.env.EMAIL_USER,
        to: user.email,
        subject: 'NiruStore Password Reset',
        text: `Use this link to reset your NiruStore password. It expires in 15 minutes:\n\n${resetLink}\n\nIf you did not request this, ignore this email.`
      });

    } catch (emailError) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;

      await user.save();

      throw emailError;
    }

    return res.status(200).json({
      status: 'success',
      message: genericMessage
    });

  } catch (error) {
    console.error('FORGOT PASSWORD ERROR:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Unable to send the reset email. Please try again later.'
    });
  }
});

// =====================================================
// RESET PASSWORD — VERIFY TOKEN AND SAVE NEW PASSWORD
// =====================================================

app.post('/api/reset-password', async (req, res) => {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        status: 'error',
        message: 'Reset token and new password are required.'
      });
    }

    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

    if (!passwordRegex.test(newPassword)) {
      return res.status(400).json({
        status: 'error',
        message: 'Use at least 8 characters with uppercase, lowercase, a number and a special character.'
      });
    }

    const resetTokenHash = crypto
      .createHash('sha256')
      .update(token)
      .digest('hex');

    const user = await User.findOne({
      resetPasswordToken: resetTokenHash,
      resetPasswordExpires: { $gt: new Date() }
    });

    if (!user) {
      return res.status(400).json({
        status: 'error',
        message: 'Reset link is invalid or expired. Please request a new one.'
      });
    }

    user.password = await bcrypt.hash(newPassword, 10);

    if (user.schema.path('confirmpassword')) {
      user.confirmpassword = user.password;
    }

    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    return res.status(200).json({
      status: 'success',
      message: 'Password reset successfully. Please log in.'
    });

  } catch (error) {
    console.error('RESET PASSWORD ERROR:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Unable to reset your password. Please try again.'
    });
  }
});

// =====================================================
// AUTHENTICATION MIDDLEWARE
// =====================================================

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  const token = authHeader?.startsWith('Bearer ')
    ? authHeader.substring(7)
    : null;

  if (!token) {
    return res.status(401).json({
      status: 'error',
      message: 'Authentication token not found. Please log in again.'
    });
  }

  if (!process.env.JWT_SECRET) {
    return res.status(500).json({
      status: 'error',
      message: 'Authentication configuration error'
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );

    if (
      typeof decoded === 'string' ||
      !decoded.id
    ) {
      return res.status(401).json({
        status: 'error',
        message: 'Invalid authentication token.'
      });
    }

    req.user = decoded;
    next();

  } catch (error) {
    return res.status(401).json({
      status: 'error',
      message: 'Your session has expired. Please log in again.'
    });
  }
}

// =====================================================
// NORMALIZE HOME CATEGORY
// =====================================================

function normalizeHomeCategory(value) {
  const category = String(value || '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z]/g, '');

  const aliases = {
    watch: 'watches',
    watches: 'watches',

    perfume: 'perfumes',
    perfumes: 'perfumes',
    fragrance: 'perfumes',
    fragrances: 'perfumes',

    shoe: 'shoes',
    shoes: 'shoes',
    footwear: 'shoes',

    accessory: 'accessories',
    accessories: 'accessories',
    bag: 'accessories',
    bags: 'accessories',
    jewellery: 'accessories',
    jewelry: 'accessories',

    men: 'men-fashion',
    mens: 'men-fashion',
    menfashion: 'men-fashion',
    mensfashion: 'men-fashion',
    menswear: 'men-fashion',

    women: 'women-fashion',
    womens: 'women-fashion',
    womenfashion: 'women-fashion',
    womensfashion: 'women-fashion',
    womenswear: 'women-fashion'
  };

  return aliases[category] || category;
}

// =====================================================
// HOME PAGE CONTENT
// =====================================================

app.get('/api/home-content', async (req, res) => {
  try {
    const homeContent = await HomeContent.findOne().lean();

    if (!homeContent) {
      return res.status(404).json({
        success: false,
        message: 'Home page content not found. Please seed the content first.'
      });
    }

    const products = await Product.find(
      { status: 'Active' },
      { category: 1 }
    ).lean();

    const categoryCounts = {};

    for (const product of products) {
      const key = normalizeHomeCategory(product.category);

      categoryCounts[key] = (categoryCounts[key] || 0) + 1;
    }

    const collections = (homeContent.collections || []).map(
      (collection) => {
        const key = normalizeHomeCategory(
          collection.categoryKey || collection.name
        );

        return {
          ...collection,
          items: categoryCounts[key] || 0
        };
      }
    );

    return res.status(200).json({
      success: true,
      heroSlides: homeContent.heroSlides || [],
      collections
    });

  } catch (error) {
    console.error('HOME CONTENT API ERROR:', error);

    return res.status(500).json({
      success: false,
      message: 'Failed to load home page content.'
    });
  }
});

// =====================================================
// CHANGE PASSWORD
// =====================================================

app.post(
  '/api/change-password',
  authenticateToken,
  async (req, res) => {
    try {
      const {
        currentPassword,
        newPassword
      } = req.body;

      if (!currentPassword || !newPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'Current and new passwords are required.'
        });
      }

      if (newPassword.length < 8) {
        return res.status(400).json({
          status: 'error',
          message: 'New password must be at least 8 characters.'
        });
      }

      if (currentPassword === newPassword) {
        return res.status(400).json({
          status: 'error',
          message: 'New password must differ from your current password.'
        });
      }

      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({
          status: 'error',
          message: 'User account not found.'
        });
      }

      const isCurrentPasswordCorrect = await bcrypt.compare(
        currentPassword,
        user.password
      );

      if (!isCurrentPasswordCorrect) {
        return res.status(400).json({
          status: 'error',
          message: 'Your current password is incorrect.'
        });
      }

      user.password = await bcrypt.hash(newPassword, 10);

      if (user.schema.path('confirmpassword')) {
        user.confirmpassword = user.password;
      }

      await user.save();

      return res.status(200).json({
        status: 'success',
        message: 'Password changed successfully.'
      });

    } catch (error) {
      console.error('CHANGE PASSWORD ERROR:', error);

      return res.status(500).json({
        status: 'error',
        message: 'Unable to change password. Please try again.'
      });
    }
  }
);

// =====================================================
// GET ALL PRODUCTS
// =====================================================

app.get('/Admin/AdminProducts', async (req, res) => {
  try {
    const products = await Product.find().sort({
      createdAt: -1
    });

    return res.status(200).json({
      status: 'success',
      products
    });

  } catch (error) {
    console.error('ERROR FETCHING PRODUCTS:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to fetch products',
      error: error.message
    });
  }
});

// =====================================================
// ADD PRODUCT
// =====================================================

app.post('/Admin/AdminProducts', async (req, res) => {
  try {
    console.log('PRODUCT BODY:', req.body);

    const {
      brand,
      productName,
      category,
      price,
      stock,
      status,
      description,
      image
    } = req.body;

    if (
      !brand ||
      !productName ||
      !category ||
      price === undefined ||
      stock === undefined ||
      !description
    ) {
      return res.status(400).json({
        status: 'error',
        message: 'All required product fields are required'
      });
    }

    const product = new Product({
      brand,
      productName,
      category,
      price: Number(price),
      stock: Number(stock),
      status: status || 'Active',
      description,
      image: image || ''
    });

    const savedProduct = await product.save();

    console.log('PRODUCT SAVED:', savedProduct);

    return res.status(201).json({
      status: 'success',
      message: 'Product added successfully',
      product: savedProduct
    });

  } catch (error) {
    console.error('ERROR ADDING PRODUCT:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error',
      error: error.message
    });
  }
});

// =====================================================
// UPDATE PRODUCT
// =====================================================

app.put('/Admin/AdminProducts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const updatedProduct = await Product.findByIdAndUpdate(
      id,
      req.body,
      {
        new: true,
        runValidators: true
      }
    );

    if (!updatedProduct) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Product updated successfully',
      product: updatedProduct
    });

  } catch (error) {
    console.error('ERROR UPDATING PRODUCT:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to update product',
      error: error.message
    });
  }
});

// =====================================================
// DELETE PRODUCT
// =====================================================

app.delete('/Admin/AdminProducts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const deletedProduct = await Product.findByIdAndDelete(id);

    if (!deletedProduct) {
      return res.status(404).json({
        status: 'error',
        message: 'Product not found'
      });
    }

    return res.status(200).json({
      status: 'success',
      message: 'Product deleted successfully'
    });

  } catch (error) {
    console.error('ERROR DELETING PRODUCT:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Failed to delete product',
      error: error.message
    });
  }
});

// =====================================================
// MONGODB + SERVER
// =====================================================

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
    console.error('Error connecting to MongoDB:', error);
  });
