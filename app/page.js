"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import ChatbotEnhanced from "../components/ChatbotEnhanced";
import WelcomeModal from "../components/WelcomeModal";
import toast from "react-hot-toast";

export default function Home() {
  const [conversations, setConversations] = useState([]);
  const [currentId, setCurrentId] = useState(null);
  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [isGuest, setIsGuest] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  // Load conversations when authenticated
  useEffect(() => {
    if (isAuthenticated && !isGuest) {
      loadConversations();
    } else if (isAuthenticated && isGuest) {
      // Guest mode: create a temporary chat
      const guestChat = {
        id: "guest-" + Date.now(),
        title: "Guest Chat",
        messages: [],
      };
      setConversations([guestChat]);
      setCurrentId(guestChat.id);
      setLoading(false);
    }
  }, [isAuthenticated, isGuest]);

  const checkAuth = () => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");
    const guestStatus = localStorage.getItem("isGuest");

    if (token && user) {
      try {
        const userData = JSON.parse(user);

        // Redirect admin to admin panel
        if (userData.isAdmin) {
          router.push("/admin");
          return;
        }

        setIsAuthenticated(true);
        setIsGuest(guestStatus === "true");
      } catch (error) {
        console.error("Auth parse error:", error);
        setShowWelcomeModal(true);
        setLoading(false);
      }
    } else {
      setShowWelcomeModal(true);
      setLoading(false);
    }
  };

  // Load conversations from API
  const loadConversations = async () => {
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/chats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success && data.chats) {
        setConversations(data.chats);

        // Select first chat or create new one
        if (data.chats.length > 0) {
          setCurrentId(data.chats[0].id);
        } else {
          // No chats, create first one
          await addConversation();
        }
      }
    } catch (error) {
      console.error("Error loading conversations:", error);
      toast.error("Failed to load conversations");
      // Create a default chat on error
      await addConversation();
    } finally {
      setLoading(false);
    }
  };

  const handleGuestLogin = (user) => {
    setIsAuthenticated(true);
    setIsGuest(true);
    setShowWelcomeModal(false);
  };

  const currentConversation = conversations.find((c) => c.id === currentId) || {
    id: currentId,
    title: "New Chat",
    messages: [],
  };

  // Add conversation with API call for registered users
  const addConversation = async () => {
    if (isGuest) {
      // Guest mode: create temporary local chat
      const newId = "guest-" + Date.now();
      const newConv = {
        id: newId,
        title: "New Chat",
        messages: [],
      };
      setConversations([...conversations, newConv]);
      setCurrentId(newId);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/chats", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          title: "New Chat",
        }),
      });

      const data = await response.json();
      if (data.success && data.chat) {
        const newConv = {
          id: data.chat.id, // ✅ Real MongoDB ObjectId
          title: data.chat.title,
          messages: [],
          createdAt: data.chat.createdAt,
        };

        setConversations([newConv, ...conversations]);
        setCurrentId(newConv.id);
        toast.success("New chat created");
      }
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast.error("Failed to create new chat");
    }
  };

  // Delete conversation with API call for registered users
  const deleteConversation = async (id) => {
    if (conversations.length === 1) {
      toast.error("Cannot delete the last chat");
      return;
    }

    if (isGuest) {
      // Guest mode: just remove from state
      setConversations(conversations.filter((c) => c.id !== id));
      if (currentId === id) {
        const remaining = conversations.filter((c) => c.id !== id);
        setCurrentId(remaining[0]?.id);
      }
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`/api/chats/${id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await response.json();
      if (data.success) {
        setConversations(conversations.filter((c) => c.id !== id));

        // If deleted chat was selected, select another
        if (currentId === id) {
          const remaining = conversations.filter((c) => c.id !== id);
          setCurrentId(remaining.length > 0 ? remaining[0].id : null);
        }

        toast.success("Chat deleted");
      } else {
        toast.error(data.error || "Failed to delete chat");
      }
    } catch (error) {
      console.error("Error deleting conversation:", error);
      toast.error("Failed to delete chat");
    }
  };

  // Update messages for current conversation
  const updateMessages = (newMessages) => {
    setConversations((prev) =>
      prev.map((conv) =>
        conv.id === currentId ? { ...conv, messages: newMessages } : conv,
      ),
    );
  };

  // Update conversation title (used by Sidebar)
  const updateConversation = (id, newTitle) => {
    setConversations((prevConvs) =>
      prevConvs.map((conv) =>
        conv.id === id ? { ...conv, title: newTitle } : conv,
      ),
    );
  };

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showWelcomeModal && (
        <WelcomeModal
          onClose={() => setShowWelcomeModal(false)}
          onGuestLogin={handleGuestLogin}
        />
      )}

      <div className="flex h-screen w-full overflow-hidden">
        {/* Show sidebar for all authenticated users (both guest and registered) */}
        {isAuthenticated && (
          <Sidebar
            conversations={conversations}
            currentId={currentId}
            setCurrentId={setCurrentId}
            addConversation={addConversation}
            deleteConversation={deleteConversation}
            updateConversation={updateConversation}
          />
        )}
        <div className="flex flex-1 flex-col">
          <ChatbotEnhanced
            key={currentId}
            messages={currentConversation.messages || []}
            updateMessages={updateMessages}
          />
        </div>
      </div>
    </>
  );
}
