import express from 'express';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import cors from 'cors';
import bcrypt from 'bcryptjs';
import User from './model/user.js';

dotenv.config();

const app = express();

const PORT = process.env.PORT || 8040;
const MONGODB_URL = process.env.MongoDB_URL;

// ===============================
// Middleware
// ===============================

app.use(cors({
  origin: 'http://localhost:4200',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ===============================
// MongoDB Connection
// ===============================

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

// ===============================
// Test Route
// ===============================

app.get('/', (req, res) => {
  res.send('Ecommerce Backend Server is Running 🚀');
});

// ===============================
// Register API
// ===============================

app.post('/api/register', async (req, res) => {

  try {

    console.log('REGISTER BODY:', req.body);

    const {
      fullName,
      email,
      password,
      phone,
      confirmPassword,
      acceptTerms
    } = req.body;

    // ===============================
    // Validation
    // ===============================

    if (!fullName || !email || !password || !confirmPassword) {
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

    // ===============================
    // Check Existing User
    // ===============================

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        message: 'User with this email already exists'
      });
    }

    // ===============================
    // Hash Password
    // ===============================

    const hashedPassword = await bcrypt.hash(password, 10);

    // ===============================
    // Create User
    // ===============================

    const newUser = new User({
      name: fullName,
      email: email,
      phone: phone,
      password: hashedPassword,
      confirmpassword: hashedPassword,
      terms: acceptTerms
    });

    await newUser.save();

    // ===============================
    // Success Response
    // ===============================

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

// app.post('/api/login', async (req, res) => {
//   try {

//     const { email, password } = req.body;

//     console.log('============================');
//     console.log('LOGIN API CALLED');
//     console.log('Email:', email);
//     console.log('============================');

//     // Find user
//     const user = await User.findOne({ email });

//     // User not found
//     if (!user) {

//       return res.status(404).json({
//         status: 'error',
//         message: 'User does not exist. Please signup first.'
//       });

//     }

//     // Compare password
//     const isPasswordCorrect = await bcrypt.compare(
//       password,
//       user.password
//     );

//     // Wrong password
//     if (!isPasswordCorrect) {

//       return res.status(401).json({
//         status: 'error',
//         message: 'Incorrect email or password'
//       });

//     }

//     // Login successful
//     return res.status(200).json({
//       status: 'success',
//       message: 'Login successful',

//       user: {
//         id: user._id,
//         name: user.name,
//         email: user.email
//       }
//     });

//   } catch (error) {

//     console.error('LOGIN ERROR:', error);

//     return res.status(500).json({
//       status: 'error',
//       message: 'Internal Server Error'
//     });

//   }
// });
console.log('================================');
console.log('AUTH.JS STARTED');
console.log('================================');

app.get('/api/test', (req, res) => {
  res.json({
    message: 'API is working'
  });
});

console.log('REGISTERING LOGIN ROUTE');

app.post('/api/login', async (req, res) => {

  console.log('🔥🔥🔥 LOGIN ROUTE HIT 🔥🔥🔥');

  try {

    const { email, password } = req.body;

    console.log('Email:', email);

    const user = await User.findOne({ email });

    if (!user) {

      console.log('❌ USER NOT FOUND');

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

      console.log('❌ WRONG PASSWORD');

      return res.status(401).json({
        status: 'error',
        message: 'Incorrect email or password'
      });
    }

    console.log('✅ LOGIN SUCCESS');

    return res.status(200).json({
      status: 'success',
      message: 'Login successful',
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });

  } catch (error) {

    console.error('❌ LOGIN ERROR:', error);

    return res.status(500).json({
      status: 'error',
      message: 'Internal Server Error'
    });
  }

});