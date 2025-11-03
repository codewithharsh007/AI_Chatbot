'use client';
import React, { useState, useRef, useEffect } from 'react';

export default function Chatbot({ messages, updateMessages }) {
  const [input, setInput] = useState('');
  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const sendMessage = () => {
    if (!input.trim()) return;
    const newMessage = { text: input, sender: 'user' };
    updateMessages([...messages, newMessage]);
    setInput('');

    setTimeout(() => {
      updateMessages((prev) => [
        ...prev,
        { text: "I'm your AI ChatBud 🤖 — how can I help?", sender: 'bot' },
      ]);
    }, 800);
  };

  return (
    <div className="flex-1 flex flex-col bg-[#343541]">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {messages.length === 0 ? (
          <div className="text-center text-gray-400 mt-40">
            <h1 className="text-4xl font-bold text-white mb-4">ChatBud</h1>
            <p>Start typing below to begin your conversation.</p>
          </div>
        ) : (
          messages.map((m, i) => (
            <div
              key={i}
              className={`flex ${
                m.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              <div
                className={`max-w-[75%] px-4 py-2 rounded-2xl text-sm ${
                  m.sender === 'user'
                    ? 'bg-[#19c37d] text-white rounded-br-none'
                    : 'bg-[#40414f] text-gray-100 rounded-bl-none'
                }`}
              >
                {m.text}
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area */}
      <div className="border-t border-[#565869] p-4 bg-[#343541]">
        <div className="flex items-center gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Message ChatBud..."
            className="flex w-full bg-transparent border border-[#565869] rounded-lg px-4 py-2 text-sm outline-none text-white focus:border-gray-400"
          />
          <button
            onClick={sendMessage}
            className="bg-[#19c37d] hover:bg-[#15a76c] transition px-4 py-2 rounded-lg text-sm font-medium"
          >
            Send
          </button>
        </div>
        <p className="text-center text-xs text-gray-500 mt-3">
          ChatBud can make mistakes. Check important info.
        </p>
      </div>
    </div>
  );
}
