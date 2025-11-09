import { verifyToken } from '@/middlewares/auth';
import { NextResponse } from 'next/server';

export async function GET(request) {
  try {
    const authResult = await verifyToken(request);
    
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    return NextResponse.json({
      success: true,
      user: authResult.user,
    });
  } catch (error) {
    console.error('Verify token error:', error);
    return NextResponse.json(
      { error: 'Token verification failed' },
      { status: 500 }
    );
  }
}
