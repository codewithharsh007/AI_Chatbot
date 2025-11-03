'use client';
import React from 'react';
import { Plus, Trash2, MessageSquare } from 'lucide-react';

export default function Sidebar({
  conversations,
  currentId,
  setCurrentId,
  addConversation,
  deleteConversation,
}) {
  return (
    <div className="w-64 bg-[#202123] text-gray-200 flex flex-col border-r border-[#2c2d31]">
      {/* New Chat Button */}
      <div className="p-3 border-b border-[#2c2d31]">
        <button
          onClick={addConversation}
          className="w-full flex items-center gap-3 px-3 py-3 bg-[#343541] hover:bg-[#3e3f4b] rounded-lg transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="text-sm font-medium">New Chat</span>
        </button>
      </div>

      {/* Chat History */}
      <div className="flex-1 overflow-y-auto p-2">
        {conversations.map((conv) => (
          <div
            key={conv.id}
            onClick={() => setCurrentId(conv.id)}
            className={`group flex items-center justify-between gap-2 px-3 py-3 mb-1 rounded-lg cursor-pointer transition-colors ${
              currentId === conv.id ? 'bg-[#343541]' : 'hover:bg-[#2a2b32]'
            }`}
          >
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              <span className="text-sm truncate">{conv.title}</span>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                deleteConversation(conv.id);
              }}
              className="p-1 hover:bg-[#40414f] rounded opacity-0 group-hover:opacity-100 transition"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="p-3 border-t border-[#2c2d31] text-xs text-gray-400">
        ChatBud © 2025
      </div>
    </div>
  );
}
