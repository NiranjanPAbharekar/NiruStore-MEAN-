import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

import Admin from './model/AdminLogin.js';

async function createAdmin() {
  try {
    const { MongoDB_URL, ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD } =
      process.env;

    if (
      !MongoDB_URL ||
      !ADMIN_NAME ||
      !ADMIN_EMAIL ||
      !ADMIN_PASSWORD
    ) {
      throw new Error(
        'MongoDB_URL, ADMIN_NAME, ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env'
      );
    }

    if (ADMIN_PASSWORD.length < 12) {
      throw new Error(
        'Use an admin password with at least 12 characters.'
      );
    }

    await mongoose.connect(MongoDB_URL);

    const email = ADMIN_EMAIL.trim().toLowerCase();

    const existingAdmin = await Admin.findOne({ email });

    if (existingAdmin) {
      console.log('An admin account with this email already exists.');
      return;
    }

    const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

    await Admin.create({
      name: ADMIN_NAME.trim(),
      email,
      password: hashedPassword,
      role: 'admin'
    });

    console.log('Admin account created successfully.');
    console.log(`Admin email: ${email}`);
  } catch (error) {
    console.error('Admin creation failed:', error.message);
    process.exitCode = 1;
  } finally {
    await mongoose.disconnect();
  }
}

createAdmin();