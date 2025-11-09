"use client";
import { useState, useEffect } from "react";
import { User, Settings, Sparkles, Volume2, Moon, Save } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";

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
      theme: "dark",
      ttsEnabled: true,
      ttsSpeed: 1.0,
      notifications: true,
    },
  });
  const [newNickname, setNewNickname] = useState("");

  const router = useRouter();

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
        nicknames: data.user.nicknames,
        preferences: data.user.preferences,
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
    if (newNickname.trim() && !formData.nicknames.includes(newNickname.trim())) {
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

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-900">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  const personalities = ["Professional", "Casual", "Creative", "Friendly", "Technical", "Humorous"];
  const tones = ["Formal", "Informal", "Balanced"];

  return (
    <div className="min-h-screen bg-slate-900 p-6">
      <div className="mx-auto max-w-4xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">User Profile</h1>
            <p className="text-slate-400">Manage your account settings and preferences</p>
          </div>
          <button
            onClick={() => router.push("/")}
            className="rounded-lg bg-slate-700 px-4 py-2 text-white transition-colors hover:bg-slate-600"
          >
            Back to Chat
          </button>
        </div>

        {/* Profile Card */}
        <div className="rounded-xl bg-slate-800 p-8 shadow-xl">
          {/* Basic Info */}
          <div className="mb-8 flex items-center gap-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-slate-700">
              <User className="h-10 w-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-white">{user?.username}</h2>
              <p className="text-slate-400">{user?.email}</p>
              <p className="mt-1 text-sm text-slate-500">
                Member since {new Date(user?.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>

          {/* Settings Sections */}
          <div className="space-y-8">
            {/* Username */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                <User className="h-4 w-4" />
                Username
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-slate-500"
              />
            </div>

            {/* Personality */}
            <div>
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                <Sparkles className="h-4 w-4" />
                Personality Mode
              </label>
              <select
                value={formData.personality}
                onChange={(e) => setFormData({ ...formData, personality: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-slate-500"
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
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                <Settings className="h-4 w-4" />
                Tone Preference
              </label>
              <select
                value={formData.tone}
                onChange={(e) => setFormData({ ...formData, tone: e.target.value })}
                className="w-full rounded-lg border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-slate-500"
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
              <label className="mb-2 flex items-center gap-2 text-sm font-semibold text-white">
                Nicknames
              </label>
              <div className="mb-2 flex gap-2">
                <input
                  type="text"
                  value={newNickname}
                  onChange={(e) => setNewNickname(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNickname()}
                  placeholder="Add a nickname..."
                  className="flex-1 rounded-lg border border-slate-600 bg-slate-700 p-3 text-white outline-none focus:border-slate-500"
                />
                <button
                  onClick={addNickname}
                  className="rounded-lg bg-slate-600 px-6 py-3 text-white transition-colors hover:bg-slate-500"
                >
                  Add
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.nicknames.map((nickname) => (
                  <div
                    key={nickname}
                    className="flex items-center gap-2 rounded-full bg-slate-700 px-4 py-2 text-sm text-white"
                  >
                    {nickname}
                    <button
                      onClick={() => removeNickname(nickname)}
                      className="text-slate-400 hover:text-white"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* TTS Settings */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Volume2 className="h-4 w-4" />
                Text-to-Speech Settings
              </label>
              <div className="space-y-4 rounded-lg bg-slate-700 p-4">
                <div className="flex items-center justify-between">
                  <span className="text-white">Enable TTS</span>
                  <input
                    type="checkbox"
                    checked={formData.preferences.ttsEnabled}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        preferences: { ...formData.preferences, ttsEnabled: e.target.checked },
                      })
                    }
                    className="h-5 w-5 cursor-pointer"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-sm text-slate-300">
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

            {/* Theme */}
            <div>
              <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-white">
                <Moon className="h-4 w-4" />
                Theme Preference
              </label>
              <div className="flex gap-4">
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, theme: "dark" },
                    })
                  }
                  className={`flex-1 rounded-lg p-4 transition-colors ${
                    formData.preferences.theme === "dark"
                      ? "bg-slate-600 text-white"
                      : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                  }`}
                >
                  Dark
                </button>
                <button
                  onClick={() =>
                    setFormData({
                      ...formData,
                      preferences: { ...formData.preferences, theme: "light" },
                    })
                  }
                  className={`flex-1 rounded-lg p-4 transition-colors ${
                    formData.preferences.theme === "light"
                      ? "bg-slate-600 text-white"
                      : "bg-slate-700 text-slate-400 hover:bg-slate-600"
                  }`}
                >
                  Light
                </button>
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end gap-4">
            <button
              onClick={() => router.push("/")}
              className="rounded-lg border border-slate-600 px-6 py-3 text-white transition-colors hover:bg-slate-700"
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
