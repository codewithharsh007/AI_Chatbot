"use client";
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import ChatbotEnhanced from "../components/ChatbotEnhanced";

export default function Home() {
  const [conversations, setConversations] = useState([
    { id: 1, title: "New Chat", messages: [] },
  ]);
  const [currentId, setCurrentId] = useState(1);

  const currentConversation = conversations.find((c) => c.id === currentId);

  const addConversation = () => {
    const newId = Math.max(...conversations.map((c) => c.id)) + 1;
    setConversations([
      ...conversations,
      { id: newId, title: "New Chat", messages: [] },
    ]);
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
    <div className="flex h-screen w-full">
      <Sidebar
        conversations={conversations}
        currentId={currentId}
        setCurrentId={setCurrentId}
        addConversation={addConversation}
        deleteConversation={deleteConversation}
      />
      <ChatbotEnhanced
        key={currentId}
        messages={currentConversation.messages}
        updateMessages={updateMessages}
      />
    </div>
  );
}
