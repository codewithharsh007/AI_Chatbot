// app/api/auth/signup/route.js
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { verifyTimedOTP } from '@/utils/emailService';

export async function POST(request) {
  try {
    const { username, email, password, otp } = await request.json();

    // Validation
    if (!username || !email || !password || !otp) {
      return NextResponse.json(
        { error: 'All fields including OTP are required' },
        { status: 400 }
      );
    }

    // Verify OTP
    const isValidOTP = verifyTimedOTP(email, otp);
    
    if (!isValidOTP) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      );
    }

    await connectToDB();

    // Check if user exists
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { username }],
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'User with this email or username already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      isVerified: true,
      personality: 'Friendly',
      tone: 'Balanced',
      preferences: {
        ttsEnabled: true,
        ttsSpeed: 1.0,
        notifications: true,
      },
    });

    // Generate JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '7d' }
    );

    return NextResponse.json({
      success: true,
      message: 'Account created successfully!',
      token,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        personality: user.personality,
        isAdmin: user.isAdmin || false,
      },
    });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Signup failed. Please try again.' },
      { status: 500 }
    );
  }
}
