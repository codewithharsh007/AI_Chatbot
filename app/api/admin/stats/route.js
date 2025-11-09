import { NextResponse } from 'next/server';
import { verifyToken, verifyAdmin } from '@/middlewares/auth';
import { connectToDB } from '@/lib/mongodb';
import User from '@/models/User';
import Chat from '@/models/Chat';
import AdminAnalytics from '@/models/AdminAnalytics';

export async function GET(request) {
  try {
    // Verify authentication
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    // Verify admin access
    const adminCheck = verifyAdmin(authResult.user);
    if (adminCheck.error) {
      return NextResponse.json(
        { error: adminCheck.error },
        { status: adminCheck.status }
      );
    }

    await connectToDB();

    // Get today's date range
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    // Quick stats
    const [
      totalUsers,
      newUsersToday,
      totalChats,
      totalRequests,
      todayRequests,
      totalCost,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ createdAt: { $gte: today, $lt: tomorrow } }),
      Chat.countDocuments(),
      AdminAnalytics.countDocuments(),
      AdminAnalytics.countDocuments({ date: { $gte: today, $lt: tomorrow } }),
      AdminAnalytics.aggregate([
        { $group: { _id: null, total: { $sum: '$cost' } } },
      ]),
    ]);

    return NextResponse.json({
      success: true,
      stats: {
        totalUsers,
        newUsersToday,
        totalChats,
        totalRequests,
        todayRequests,
        totalCost: totalCost[0]?.total || 0,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch stats' },
      { status: 500 }
    );
  }
}
