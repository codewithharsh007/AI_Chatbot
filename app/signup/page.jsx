"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Github, Mail } from "lucide-react";
import axios from "axios";
import Link from "next/link";
import toast from "react-hot-toast";
import { signIn } from "next-auth/react";
import PreferencesModal from "@/components/PreferencesModal";
import OtpVerificationModal from "@/components/OtpVerificationModal";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [showPreferences, setShowPreferences] = useState(false);
  const [showOtpModal, setShowOtpModal] = useState(false);
  const router = useRouter();

  const onSignup = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.username.length < 3) {
      toast.error("Username must be at least 3 characters");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      // Step 1: Send OTP
      const response = await axios.post("/api/auth/send-otp", formData);

      if (response.data.success) {
        toast.success("OTP sent to your email!");
        setShowOtpModal(true);
      }
    } catch (error) {
      console.error("Signup error:", error);
      toast.error(
        error.response?.data?.error || "Failed to send OTP. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  const handleOtpVerified = async (otp) => {
    setLoading(true);
    try {
      const response = await axios.post("/api/auth/signup", {
        ...formData, // username, email, password
        otp,
      });

      if (response.data.success) {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        toast.success("Account created successfully!");
        setShowOtpModal(false);
        setShowPreferences(true);
      }
    } catch (error) {
      console.error("Verification error:", error);
      toast.error(error.response?.data?.error || "Verification failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignup = async (provider) => {
    try {
      await signIn(provider, { callbackUrl: "/" });
    } catch (error) {
      console.error(`${provider} signup error:`, error);
      toast.error(`Failed to sign up with ${provider}`);
    }
  };

  return (
    <>
      {/* OTP Verification Modal */}
      {showOtpModal && (
        <OtpVerificationModal
          email={formData.email}
          username={formData.username}
          password={formData.password}
          onSuccess={handleOtpVerified}
          onCancel={() => {
            setShowOtpModal(false);
          }}
        />
      )}

      {/* Preferences Modal */}
      {showPreferences && (
        <PreferencesModal
          onClose={() => setShowPreferences(false)}
          onComplete={() => router.push("/")}
        />
      )}

      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
        <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/95 p-8 shadow-2xl backdrop-blur-sm md:p-10">
          <div className="mb-8 text-center">
            <h2 className="mb-2 text-3xl font-bold text-gray-900">
              Create Account
            </h2>
            <p className="text-sm text-gray-600">
              Join us today and get started
            </p>
          </div>

          <form className="space-y-5">
            <div>
              <label
                className="mb-2 block text-sm font-semibold text-gray-700"
                htmlFor="username"
              >
                Username
              </label>
              <input
                type="text"
                id="username"
                className="w-full rounded-lg border-2 border-gray-300 p-3 text-gray-900 transition-all duration-200 outline-none placeholder:text-gray-400 focus:border-gray-800 focus:ring-2 focus:ring-gray-800/20"
                value={formData.username}
                placeholder="Enter your username"
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-semibold text-gray-700"
                htmlFor="email"
              >
                Email Address
              </label>
              <input
                type="email"
                id="email"
                className="w-full rounded-lg border-2 border-gray-300 p-3 text-gray-900 transition-all duration-200 outline-none placeholder:text-gray-400 focus:border-gray-800 focus:ring-2 focus:ring-gray-800/20"
                value={formData.email}
                placeholder="your@email.com"
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
              />
            </div>

            <div>
              <label
                className="mb-2 block text-sm font-semibold text-gray-700"
                htmlFor="password"
              >
                Password
              </label>
              <input
                type="password"
                id="password"
                className="w-full rounded-lg border-2 border-gray-300 p-3 text-gray-900 transition-all duration-200 outline-none placeholder:text-gray-400 focus:border-gray-800 focus:ring-2 focus:ring-gray-800/20"
                value={formData.password}
                placeholder="Create a strong password"
                onChange={(e) =>
                  setFormData({ ...formData, password: e.target.value })
                }
              />
            </div>

            <button
              type="button"
              disabled={loading}
              className="mt-6 w-full transform rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 p-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-gray-800 hover:to-gray-700 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
              onClick={onSignup}
            >
              {loading ? "Sending OTP..." : "Sign Up"}
            </button>
          </form>

          <div className="my-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white/95 px-2 text-gray-600">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="mt-6 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleOAuthSignup("google")}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-300 p-2.5 font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-50"
              >
                <Mail size={18} />
                Google
              </button>
              <button
                type="button"
                onClick={() => handleOAuthSignup("github")}
                className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-300 p-2.5 font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-50"
              >
                <Github size={18} />
                GitHub
              </button>
            </div>
          </div>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                href="/login"
                className="font-semibold text-gray-900 transition-colors hover:text-gray-700 hover:underline"
              >
                Log In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
