import { NextResponse } from 'next/server';
import { verifyToken } from '@/middlewares/auth';
import { connectToDB } from '@/lib/mongodb';
import Chat from '@/models/Chat';

// GET single chat with all messages
export async function GET(request, { params }) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDB();

    const chat = await Chat.findOne({
      _id: params.id,
      userId: authResult.userId,
      isActive: true
    }).lean();

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      chat: {
        id: chat._id.toString(),
        title: chat.title,
        messages: chat.messages || [],
        personalityUsed: chat.personalityUsed,
        modelUsed: chat.modelUsed,
        tokensUsed: chat.tokensUsed || 0,
        createdAt: chat.createdAt,
        updatedAt: chat.updatedAt,
        lastMessageAt: chat.lastMessageAt
      }
    });
  } catch (error) {
    console.error('Get chat error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat', details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - Update chat title
export async function PATCH(request, { params }) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    const { title } = await request.json();

    if (!title || !title.trim()) {
      return NextResponse.json(
        { error: 'Title is required' },
        { status: 400 }
      );
    }

    await connectToDB();

    const chat = await Chat.findOneAndUpdate(
      { _id: params.id, userId: authResult.userId, isActive: true },
      { title: title.trim() },
      { new: true }
    );

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Chat title updated',
      chat: {
        id: chat._id.toString(),
        title: chat.title
      }
    });
  } catch (error) {
    console.error('Update chat error:', error);
    return NextResponse.json(
      { error: 'Failed to update chat', details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - Soft delete a chat
export async function DELETE(request, { params }) {
  try {
    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json(
        { error: authResult.error },
        { status: authResult.status }
      );
    }

    await connectToDB();

    const chat = await Chat.findOne({
      _id: params.id,
      userId: authResult.userId
    });

    if (!chat) {
      return NextResponse.json(
        { error: 'Chat not found' },
        { status: 404 }
      );
    }

    // Soft delete
    chat.isActive = false;
    await chat.save();

    return NextResponse.json({
      success: true,
      message: 'Chat deleted successfully'
    });
  } catch (error) {
    console.error('Delete chat error:', error);
    return NextResponse.json(
      { error: 'Failed to delete chat', details: error.message },
      { status: 500 }
    );
  }
}
