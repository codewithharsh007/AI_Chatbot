"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Github, Mail } from "lucide-react";
import axios from "axios";
import Link from "next/link";

export default function LoginPage() {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const router = useRouter();

  const onLogin = async () => {
    if (!formData.email || !formData.password) {
      alert("Please fill in all fields");
      return;
    }

    setLoading(true);

    try {
      const response = await axios.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
      });

      if (response.data.success) {
        // Save token and user data
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        
        // Redirect to home
        router.push("/");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert(error.response?.data?.error || "Login failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen w-full items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black p-4">
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white/95 p-8 shadow-2xl backdrop-blur-sm md:p-10">
        <div className="mb-8 text-center">
          <h2 className="mb-2 text-3xl font-bold text-gray-900">
            Welcome Back
          </h2>
          <p className="text-sm text-gray-600">
            Sign in to your account to continue
          </p>
        </div>

        <form className="space-y-5">
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
              placeholder="Enter your password"
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="h-4 w-4 cursor-pointer rounded border-gray-300 bg-gray-100 text-gray-800 focus:ring-2 focus:ring-gray-800"
              />
              <span className="ml-2.5 cursor-pointer text-sm font-medium text-gray-700">
                Remember me
              </span>
            </label>
            <Link
              href="/forgot-password"
              className="text-sm font-semibold text-gray-800 transition-colors hover:text-gray-600"
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="button"
            disabled={loading}
            className="mt-6 w-full transform rounded-lg bg-gradient-to-r from-gray-900 to-gray-800 p-3.5 font-semibold text-white shadow-lg transition-all duration-300 hover:scale-[1.02] hover:from-gray-800 hover:to-gray-700 hover:shadow-xl active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50"
            onClick={onLogin}
          >
            {loading ? "Signing in..." : "Sign In"}
          </button>
        </form>

        <div className="my-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-white/95 px-2 text-gray-600">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-2 gap-3">
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-300 p-2.5 font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-50"
            >
              <Mail size={18} />
              Google
            </button>
            <button
              type="button"
              className="flex w-full items-center justify-center gap-2 rounded-lg border-2 border-gray-300 p-2.5 font-medium text-gray-900 transition-colors duration-200 hover:bg-gray-50"
            >
              <Github size={18} />
              GitHub
            </button>
          </div>
        </div>

        <div className="text-center">
          <p className="text-sm text-gray-600">
            {" Don't have an account? "}
            <Link
              href="/signup"
              className="font-semibold text-gray-900 transition-colors hover:text-gray-700 hover:underline"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
