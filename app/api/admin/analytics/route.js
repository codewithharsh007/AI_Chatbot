import { NextResponse } from 'next/server';
import { verifyToken } from '@/middlewares/auth';
import { connectToDB } from '@/lib/mongodb';
import AdminAnalytics from '@/models/AdminAnalytics';
import User from '@/models/User';
import Chat from '@/models/Chat';

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

    // Check if user is admin (simplified)
    await connectToDB();
    const user = await User.findById(authResult.userId);
    
    if (!user || !user.isAdmin) {
      return NextResponse.json(
        { error: 'Unauthorized. Admin access required.' },
        { status: 403 }
      );
    }

    const { searchParams } = new URL(request.url);
    const days = parseInt(searchParams.get('days') || '30'); // Changed default to 30
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    // Get total users
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ 
      lastLogin: { $gte: dateFrom } // More accurate "active" definition
    });

    // Get total chats
    const totalChats = await Chat.countDocuments({ isActive: true });
    const totalActiveChats = await Chat.countDocuments({ 
      isActive: true,
      updatedAt: { $gte: dateFrom }
    });

    // Get analytics for period
    const analytics = await AdminAnalytics.find({
      createdAt: { $gte: dateFrom }, // Changed from 'date' to 'createdAt'
      success: true // Only count successful requests
    }).lean();

    // Calculate totals
    const totalTokens = analytics.reduce((sum, a) => sum + (a.tokensConsumed?.totalTokens || 0), 0);
    const totalCost = analytics.reduce((sum, a) => sum + (a.cost || 0), 0);
    const avgResponseTime = analytics.length > 0
      ? analytics.reduce((sum, a) => sum + (a.responseTime || 0), 0) / analytics.length
      : 0;

    // Model usage breakdown
    const modelUsage = {};
    const modelCosts = {};
    const modelTokens = {};
    
    analytics.forEach(a => {
      const model = a.modelUsed || 'unknown';
      modelUsage[model] = (modelUsage[model] || 0) + 1;
      modelCosts[model] = (modelCosts[model] || 0) + (a.cost || 0);
      modelTokens[model] = (modelTokens[model] || 0) + (a.tokensConsumed?.totalTokens || 0);
    });

    // Emotion breakdown
    const emotionStats = {};
    analytics.forEach(a => {
      const emotion = a.emotionDetected || 'neutral';
      emotionStats[emotion] = (emotionStats[emotion] || 0) + 1;
    });

    // Response type breakdown
    const responseTypeStats = {};
    analytics.forEach(a => {
      const type = a.responseType || 'text';
      responseTypeStats[type] = (responseTypeStats[type] || 0) + 1;
    });

    // Personality mode usage
    const personalityStats = {};
    analytics.forEach(a => {
      const personality = a.personalityMode || 'Friendly';
      personalityStats[personality] = (personalityStats[personality] || 0) + 1;
    });

    // Daily usage with better date handling
    const dailyUsage = [];
    const dailyMap = {};
    
    analytics.forEach(a => {
      const date = new Date(a.createdAt).toISOString().split('T')[0];
      if (!dailyMap[date]) {
        dailyMap[date] = { 
          date,
          requests: 0, 
          cost: 0, 
          tokens: 0,
          avgResponseTime: 0,
          responseTimeSum: 0
        };
      }
      dailyMap[date].requests++;
      dailyMap[date].cost += (a.cost || 0);
      dailyMap[date].tokens += (a.tokensConsumed?.totalTokens || 0);
      dailyMap[date].responseTimeSum += (a.responseTime || 0);
    });

    // Convert to array and calculate averages
    Object.values(dailyMap).forEach(day => {
      day.avgResponseTime = Math.round(day.responseTimeSum / day.requests);
      delete day.responseTimeSum;
      dailyUsage.push(day);
    });

    // Sort by date
    dailyUsage.sort((a, b) => new Date(a.date) - new Date(b.date));

    // Top users by usage
    const userUsage = {};
    analytics.forEach(a => {
      const userId = a.userId?.toString() || 'unknown';
      if (!userUsage[userId]) {
        userUsage[userId] = { requests: 0, tokens: 0, cost: 0 };
      }
      userUsage[userId].requests++;
      userUsage[userId].tokens += (a.tokensConsumed?.totalTokens || 0);
      userUsage[userId].cost += (a.cost || 0);
    });

    const topUsers = Object.entries(userUsage)
      .map(([userId, stats]) => ({ userId, ...stats }))
      .sort((a, b) => b.requests - a.requests)
      .slice(0, 10);

    return NextResponse.json({
      success: true,
      period: {
        days,
        from: dateFrom.toISOString(),
        to: new Date().toISOString()
      },
      overview: {
        totalUsers,
        activeUsers,
        totalChats,
        totalActiveChats,
        totalRequests: analytics.length,
        totalTokens,
        totalCost: parseFloat(totalCost.toFixed(6)),
        avgResponseTime: Math.round(avgResponseTime),
      },
      modelUsage: {
        count: modelUsage,
        costs: Object.fromEntries(
          Object.entries(modelCosts).map(([k, v]) => [k, parseFloat(v.toFixed(6))])
        ),
        tokens: modelTokens
      },
      emotionStats,
      responseTypeStats,
      personalityStats,
      dailyUsage,
      topUsers,
    });
  } catch (error) {
    console.error('Admin analytics error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics', details: error.message },
      { status: 500 }
    );
  }
}
