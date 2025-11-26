import bcrypt from 'bcryptjs';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/middlewares/auth';
import { NextResponse } from 'next/server';
import { generateOTP, sendOTPEmail } from '@/utils/emailService';

export async function POST(request) {
  try {
    const { email, password, otp, action } = await request.json();

    await connectToDB();

    // Step 1: Request OTP
    if (action === 'request-otp') {
      // Validation
      if (!email || !password) {
        return NextResponse.json(
          { error: 'Email and password are required' },
          { status: 400 }
        );
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Check if account is active
      if (!user.isActive) {
        return NextResponse.json(
          { error: 'Account is deactivated. Please contact support.' },
          { status: 403 }
        );
      }

      // Verify password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return NextResponse.json(
          { error: 'Invalid credentials' },
          { status: 401 }
        );
      }

      // Generate OTP
      const otpCode = generateOTP();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

      // Save OTP to user
      user.otp = otpCode;
      user.otpExpiry = otpExpiry;
      await user.save();

      // Send OTP email
      const emailResult = await sendOTPEmail(user.email, otpCode, user.username);
      
      if (!emailResult.success) {
        return NextResponse.json(
          { error: 'Failed to send OTP email. Please try again.' },
          { status: 500 }
        );
      }

      return NextResponse.json({
        success: true,
        message: 'OTP sent to your email',
        requireOTP: true,
      });
    }

    // Step 2: Verify OTP and complete login
    if (action === 'verify-otp') {
      if (!email || !otp) {
        return NextResponse.json(
          { error: 'Email and OTP are required' },
          { status: 400 }
        );
      }

      // Find user
      const user = await User.findOne({ email: email.toLowerCase() });
      if (!user) {
        return NextResponse.json(
          { error: 'User not found' },
          { status: 404 }
        );
      }

      // Check OTP
      if (!user.otp || !user.otpExpiry) {
        return NextResponse.json(
          { error: 'No OTP found. Please request a new one.' },
          { status: 400 }
        );
      }

      // Check if OTP expired
      if (new Date() > user.otpExpiry) {
        return NextResponse.json(
          { error: 'OTP has expired. Please request a new one.' },
          { status: 400 }
        );
      }

      // Verify OTP
      if (user.otp !== otp) {
        return NextResponse.json(
          { error: 'Invalid OTP' },
          { status: 401 }
        );
      }

      // Clear OTP
      user.otp = undefined;
      user.otpExpiry = undefined;
      user.isVerified = true;
      user.lastLogin = new Date();
      await user.save();

      // Generate token
      const token = generateToken(user._id);

      // Return user data (without password)
      const userData = {
        id: user._id,
        username: user.username,
        email: user.email,
        personality: user.personality,
        tone: user.tone,
        nicknames: user.nicknames,
        preferences: user.preferences,
        profilePicture: user.profilePicture,
        isAdmin: user.isAdmin,
      };

      return NextResponse.json({
        success: true,
        message: 'Login successful',
        token,
        user: userData,
      });
    }

    // Legacy login without OTP (fallback)
    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    await connectToDB();

    // Find user
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Check if account is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Account is deactivated. Please contact support.' },
        { status: 403 }
      );
    }

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    // Return user data (without password)
    const userData = {
      id: user._id,
      username: user.username,
      email: user.email,
      personality: user.personality,
      tone: user.tone,
      nicknames: user.nicknames,
      preferences: user.preferences,
      profilePicture: user.profilePicture,
      isAdmin: user.isAdmin,
    };

    return NextResponse.json({
      success: true,
      message: 'Login successful',
      token,
      user: userData,
    });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
}
