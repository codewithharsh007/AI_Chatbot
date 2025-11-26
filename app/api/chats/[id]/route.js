import { NextResponse } from "next/server";
import { verifyToken } from "@/middlewares/auth";
import { connectToDB } from "@/lib/mongodb";
import Chat from "@/models/Chat";
import mongoose from "mongoose";

// Helper to check ObjectId validity and cast, or return null
function toObjectId(id) {
  if (!mongoose.Types.ObjectId.isValid(id)) return null;
  return new mongoose.Types.ObjectId(id);
}

// GET - fetch chat
export async function GET(request, context) {
  try {
    const { params } = context;
    const { id } = await params;
    const objectId = toObjectId(id);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid chat ID." }, { status: 400 });
    }

    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectToDB();

    const chat = await Chat.findOne({
      _id: objectId,
      userId: authResult.userId,
      isActive: true,
    }).lean();

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
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
        lastMessageAt: chat.lastMessageAt,
      },
    });
  } catch (error) {
    console.error("Get chat error:", error);
    return NextResponse.json(
      { error: "Failed to fetch chat", details: error.message },
      { status: 500 }
    );
  }
}

// PATCH - update chat title
export async function PATCH(request, context) {
  try {
    const { params } = context;
    const { id } = await params;
    const objectId = toObjectId(id);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid chat ID." }, { status: 400 });
    }

    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    const { title } = await request.json();
    if (!title || !title.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }

    await connectToDB();

    const chat = await Chat.findOneAndUpdate(
      { _id: objectId, userId: authResult.userId, isActive: true },
      { title: title.trim() },
      { new: true }
    );

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: "Chat title updated",
      chat: {
        id: chat._id.toString(),
        title: chat.title,
      },
    });
  } catch (error) {
    console.error("Update chat error:", error);
    return NextResponse.json(
      { error: "Failed to update chat", details: error.message },
      { status: 500 }
    );
  }
}

// DELETE - soft delete chat
export async function DELETE(request, context) {
  try {
    const { params } = context;
    const { id } = await params;
    const objectId = toObjectId(id);
    if (!objectId) {
      return NextResponse.json({ error: "Invalid chat ID." }, { status: 400 });
    }

    const authResult = await verifyToken(request);
    if (authResult.error) {
      return NextResponse.json({ error: authResult.error }, { status: authResult.status });
    }

    await connectToDB();

    const chat = await Chat.findOne({
      _id: objectId,
      userId: authResult.userId,
    });

    if (!chat) {
      return NextResponse.json({ error: "Chat not found" }, { status: 404 });
    }

    chat.isActive = false;
    await chat.save();

    return NextResponse.json({
      success: true,
      message: "Chat deleted successfully",
    });
  } catch (error) {
    console.error("Delete chat error:", error);
    return NextResponse.json(
      { error: "Failed to delete chat", details: error.message },
      { status: 500 }
    );
  }
}
