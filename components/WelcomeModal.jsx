"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { LogIn, UserPlus, Users, Sparkles, AlertCircle } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

export default function WelcomeModal({ onClose, onGuestLogin }) {
  const [show, setShow] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    setTimeout(() => setShow(true), 100);
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "unset";
    };
  }, []);

  const handleClose = () => {
    setShow(false);
    document.body.style.overflow = "unset";
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleLogin = () => {
    setShow(false);
    document.body.style.overflow = "unset";

    setTimeout(() => {
      router.push("/login");
      onClose();
    }, 300);
  };

  const handleSignup = () => {
    setShow(false);
    document.body.style.overflow = "unset";

    setTimeout(() => {
      router.push("/signup");
      onClose();
    }, 300);
  };

  const handleGuestLogin = async () => {
    if (isLoading) return; // Prevent double clicks

    setIsLoading(true);

    try {
      const response = await axios.post("/api/auth/guest");

      if (response.data.success) {
        // Save token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        localStorage.setItem("isGuest", "true");

        // Show success message
        toast.success("Welcome Guest! Session will reset on refresh.", {
          icon: "👋",
          duration: 5000,
        });

        // Notify parent component FIRST
        if (onGuestLogin) {
          onGuestLogin(response.data.user);
        }

        // Then close modal with animation
        setShow(false);
        document.body.style.overflow = "unset";

        // Call onClose after animation completes
        setTimeout(() => {
          onClose();
        }, 300);
      }
    } catch (error) {
      console.error("Guest login error:", error);
      toast.error(
        error.response?.data?.error ||
          "Failed to login as guest. Please try again.",
      );
      setIsLoading(false); // Reset loading only on error
    }
    // Don't reset isLoading on success - modal is closing anyway
  };

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-md transition-opacity duration-300 ${
        show ? "opacity-100" : "opacity-0"
      }`}
    >
      <div
        className={`relative w-full max-w-md transform rounded-2xl bg-white p-8 shadow-2xl transition-all duration-300 dark:bg-slate-900 ${
          show ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
      >
        {/* Header */}
        <div className="mb-6 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-purple-500 to-pink-500 shadow-lg">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h2 className="mb-2 text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to VaaniAI
          </h2>
          <p className="text-gray-600 dark:text-gray-400">
            Please login or sign up to continue
          </p>
        </div>

        {/* Action buttons */}
        <div className="space-y-3">
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl bg-purple-600 p-4 font-semibold text-white shadow-lg transition-all hover:scale-[1.02] hover:bg-purple-700 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <LogIn className="h-5 w-5" />
            Login to Your Account
          </button>

          <button
            onClick={handleSignup}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-purple-600 bg-white p-4 font-semibold text-purple-600 transition-all hover:scale-[1.02] hover:bg-purple-50 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-slate-800 dark:text-purple-400 dark:hover:bg-slate-700"
          >
            <UserPlus className="h-5 w-5" />
            Create New Account
          </button>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white px-3 text-gray-500 dark:bg-slate-900 dark:text-gray-400">
                or
              </span>
            </div>
          </div>

          <button
            onClick={handleGuestLogin}
            disabled={isLoading}
            className="flex w-full items-center justify-center gap-3 rounded-xl border-2 border-gray-300 bg-gray-50 p-4 font-semibold text-gray-700 transition-all hover:scale-[1.02] hover:border-gray-400 hover:bg-gray-100 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-700 dark:bg-slate-800 dark:text-gray-300 dark:hover:border-gray-600 dark:hover:bg-slate-700"
          >
            {isLoading ? (
              <>
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-700 border-t-transparent dark:border-gray-300"></div>
                Creating Session...
              </>
            ) : (
              <>
                <Users className="h-5 w-5" />
                Continue as Guest
              </>
            )}
          </button>
        </div>

        {/* Guest Warning */}
        <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50 p-4 dark:border-amber-800 dark:bg-amber-900/20">
          <div className="flex gap-3">
            <AlertCircle className="mt-0.5 h-5 w-5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="mb-1 text-sm font-semibold text-amber-900 dark:text-amber-200">
                Guest Mode Limitations:
              </p>
              <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-300">
                <li>• Session resets on page refresh</li>
                <li>• Chat history not saved</li>
                <li>• Limited features available</li>
              </ul>
              <p className="mt-2 text-xs font-medium text-amber-700 dark:text-amber-400">
                Sign up for permanent access!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
