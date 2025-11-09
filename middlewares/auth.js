import jwt from 'jsonwebtoken';
import { NextResponse } from 'next/server';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/User';

export async function verifyToken(request) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return { error: 'No token provided', status: 401 };
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    await connectToDB();
    const user = await User.findById(decoded.userId).select('-password');
    
    if (!user) {
      return { error: 'User not found', status: 404 };
    }

    if (!user.isActive) {
      return { error: 'Account is deactivated', status: 403 };
    }

    return { user, userId: decoded.userId };
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return { error: 'Invalid token', status: 401 };
    }
    if (error.name === 'TokenExpiredError') {
      return { error: 'Token expired', status: 401 };
    }
    return { error: 'Authentication failed', status: 500 };
  }
}

export function generateToken(userId) {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function verifyAdmin(user) {
  if (!user || !user.isAdmin) {
    return { error: 'Admin access required', status: 403 };
  }
  return { authorized: true };
}
