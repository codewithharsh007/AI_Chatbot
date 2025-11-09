import { NextResponse } from 'next/server';
import { verifyToken } from '@/middlewares/auth';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function GET(request) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDB();
    const user = await User.findById(authResult.userId).select('-password');

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        personality: user.personality,
        tone: user.tone,
        nicknames: user.nicknames,
        preferences: user.preferences,
        profilePicture: user.profilePicture,
        isAdmin: user.isAdmin,
        createdAt: user.createdAt,
        lastLogin: user.lastLogin,
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const updates = await request.json();

    await connectToDB();
    const user = await User.findById(authResult.userId);

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Update allowed fields
    if (updates.username) user.username = updates.username;
    if (updates.personality) user.personality = updates.personality;
    if (updates.tone) user.tone = updates.tone;
    if (updates.nicknames) user.nicknames = updates.nicknames;
    if (updates.profilePicture) user.profilePicture = updates.profilePicture;
    if (updates.preferences) {
      user.preferences = { ...user.preferences, ...updates.preferences };
    }

    await user.save();

    return NextResponse.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        personality: user.personality,
        tone: user.tone,
        nicknames: user.nicknames,
        preferences: user.preferences,
        profilePicture: user.profilePicture,
      }
    });
  } catch (error) {
    console.error('Update profile error:', error);
    return NextResponse.json(
      { error: 'Failed to update profile' },
      { status: 500 }
    );
  }
}
