'use client';
import React from 'react';

export default function Navbar() {
  return (
    <nav className="w-full bg-[#343541] border-b border-[#565869] py-3 px-6 flex items-center justify-between">
      <h2 className="text-white font-semibold text-lg tracking-wide">
        ChatBud
      </h2>
      <div className="text-gray-400 text-sm">
        powered by <span className="text-[#19c37d] font-medium">AI</span>
      </div>
    </nav>
  );
}
