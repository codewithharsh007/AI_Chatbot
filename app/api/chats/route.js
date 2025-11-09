import { NextResponse } from 'next/server';
import { verifyToken } from '@/middlewares/auth';
import { connectToDB } from '@/lib/mongodb';
import Chat from '@/models/Chat';

// GET all user's chats (with pagination)
export async function GET(request) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50'); // Increased default
    const page = parseInt(searchParams.get('page') || '1');

    await connectToDB();

    const chats = await Chat.find({ userId: authResult.userId, isActive: true })
      .sort({ updatedAt: -1 }) // Changed from lastMessageAt to updatedAt
      .limit(limit)
      .skip((page - 1) * limit)
      .select('_id title updatedAt createdAt personalityUsed modelUsed messages')
      .lean();

    // Format for frontend
    const formattedChats = chats.map(chat => ({
      id: chat._id.toString(),
      title: chat.title || 'New Chat',
      updatedAt: chat.updatedAt,
      createdAt: chat.createdAt,
      messageCount: chat.messages?.length || 0,
      personalityUsed: chat.personalityUsed,
      modelUsed: chat.modelUsed
    }));

    const total = await Chat.countDocuments({ userId: authResult.userId, isActive: true });

    return NextResponse.json({
      success: true,
      chats: formattedChats,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      }
    });
  } catch (error) {
    console.error('Get chats error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chats', details: error.message },
      { status: 500 }
    );
  }
}

// POST - Create new empty chat
export async function POST(request) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { title, personalityUsed, modelUsed } = await request.json();

    await connectToDB();

    const newChat = new Chat({
      userId: authResult.userId,
      title: title || 'New Chat',
      personalityUsed: personalityUsed || 'Friendly',
      modelUsed: modelUsed || 'gemini-2.5-flash', // Updated default
      messages: [],
      isActive: true,
      tokensUsed: 0
    });

    await newChat.save();

    return NextResponse.json({
      success: true,
      message: 'Chat created successfully',
      chat: {
        id: newChat._id.toString(),
        title: newChat.title,
        createdAt: newChat.createdAt
      }
    }, { status: 201 });
  } catch (error) {
    console.error('Create chat error:', error);
    return NextResponse.json(
      { error: 'Failed to create chat', details: error.message },
      { status: 500 }
    );
  }
}

// REMOVED DELETE - Use /api/chats/[id] instead for RESTful approach
