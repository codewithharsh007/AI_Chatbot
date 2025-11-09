"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import Link from "next/link";

export default function SignupPage() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const onSignup = async () => {
    if (!formData.username || !formData.email || !formData.password) {
      alert("Please fill in all fields");
      return;
    }

    if (formData.username.length < 3) {
      alert("Username must be at least 3 characters");
      return;
    }

    if (formData.password.length < 6) {
      alert("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/signup", formData);

      if (response.data.success) {
        // Save token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        // Redirect to home
        router.push("/");
      }
    } catch (error) {
      console.error("Signup error:", error);
      alert(error.response?.data?.error || "Signup failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/95 p-8 shadow-2xl backdrop-blur-sm md:p-10">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            Create Account
          </h2>
          <p className="text-sm text-gray-600">Join us today and get started</p>
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
            {loading ? "Creating Account..." : "Sign Up"}
          </button>
        </form>

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
  );
}
