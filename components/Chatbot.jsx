"use client";
import { useState, useRef, useEffect, useContext } from "react";
import {
  Send,
  User,
  Mic,
  Plus,
  X,
  Sparkles,
  Volume2,
  VolumeX,
  Copy,
  Check,
  Pause,
} from "lucide-react";
import { ThemeContext } from "@/app/context/ThemeContext";
import { getTTSService, cleanTextForTTS } from "@/utils/textToSpeech";
import Image from "next/image";
import toast from "react-hot-toast";

export default function Chatbot({ messages, updateMessages }) {
  const { isDark } = useContext(ThemeContext);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [ttsEnabled, setTtsEnabled] = useState(true);
  const [currentlyPlaying, setCurrentlyPlaying] = useState(null);
  const [ttsService, setTtsService] = useState(null);
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [personality, setPersonality] = useState("Friendly");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [showSettings, setShowSettings] = useState(false);
  const [ttsSpeed, setTtsSpeed] = useState(1.0);

  const messagesEndRef = useRef(null);
  const textareaRef = useRef(null);
  const recognitionRef = useRef(null);

  // Initialize TTS Service
  useEffect(() => {
    const initTTS = async () => {
      const service = getTTSService();
      if (service) {
        await service.initialize();
        setTtsService(service);
      }
    };
    initTTS();
  }, []);

  // Initialize Speech Recognition
  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (SpeechRecognition) {
      try {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = false;
        recognitionRef.current.interimResults = false;

        recognitionRef.current.onresult = (event) => {
          const transcript = Array.from(event.results)
            .map((result) => result[0].transcript)
            .join("");
          setInput((prev) => prev + transcript);
          toast.success("Transcribed!");
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event) => {
          console.error("Speech recognition error:", event.error);
          setIsListening(false);
          if (event.error === "not-allowed") {
            toast.error("Microphone access denied");
          } else if (event.error === "no-speech") {
            toast.error("No speech detected");
          } else {
            toast.error("Speech recognition failed");
          }
        };
      } catch (error) {
        console.error("Failed to initialize speech recognition:", error);
      }
    }
  }, []);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  }, [input]);

  const handleSpeechToText = () => {
    if (!recognitionRef.current) {
      toast.error(
        "Speech recognition not supported. Try Chrome on Android or desktop.",
      );
      return;
    }

    if (isListening) {
      try {
        recognitionRef.current.stop();
        setIsListening(false);
      } catch (error) {
        console.error("Error stopping recognition:", error);
        setIsListening(false);
      }
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        toast.success("Listening...");
      } catch (error) {
        console.error("Error starting recognition:", error);
        toast.error("Failed to start speech recognition");
        setIsListening(false);
      }
    }
  };

  const handleTextToSpeech = (text, index) => {
    if (!ttsService) {
      toast.error("Text-to-speech not available");
      return;
    }

    if (currentlyPlaying === index && ttsService.isSpeaking()) {
      ttsService.stop();
      setCurrentlyPlaying(null);
      return;
    }

    const cleanedText = cleanTextForTTS(text);
    ttsService.speak(cleanedText, {
      speed: ttsSpeed,
      onStart: () => setCurrentlyPlaying(index),
      onEnd: () => setCurrentlyPlaying(null),
      onError: () => {
        toast.error("Failed to play audio");
        setCurrentlyPlaying(null);
      },
    });
  };

  const copyToClipboard = (text, index) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIndex(index);
      toast.success("Copied!");
      setTimeout(() => setCopiedIndex(null), 2000);
    });
  };

  const handleSubmit = async () => {
    if (!input.trim() || loading) return;

    const userMessage = input.trim();
    setInput("");

    const newMessages = [...messages, { role: "user", content: userMessage }];
    updateMessages(newMessages);

    setLoading(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token") || ""}`,
        },
        body: JSON.stringify({
          message: userMessage,
          history: messages,
          personality,
          model,
        }),
      });

      if (!response.ok) throw new Error("API request failed");

      const data = await response.json();

      const assistantMessage = {
        role: "assistant",
        content: data.response,
        responseType: data.responseType,
        imageUrl: data.imageUrl,
        chartData: data.chartData,
        emotion: data.emotion,
      };

      updateMessages([...newMessages, assistantMessage]);

      if (ttsEnabled && data.responseType === "text") {
        setTimeout(() => {
          handleTextToSpeech(data.response, newMessages.length);
        }, 500);
      }
    } catch (error) {
      console.error("Error:", error);
      toast.error("Failed to get response. Please try again.");
      updateMessages([
        ...newMessages,
        {
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
        },
      ]);
    }

    setLoading(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const personalities = [
    "Professional",
    "Casual",
    "Creative",
    "Friendly",
    "Technical",
    "Humorous",
  ];

  const models = [
    { value: "gpt-3.5-turbo", label: "GPT-3.5 Turbo" },
    { value: "gpt-4", label: "GPT-4" },
    { value: "claude-3-sonnet-20240229", label: "Claude Sonnet" },
    { value: "claude-3-opus-20240229", label: "Claude Opus" },
    { value: "gemini-2.5-flash", label: "Gemini 2.5 Flash" },
  ];

  const darkColors = {
    bg: "bg-slate-900",
    messageBg: "bg-slate-800",
    inputBg: "bg-slate-700",
    inputBorder: "border-slate-600",
    text: "text-white",
    textSecondary: "text-slate-100",
    placeholder: "placeholder-slate-400",
    buttonBg: "bg-slate-600",
    buttonHover: "hover:bg-slate-500",
    buttonDisabled: "disabled:bg-slate-700",
    borderColor: "border-slate-600",
  };

  const lightColors = {
    bg: "bg-white",
    messageBg: "bg-gray-50",
    inputBg: "bg-gray-100",
    inputBorder: "border-gray-300",
    text: "text-gray-900",
    textSecondary: "text-gray-800",
    placeholder: "placeholder-gray-500",
    buttonBg: "bg-gray-200",
    buttonHover: "hover:bg-gray-300",
    buttonDisabled: "disabled:bg-gray-100",
    borderColor: "border-gray-300",
  };

  const colors = isDark ? darkColors : lightColors;

  return (
    <div
      className={`flex flex-1 flex-col ${colors.bg} relative h-full w-full overflow-hidden`}
    >
      {/* Settings Modal */}
      {showSettings && (
        <div className="fixed inset-0 z-50 flex items-end bg-black/50 sm:items-center sm:justify-center">
          <div
            className={`${isDark ? "bg-slate-800" : "bg-white"} animate-slide-up w-full space-y-4 rounded-t-2xl p-4 sm:w-96 sm:animate-none sm:rounded-2xl sm:p-6`}
          >
            <div className="mb-4 flex items-center justify-between">
              <h3 className={`text-lg font-semibold ${colors.text}`}>
                Chat Settings
              </h3>
              <button
                onClick={() => setShowSettings(false)}
                className={`rounded-lg p-2 ${colors.buttonBg} ${colors.buttonHover}`}
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <div>
              <label
                className={`text-sm font-medium ${colors.text} mb-2 flex items-center gap-2`}
              >
                <Sparkles
                  className={`h-4 w-4 ${isDark ? "text-purple-400" : "text-purple-600"}`}
                />
                Personality
              </label>
              <select
                value={personality}
                onChange={(e) => setPersonality(e.target.value)}
                className={`w-full ${colors.inputBg} ${colors.text} rounded-lg border px-3 py-2.5 ${colors.inputBorder} outline-none`}
              >
                {personalities.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`text-sm font-medium ${colors.text} mb-2 block`}
              >
                AI Model
              </label>
              <select
                value={model}
                onChange={(e) => setModel(e.target.value)}
                className={`w-full ${colors.inputBg} ${colors.text} rounded-lg border px-3 py-2.5 ${colors.inputBorder} outline-none`}
              >
                {models.map((m) => (
                  <option key={m.value} value={m.value}>
                    {m.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                className={`text-sm font-medium ${colors.text} mb-2 flex items-center justify-between`}
              >
                <span>Text-to-Speech</span>
                <button
                  onClick={() => setTtsEnabled(!ttsEnabled)}
                  className={`rounded-lg px-3 py-1 text-sm ${ttsEnabled ? "bg-green-600 text-white" : colors.buttonBg}`}
                >
                  {ttsEnabled ? "Enabled" : "Disabled"}
                </button>
              </label>
            </div>

            {ttsEnabled && (
              <div>
                <label
                  className={`text-sm font-medium ${colors.text} mb-2 block`}
                >
                  TTS Speed: {ttsSpeed}x
                </label>
                <input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={ttsSpeed}
                  onChange={(e) => setTtsSpeed(parseFloat(e.target.value))}
                  className="w-full"
                />
              </div>
            )}

            <button
              onClick={() => setShowSettings(false)}
              className={`w-full ${isDark ? "bg-purple-600 hover:bg-purple-700" : "bg-purple-500 hover:bg-purple-600"} rounded-lg py-3 font-medium text-white transition-colors`}
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Messages Area */}
      <div
        className={`flex-1 overflow-y-auto ${colors.bg} hide-scrollbar w-full pb-24 sm:pb-28`}
      >
        {messages.length === 0 ? (
          <div className="flex h-full items-center justify-center px-4">
            <div className="text-center">
              <h1
                className={`text-3xl font-bold sm:text-4xl md:text-5xl ${isDark ? "text-white" : "text-gray-900"} mb-2 sm:mb-4`}
              >
                VaaniAI
              </h1>
              <p
                className={`text-sm sm:text-base ${isDark ? "text-slate-400" : "text-gray-500"}`}
              >
                How can I help you today?
              </p>
            </div>
          </div>
        ) : (
          <div className="w-full px-3 py-4 sm:px-4 sm:py-6">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`mb-6 sm:mb-8 ${msg.role === "assistant" ? colors.messageBg : ""} -mx-3 px-3 py-4 sm:-mx-4 sm:px-4 sm:py-6`}
              >
                <div className="flex gap-3 sm:gap-6">
                  <div className="shrink-0">
                    {msg.role === "user" ? (
                      <div
                        className={`h-7 w-7 sm:h-8 sm:w-8 ${isDark ? "bg-slate-700" : "bg-gray-300"} flex items-center justify-center rounded-sm`}
                      >
                        <User
                          className={`h-4 w-4 sm:h-5 sm:w-5 ${isDark ? "text-white" : "text-gray-700"}`}
                        />
                      </div>
                    ) : (
                      <div
                        className={`h-7 w-7 sm:h-8 sm:w-8 ${isDark ? "bg-slate-700" : "bg-gray-300"} flex items-center justify-center rounded-sm text-xs font-bold sm:text-sm`}
                      >
                        <span
                          className={isDark ? "text-white" : "text-gray-700"}
                        >
                          AI
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="min-w-0 flex-1 pt-0.5 sm:pt-1">
                    <div
                      className={`${colors.textSecondary} text-sm leading-6 wrap-break-word whitespace-pre-wrap sm:text-base sm:leading-7`}
                    >
                      {msg.content}
                    </div>

                    {msg.imageUrl && (
                      <div className="mt-3 sm:mt-4">
                        <Image
                          src={msg.imageUrl}
                          alt="Generated image"
                          width={512}
                          height={512}
                          className="h-auto max-w-full rounded-lg"
                        />
                      </div>
                    )}

                    {msg.role === "assistant" && (
                      <div className="mt-2 flex gap-1.5 sm:mt-3 sm:gap-2">
                        <button
                          onClick={() => handleTextToSpeech(msg.content, idx)}
                          className={`rounded p-1.5 ${colors.buttonBg} ${colors.buttonHover}`}
                          title="Read aloud"
                        >
                          {currentlyPlaying === idx &&
                          ttsService?.isSpeaking() ? (
                            <Pause className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          ) : (
                            <Volume2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                        </button>

                        <button
                          onClick={() => copyToClipboard(msg.content, idx)}
                          className={`rounded p-1.5 ${colors.buttonBg} ${colors.buttonHover}`}
                          title="Copy"
                        >
                          {copiedIndex === idx ? (
                            <Check className="h-3.5 w-3.5 text-green-500 sm:h-4 sm:w-4" />
                          ) : (
                            <Copy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                          )}
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div
                className={`mb-6 sm:mb-8 ${colors.messageBg} -mx-3 px-3 py-4 sm:-mx-4 sm:px-4 sm:py-6`}
              >
                <div className="flex gap-3 sm:gap-6">
                  <div
                    className={`h-7 w-7 sm:h-8 sm:w-8 ${isDark ? "bg-slate-700" : "bg-gray-300"} flex items-center justify-center rounded-sm text-xs font-bold sm:text-sm`}
                  >
                    <span className={isDark ? "text-white" : "text-gray-700"}>
                      AI
                    </span>
                  </div>
                  <div className="flex-1 pt-0.5 sm:pt-1">
                    <div className="flex gap-1">
                      <div
                        className={`h-2 w-2 ${isDark ? "bg-slate-500" : "bg-gray-400"} animate-bounce rounded-full`}
                        style={{ animationDelay: "0ms" }}
                      />
                      <div
                        className={`h-2 w-2 ${isDark ? "bg-slate-500" : "bg-gray-400"} animate-bounce rounded-full`}
                        style={{ animationDelay: "150ms" }}
                      />
                      <div
                        className={`h-2 w-2 ${isDark ? "bg-slate-500" : "bg-gray-400"} animate-bounce rounded-full`}
                        style={{ animationDelay: "300ms" }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input Area - Fixed at Bottom */}
      <div
        className={`fixed right-0 bottom-0 left-0 ${colors.bg} border-t ${colors.borderColor} p-3 sm:p-4`}
      >
        <div className="mx-auto w-full max-w-4xl">
          <div
            className={`relative flex items-end gap-1.5 sm:gap-2 ${colors.inputBg} border ${colors.inputBorder} rounded-xl px-3 py-2 shadow-lg sm:rounded-2xl sm:px-4 sm:py-3`}
          >
            {/* Settings Button */}
            <button
              onClick={() => setShowSettings(true)}
              className={`shrink-0 rounded-lg p-1.5 transition-colors sm:p-2 ${colors.buttonBg} ${colors.buttonHover}`}
              title="Settings"
            >
              <Plus
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isDark ? "text-white" : "text-gray-700"}`}
              />
            </button>

            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Message VaaniAI..."
              disabled={loading}
              rows={1}
              className={`flex-1 ${colors.inputBg} ${colors.text} ${colors.placeholder} max-h-24 resize-none text-sm outline-none disabled:cursor-not-allowed sm:max-h-32 sm:text-base`}
            />

            <button
              onClick={handleSpeechToText}
              disabled={loading}
              className={`shrink-0 rounded-lg p-1.5 transition-colors sm:p-2 ${
                isListening
                  ? "bg-red-600 hover:bg-red-700"
                  : `${colors.buttonBg} ${colors.buttonHover} ${colors.buttonDisabled}`
              }`}
              title="Speech to text"
            >
              <Mic
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isListening ? "animate-pulse text-white" : isDark ? "text-white" : "text-gray-700"}`}
              />
            </button>

            <button
              onClick={handleSubmit}
              disabled={!input.trim() || loading}
              className={`p-1.5 sm:p-2 ${colors.buttonBg} rounded-lg ${colors.buttonHover} ${colors.buttonDisabled} shrink-0 transition-colors`}
            >
              <Send
                className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${isDark ? "text-white" : "text-gray-700"}`}
              />
            </button>
          </div>
          <p
            className={`text-center text-[10px] sm:text-xs ${isDark ? "text-slate-400" : "text-gray-500"} mt-1.5 sm:mt-2`}
          >
            VaaniAI can make mistakes. Check important info.
          </p>
        </div>
      </div>
    </div>
  );
}
