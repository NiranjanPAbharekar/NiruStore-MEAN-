
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

import Admin from './AdminAuth.js';

const router = express.Router();

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (
      typeof email !== 'string' ||
      typeof password !== 'string' ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required.'
      });
    }

    const admin = await Admin.findOne({
      email: email.trim().toLowerCase()
    }).select('+password');

    if (!admin) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    const passwordMatches = await bcrypt.compare(
      password,
      admin.password
    );

    if (!passwordMatches) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.'
      });
    }

    if (!process.env.JWT_SECRET) {
      console.error('JWT_SECRET is missing from .env');

      return res.status(500).json({
        success: false,
        message: 'Authentication is not configured.'
      });
    }

    const token = jwt.sign(
      {
        adminId: admin._id.toString(),
        role: 'admin'
      },
      process.env.JWT_SECRET,
      {
        expiresIn: '1d'
      }
    );

    return res.status(200).json({
      success: true,
      message: 'Admin login successful.',
      token,
      admin: {
        id: admin._id,
        name: admin.name,
        email: admin.email,
        role: admin.role
      }
    });
  } catch (error) {
  console.error('ADMIN LOGIN ERROR:', error);

  return res.status(500).json({
    success: false,
    message: 'An error occurred during admin login.',
    // Development debugging only; remove before production.
    ...(process.env.NODE_ENV !== 'production' && {
      debug: error.message
    })
  });
}
});

export default router;