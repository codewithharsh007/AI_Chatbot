import { connectToDB } from '@/lib/mongodb';
import User from '@/models/User';
import { generateToken } from '@/middlewares/auth';
import { NextResponse } from 'next/server';

export async function POST(request) {
  try {
    await connectToDB();

    // Generate random guest username
    const randomId = Math.random().toString(36).substring(2, 10);
    const guestUsername = `Guest_${randomId}`;
    const guestEmail = `guest_${randomId}@vaaniai.temp`;

    // Create guest user
    const guestUser = new User({
      username: guestUsername,
      email: guestEmail,
      provider: 'guest',
      isGuest: true,
      isVerified: false,
      personality: 'Friendly',
      tone: 'Balanced',
      preferences: {
        theme: 'dark',
        language: 'en',
        ttsEnabled: true,
        ttsVoice: 'default',
        ttsSpeed: 1.0,
        notifications: false,
      },
    });

    await guestUser.save();

    // Generate token
    const token = generateToken(guestUser._id);

    // Return user data
    const userData = {
      id: guestUser._id,
      username: guestUser.username,
      email: guestUser.email,
      personality: guestUser.personality,
      tone: guestUser.tone,
      nicknames: guestUser.nicknames,
      preferences: guestUser.preferences,
      isGuest: true,
      isAdmin: false,
    };

    return NextResponse.json({
      success: true,
      message: 'Guest login successful',
      token,
      user: userData,
    }, { status: 201 });
  } catch (error) {
    console.error('Guest login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during guest login' },
      { status: 500 }
    );
  }
}
