"use client";
import {
  Plus,
  MessageSquare,
  Trash2,
  Menu,
  User,
  Edit2,
  Check,
  X,
  Moon,
  Sun,
  Shield,
  Settings,
} from "lucide-react";
import { useState, useContext, useEffect } from "react";
import { ThemeContext } from "@/app/context/ThemeContext";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

export default function Sidebar({
  conversations,
  currentId,
  setCurrentId,
  addConversation,
  deleteConversation,
  updateConversation, // Add this prop
}) {
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [editTitle, setEditTitle] = useState("");
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const router = useRouter();

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = () => {
    const user = localStorage.getItem("user");
    if (user) {
      const userData = JSON.parse(user);
      setIsAdmin(userData.isAdmin || false);
    }
  };

  const startEditing = (id, title) => {
    setEditingId(id);
    setEditTitle(title);
  };

  const saveEdit = async (id) => {
    if (!editTitle.trim()) {
      toast.error("Title cannot be empty");
      return;
    }

    try {
      const token = localStorage.getItem("token");
      
      // Call API to update chat title
      const response = await fetch(`/api/chats/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: editTitle.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        // Update local state
        if (updateConversation) {
          updateConversation(id, editTitle.trim());
        }
        toast.success("Chat title updated");
        setEditingId(null);
        setEditTitle("");
      } else {
        toast.error(data.error || "Failed to update title");
      }
    } catch (error) {
      console.error("Error updating chat title:", error);
      toast.error("Failed to update title");
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditTitle("");
  };

  const handleKeyPress = (e, id) => {
    if (e.key === "Enter") {
      saveEdit(id);
    } else if (e.key === "Escape") {
      cancelEdit();
    }
  };

  return (
    <>
      {/* Mobile Menu Toggle */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className={`fixed top-4 left-4 z-50 rounded-lg p-2 md:hidden ${
          isDark
            ? "bg-slate-800 text-white hover:bg-slate-700"
            : "bg-gray-200 text-gray-900 hover:bg-gray-300"
        }`}
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar */}
      <div
        className={`${sidebarOpen ? "translate-x-0" : "-translate-x-full"} w-64 ${isDark ? "bg-slate-900 text-white" : "bg-gray-50 text-gray-900"} flex flex-col border-r transition-transform duration-300 ${isDark ? "border-slate-700" : "border-gray-200"} fixed inset-y-0 left-0 z-40 md:relative md:translate-x-0`}
      >
        {/* New Chat Button */}
        <div
          className={`border-b p-3 ${isDark ? "border-slate-800" : "border-gray-200"}`}
        >
          <button
            onClick={() => {
              addConversation();
              setSidebarOpen(false);
            }}
            className={`flex w-full items-center justify-center gap-2 rounded-lg px-4 py-3 font-medium transition-colors ${
              isDark
                ? "bg-slate-800 text-white hover:bg-slate-700"
                : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-100"
            }`}
          >
            <Plus className="h-5 w-5" />
            <span className="text-sm">New chat</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="hide-scrollbar flex-1 space-y-1 overflow-y-auto p-2">
          {conversations.map((conv) => (
            <div
              key={conv.id}
              className={`group relative flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2.5 transition-all ${
                currentId === conv.id
                  ? isDark
                    ? "bg-slate-800"
                    : "border border-gray-200 bg-white"
                  : isDark
                    ? "hover:bg-slate-800"
                    : "hover:border hover:border-gray-200 hover:bg-white"
              }`}
            >
              {editingId === conv.id ? (
                <div className="flex flex-1 items-center gap-2">
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onKeyDown={(e) => handleKeyPress(e, conv.id)}
                    className={`flex-1 ${isDark ? "bg-slate-700 text-white" : "bg-gray-100 text-gray-900"} rounded px-2 py-1 text-sm outline-none`}
                    autoFocus
                    maxLength={50}
                  />
                  <button
                    onClick={() => saveEdit(conv.id)}
                    className="text-green-500 hover:text-green-400 transition-colors"
                    title="Save"
                  >
                    <Check className="h-4 w-4" />
                  </button>
                  <button
                    onClick={cancelEdit}
                    className="text-red-500 hover:text-red-400 transition-colors"
                    title="Cancel"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <>
                  <MessageSquare
                    className={`h-4 w-4 flex-shrink-0 ${isDark ? "text-slate-400" : "text-gray-500"}`}
                  />
                  <div
                    onClick={() => {
                      setCurrentId(conv.id);
                      setSidebarOpen(false);
                    }}
                    className="flex-1 truncate text-sm"
                  >
                    {conv.title}
                  </div>
                  <div className="hidden items-center gap-1 group-hover:flex">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        startEditing(conv.id, conv.title);
                      }}
                      className={`rounded p-1 transition-colors ${isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"}`}
                      title="Edit title"
                    >
                      <Edit2 className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteConversation(conv.id);
                      }}
                      className={`rounded p-1 transition-colors ${isDark ? "text-red-400 hover:bg-slate-700" : "text-red-500 hover:bg-gray-100"}`}
                      title="Delete chat"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>

        {/* Bottom Section */}
        <div
          className={`border-t p-3 ${isDark ? "border-slate-800" : "border-gray-200"} space-y-2`}
        >
          {/* Settings Button */}
          <button
            onClick={() => setShowSettings(!showSettings)}
            className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 transition-colors ${
              isDark
                ? "hover:bg-slate-800"
                : "hover:border hover:border-gray-200 hover:bg-white"
            }`}
          >
            <Settings
              className={`h-5 w-5 ${isDark ? "text-slate-400" : "text-gray-600"}`}
            />
            <span className="text-sm font-medium">Settings</span>
          </button>

          {/* Settings Dropdown */}
          {showSettings && (
            <div
              className={`${isDark ? "bg-slate-800" : "border border-gray-200 bg-white"} space-y-2 rounded-lg p-3`}
            >
              {/* Theme Toggle */}
              <button
                onClick={toggleTheme}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"
                }`}
              >
                {isDark ? (
                  <>
                    <Sun className="h-4 w-4 text-yellow-400" />
                    <span className="text-sm">Light Mode</span>
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 text-slate-600" />
                    <span className="text-sm">Dark Mode</span>
                  </>
                )}
              </button>

              {/* Profile */}
              <button
                onClick={() => {
                  router.push("/profile");
                  setSidebarOpen(false);
                }}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                  isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"
                }`}
              >
                <User
                  className={`h-4 w-4 ${isDark ? "text-slate-400" : "text-gray-600"}`}
                />
                <span className="text-sm">Profile</span>
              </button>

              {/* Admin Dashboard */}
              {isAdmin && (
                <button
                  onClick={() => {
                    router.push("/admin");
                    setSidebarOpen(false);
                  }}
                  className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 transition-colors ${
                    isDark ? "hover:bg-slate-700" : "hover:bg-gray-100"
                  }`}
                >
                  <Shield className="h-4 w-4 text-purple-400" />
                  <span className="text-sm">Admin Dashboard</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </>
  );
}
