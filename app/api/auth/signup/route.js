import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/middlewares/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    const { username, email, password } = await request.json();

    // Validation
    if (!username || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: 'Username must be at least 3 characters' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    // Email validation
    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email' },
        { status: 400 }
      );
    }

    await connectToDB();

    // Check if user already exists
    const existingUser = await User.findOne({
      $or: [
        { email: email.toLowerCase() },
        { username: username }
      ]
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        );
      }
      if (existingUser.username === username) {
        return NextResponse.json(
          { error: 'Username already taken' },
          { status: 409 }
        );
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    const newUser = new User({
      username,
      email: email.toLowerCase(),
      password: hashedPassword,
      personality: 'Friendly',
      tone: 'Balanced',
      preferences: {
        theme: 'dark',
        language: 'en',
        ttsEnabled: true,
        ttsVoice: 'default',
        ttsSpeed: 1.0,
        notifications: true,
      },
    });

    await newUser.save();

    // Generate token
    const token = generateToken(newUser._id);

    // Return user data (without password)
    const userData = {
      id: newUser._id,
      username: newUser.username,
      email: newUser.email,
      personality: newUser.personality,
      tone: newUser.tone,
      nicknames: newUser.nicknames,
      preferences: newUser.preferences,
      isAdmin: newUser.isAdmin,
    };

    return NextResponse.json({
      success: true,
      message: 'Account created successfully',
      token,
      user: userData,
    }, { status: 201 });
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
}
