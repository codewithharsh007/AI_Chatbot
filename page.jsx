'use client';
import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import Chatbot from '../components/Chatbot';

export default function Home() {
  const [conversations, setConversations] = useState([
    { id: 1, title: 'New Chat', messages: [] },
  ]);
  const [currentId, setCurrentId] = useState(1);

  const currentConversation = conversations.find((c) => c.id === currentId);

  const addConversation = () => {
    const newId = Math.max(...conversations.map((c) => c.id)) + 1;
    setConversations([...conversations, { id: newId, title: 'New Chat', messages: [] }]);
    setCurrentId(newId);
  };

  const deleteConversation = (id) => {
    if (conversations.length === 1) return;
    setConversations(conversations.filter((c) => c.id !== id));
    if (currentId === id) setCurrentId(conversations[0].id);
  };

  const updateMessages = (newMessages) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentId ? { ...conv, messages: newMessages } : conv
      )
    );
  };

  return (
    <div className="flex w-full h-full">
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        setCurrentId={setCurrentId}
        addConversation={addConversation}
        deleteConversation={deleteConversation}
      />
      <Chatbot
        key={currentId}
        messages={currentConversation.messages}
        updateMessages={updateMessages}
      />
    </div>
  );
}