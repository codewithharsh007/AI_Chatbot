"use client";
import { useState, useEffect, useContext } from "react";
import {
  User,
  Settings,
  Sparkles,
  Volume2,
  Moon,
  Sun,
  Save,
  LogOut,
  Mail,
  Shield,
} from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { ThemeContext } from "@/app/context/ThemeContext";

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    personality: "Friendly",
    tone: "Balanced",
    nicknames: [],
    preferences: {
      ttsEnabled: true,
      ttsSpeed: 1.0,
      notifications: true,
    },
  });
  const [newNickname, setNewNickname] = useState("");

  const router = useRouter();
  const { isDark, toggleTheme } = useContext(ThemeContext);

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await response.json();
      setUser(data.user);
      setFormData({
        username: data.user.username,
        personality: data.user.personality,
        tone: data.user.tone,
        nicknames: data.user.nicknames || [],
        preferences: data.user.preferences || {
          ttsEnabled: true,
          ttsSpeed: 1.0,
          notifications: true,
        },
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch("/api/user/profile", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error("Failed to update profile");
      }

      const data = await response.json();
      setUser(data.user);
      toast.success("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const addNickname = () => {
    if (
      newNickname.trim() &&
      !formData.nicknames.includes(newNickname.trim())
    ) {
      setFormData({
        ...formData,
        nicknames: [...formData.nicknames, newNickname.trim()],
      });
      setNewNickname("");
    }
  };

  const removeNickname = (nickname) => {
    setFormData({
      ...formData,
      nicknames: formData.nicknames.filter((n) => n !== nickname),
    });
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("isGuest");

    toast.success("Logged out successfully!");
    router.push("/login");
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900 dark:bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const personalities = [
    "Professional",
    "Casual",
    "Creative",
    "Friendly",
    "Technical",
    "Humorous",
  ];
  const tones = ["Formal", "Informal", "Balanced"];

  return (
    <div className="min-h-screen bg-gray-50 p-6 dark:bg-slate-900">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              User Profile
            </h1>
            <p className="text-gray-600 dark:text-slate-400">
              Manage your account settings and preferences
            </p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push("/")}
              className="rounded-lg bg-gray-200 px-4 py-2 text-gray-900 transition-colors hover:bg-gray-300 dark:bg-slate-700 dark:text-white dark:hover:bg-slate-600"
            >
              Back to Chat
            </button>
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2 text-white transition-colors hover:bg-red-500"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl bg-white p-8 shadow-xl dark:bg-slate-800">
          {/* Basic Info */}
          <div className="mb-8 flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-gray-200 dark:bg-slate-700">
              <User className="h-10 w-10 text-gray-700 dark:text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                {user?.username}
              </h2>
              <div className="mt-1 flex items-center gap-2">
                <Mail className="h-4 w-4 text-gray-500 dark:text-slate-400" />
                <p className="text-gray-600 dark:text-slate-400">
                  {user?.email}
                </p>
              </div>
              {user?.isAdmin && (
                <div className="mt-2 flex w-fit items-center gap-2 rounded-full bg-purple-600 px-3 py-1 text-sm font-semibold text-white">
                  <Shield className="h-3 w-3" />
                  Admin
                </div>
              )}
              <p className="mt-2 text-sm text-gray-500 dark:text-slate-500">
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-8">
            {/* Username */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <User className="h-4 w-4" />
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-slate-500"
              />
            </div>

            {/* Personality */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <Sparkles className="h-4 w-4" />
                Personality Mode
              </label>
              <select
                value={formData.personality}
                onChange={(e) =>
                  setFormData({ ...formData, personality: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-slate-500"
              >
                {personalities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            {/* Tone */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <Settings className="h-4 w-4" />
                Tone Preference
              </label>
              <select
                value={formData.tone}
                onChange={(e) =>
                  setFormData({ ...formData, tone: e.target.value })
                }
                className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-slate-500"
              >
                {tones.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            {/* Nicknames */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                Nicknames
              </label>
              <div className="mb-2 flex gap-2">
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNickname()}
                  placeholder="Add a nickname..."
                  className="flex-1 rounded-lg border border-gray-300 bg-white p-3 text-gray-900 outline-none focus:border-blue-500 dark:border-slate-600 dark:bg-slate-700 dark:text-white dark:focus:border-slate-500"
                />
                <button
                  onClick={addNickname}
                  className="rounded-lg bg-gray-300 px-6 py-3 text-gray-900 transition-colors hover:bg-gray-400 dark:bg-slate-600 dark:text-white dark:hover:bg-slate-500"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.nicknames.map((nickname) => (
                  <div
                    key={nickname}
                    className="flex items-center gap-2 rounded-full bg-gray-200 px-4 py-2 text-sm text-gray-900 dark:bg-slate-700 dark:text-white"
                  >
                    {nickname}
                    <button
                      onClick={() => removeNickname(nickname)}
                      className="text-gray-600 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* TTS Settings */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                <Volume2 className="h-4 w-4" />
                Text-to-Speech Settings
              </label>
              <div className="space-y-4 rounded-lg bg-gray-100 p-4 dark:bg-slate-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-900 dark:text-white">
                    Enable TTS
                  </span>
                  <input
                    type="checkbox"
                    checked={formData.preferences.ttsEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          ttsEnabled: e.target.checked,
                        },
                      })
                    }
                    className="h-5 w-5 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-gray-700 dark:text-slate-300">
                    TTS Speed: {formData.preferences.ttsSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={formData.preferences.ttsSpeed}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          ttsSpeed: parseFloat(e.target.value),
                        },
                      })
                    }
                    className="w-full"
                  />
                </div>
              </div>
            </div>

            {/* Theme Toggle */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                {isDark ? (
                  <Moon className="h-4 w-4" />
                ) : (
                  <Sun className="h-4 w-4" />
                )}
                Theme Preference
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() => !isDark && toggleTheme()}
                  className={`flex-1 rounded-lg p-4 transition-colors ${
                    isDark
                      ? "bg-slate-600 text-white"
                      : "bg-gray-200 text-gray-400 hover:bg-gray-300"
                  }`}
                >
                  <Moon className="mx-auto mb-2 h-5 w-5" />
                  Dark
                </button>
                <button
                  onClick={() => isDark && toggleTheme()}
                  className={`flex-1 rounded-lg p-4 transition-colors ${
                    !isDark
                      ? "bg-blue-600 text-white"
                      : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                  }`}
                >
                  <Sun className="mx-auto mb-2 h-5 w-5" />
                  Light
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => router.push("/")}
              className="rounded-lg border border-gray-300 px-6 py-3 text-gray-900 transition-colors hover:bg-gray-100 dark:border-slate-600 dark:text-white dark:hover:bg-slate-700"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-6 py-3 text-white transition-colors hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <Save className="h-4 w-4" />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
