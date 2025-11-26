"use client";

import { useState, useEffect } from "react";
import WelcomeModal from "./WelcomeModal";
import { usePathname } from "next/navigation";

export default function AuthChecker() {
  const [showModal, setShowModal] = useState(false);
  const [isChecking, setIsChecking] = useState(true);
  const pathname = usePathname();

  useEffect(() => {
    checkAuth();
  }, [pathname]);

  const checkAuth = async () => {
    // Skip auth check on login/signup pages
    if (pathname === "/login" || pathname === "/signup") {
      setIsChecking(false);
      setShowModal(false);
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const isGuest = localStorage.getItem("isGuest");

      // If user is guest, clear everything and show modal
      if (isGuest === "true") {
        console.log("🧹 Guest session detected, clearing on refresh");
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isGuest");
        setShowModal(true);
        setIsChecking(false);
        return;
      }

      // If no token, show modal
      if (!token) {
        setShowModal(true);
        setIsChecking(false);
        return;
      }

      // Verify real user token with backend
      const response = await fetch("/api/user/profile", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isGuest");
        setShowModal(true);
        setIsChecking(false);
        return;
      }

      const data = await response.json();

      if (!data.success) {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("isGuest");
        setShowModal(true);
        setIsChecking(false);
        return;
      }

      // Valid authenticated user
      setShowModal(false);
      setIsChecking(false);
    } catch (error) {
      console.error("❌ Auth check error:", error);
      localStorage.clear();
      setShowModal(true);
      setIsChecking(false);
    }
  };

  const handleGuestLogin = (userData) => {
    console.log("✅ Guest login callback - hiding modal immediately");
    setShowModal(false);
    setIsChecking(false);
  };

  const handleModalClose = () => {
    console.log("🔒 Modal close requested");
    setShowModal(false);
  };

  // Show loading state while checking
  if (isChecking) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-purple-500 border-t-transparent"></div>
          <p className="text-sm text-white">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      {showModal && (
        <WelcomeModal
          onClose={handleModalClose}
          onGuestLogin={handleGuestLogin}
        />
      )}
    </>
  );
}
