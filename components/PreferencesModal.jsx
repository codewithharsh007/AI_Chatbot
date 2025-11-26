"use client";

import { useState, useEffect } from "react";
import { X, Sparkles, Volume2, Check } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function PreferencesModal({ onClose, onComplete }) {
  const [preferences, setPreferences] = useState({
    personality: "Friendly",
    tone: "Balanced",
    ttsEnabled: true,
    ttsSpeed: 1.0,
    theme: "dark",
  });
  const [saving, setSaving] = useState(false);
  const [show, setShow] = useState(false);

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
  }, []);

  const personalities = [
    { value: "Professional", emoji: "💼", desc: "Business-focused responses" },
    { value: "Casual", emoji: "😊", desc: "Relaxed and friendly" },
    { value: "Creative", emoji: "🎨", desc: "Innovative and imaginative" },
    { value: "Friendly", emoji: "🤝", desc: "Warm and approachable" },
    { value: "Technical", emoji: "🔧", desc: "Detailed and precise" },
    { value: "Humorous", emoji: "😄", desc: "Fun and entertaining" },
  ];

  const tones = [
    { value: "Formal", desc: "Professional and polite" },
    { value: "Informal", desc: "Casual and conversational" },
    { value: "Balanced", desc: "Mix of formal and casual" },
  ];

  const handleSave = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem("token");
      const response = await axios.put(
        "/api/user/profile",
        { preferences },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.success) {
        // Update local storage
        const user = JSON.parse(localStorage.getItem("user"));
        user.personality = preferences.personality;
        user.tone = preferences.tone;
        user.preferences = {
          ...user.preferences,
          ttsEnabled: preferences.ttsEnabled,
          ttsSpeed: preferences.ttsSpeed,
          theme: preferences.theme,
        };
        localStorage.setItem("user", JSON.stringify(user));

        toast.success("Preferences saved!");
        handleClose();
        if (onComplete) onComplete();
      }
    } catch (error) {
      console.error("Error saving preferences:", error);
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const handleClose = () => {
    setShow(false);
    setTimeout(onClose, 300);
  };

  const handleSkip = () => {
    handleClose();
    if (onComplete) onComplete();
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`relative w-full max-w-2xl transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Close button */}
        <button
          onClick={handleSkip}
          className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600"
        >
          <X className="h-5 w-5" />
        </button>

        {/* Header */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-linear-to-br from-purple-500 to-pink-500">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            Customize Your Experience
          </h2>
          <p className="text-gray-600">
            Set your preferences to personalize your AI assistant
          </p>
        </div>

        {/* Preferences */}
        <div className="space-y-6 overflow-y-auto" style={{ maxHeight: "60vh" }}>
          {/* Personality */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Sparkles className="h-4 w-4 text-purple-600" />
              AI Personality
            </label>
            <div className="grid grid-cols-2 gap-3">
              {personalities.map((p) => (
                <button
                  key={p.value}
                  onClick={() =>
                    setPreferences({ ...preferences, personality: p.value })
                  }
                  className={`group relative rounded-xl border-2 p-4 text-left transition-all ${
                    preferences.personality === p.value
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {preferences.personality === p.value && (
                    <div className="absolute right-2 top-2 rounded-full bg-purple-500 p-1">
                      <Check className="h-3 w-3 text-white" />
                    </div>
                  )}
                  <div className="text-2xl">{p.emoji}</div>
                  <div className="mt-2 font-semibold text-gray-900">
                    {p.value}
                  </div>
                  <div className="text-xs text-gray-600">{p.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Tone */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Conversation Tone
            </label>
            <div className="grid grid-cols-3 gap-3">
              {tones.map((t) => (
                <button
                  key={t.value}
                  onClick={() => setPreferences({ ...preferences, tone: t.value })}
                  className={`rounded-xl border-2 p-4 text-center transition-all ${
                    preferences.tone === t.value
                      ? "border-purple-500 bg-purple-50"
                      : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <div className="font-semibold text-gray-900">{t.value}</div>
                  <div className="mt-1 text-xs text-gray-600">{t.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Text-to-Speech */}
          <div>
            <label className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <Volume2 className="h-4 w-4 text-purple-600" />
              Text-to-Speech
            </label>
            <div className="space-y-4 rounded-xl border-2 border-gray-200 bg-gray-50 p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-700">Enable voice responses</span>
                <label className="relative inline-flex cursor-pointer items-center">
                  <input
                    type="checkbox"
                    checked={preferences.ttsEnabled}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        ttsEnabled: e.target.checked,
                      })
                    }
                    className="peer sr-only"
                  />
                  <div className="peer h-6 w-11 rounded-full bg-gray-300 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:border after:border-gray-300 after:bg-white after:transition-all after:content-[''] peer-checked:bg-purple-600 peer-checked:after:translate-x-full peer-checked:after:border-white peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-purple-300"></div>
                </label>
              </div>
              {preferences.ttsEnabled && (
                <div>
                  <label className="mb-2 block text-sm text-gray-600">
                    Voice Speed: {preferences.ttsSpeed}x
                  </label>
                  <input
                    type="range"
                    min="0.5"
                    max="2"
                    step="0.1"
                    value={preferences.ttsSpeed}
                    onChange={(e) =>
                      setPreferences({
                        ...preferences,
                        ttsSpeed: parseFloat(e.target.value),
                      })
                    }
                    className="w-full accent-purple-600"
                  />
                  <div className="mt-1 flex justify-between text-xs text-gray-500">
                    <span>Slow</span>
                    <span>Normal</span>
                    <span>Fast</span>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Theme */}
          <div>
            <label className="mb-3 block text-sm font-semibold text-gray-700">
              Theme Preference
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setPreferences({ ...preferences, theme: "dark" })}
                className={`rounded-xl border-2 p-4 text-center transition-all ${
                  preferences.theme === "dark"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="text-2xl">🌙</div>
                <div className="mt-2 font-semibold text-gray-900">Dark Mode</div>
              </button>
              <button
                onClick={() => setPreferences({ ...preferences, theme: "light" })}
                className={`rounded-xl border-2 p-4 text-center transition-all ${
                  preferences.theme === "light"
                    ? "border-purple-500 bg-purple-50"
                    : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="text-2xl">☀️</div>
                <div className="mt-2 font-semibold text-gray-900">Light Mode</div>
              </button>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mt-8 flex gap-3">
          <button
            onClick={handleSkip}
            className="flex-1 rounded-xl border-2 border-gray-300 p-3.5 font-semibold text-gray-700 transition-all hover:bg-gray-50"
          >
            Skip for Now
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex-1 rounded-xl bg-linear-to-r from-purple-600 to-pink-600 p-3.5 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:shadow-xl disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save & Continue"}
          </button>
        </div>
      </div>
    </div>
  );
}
