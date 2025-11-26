"use client";
import { useState, useRef } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { MailCheck, Loader2 } from "lucide-react";

export default function OtpVerificationModal({
  email,
  username,
  password,
  onSuccess,
  onCancel,
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);

  // Refs for auto-focusing
  const inputRefs = Array.from({ length: 6 }, () => useRef(null));

  // Handle OTP input
  const handleChange = (val, idx) => {
    if (!/^\d*$/.test(val)) return;
    let arr = [...otp];
    arr[idx] = val;
    setOtp(arr);
    if (val && idx < 5) inputRefs[idx + 1].current.focus();
  };

  // Handle back
  const handleKeyDown = (e, idx) => {
    if (e.key === "Backspace" && !otp[idx] && idx > 0) {
      inputRefs[idx - 1].current.focus();
    }
  };

  const otpCode = otp.join("");
  const canVerify = otpCode.length === 6 && /^\d{6}$/.test(otpCode);

  const verifyOtp = async () => {
    if (!canVerify) {
      toast.error("OTP must be 6 digits");
      return;
    }
    setLoading(true);
    try {
      onSuccess(otpCode);
    } finally {
      setLoading(false);
    }
  };

  const resendOtp = async () => {
    setResending(true);
    try {
      const res = await axios.post("/api/auth/send-otp", {
        username,
        email,
        password,
      });

      if (res.data.success) {
        toast.success("New OTP sent to your email!");
        setOtp(["", "", "", "", "", ""]);
        inputRefs[0].current.focus();
      }
    } catch (error) {
      toast.error(error.response?.data?.error || "Failed to resend OTP");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80">
      <div className="relative mx-auto w-full max-w-sm rounded-2xl bg-white p-8 shadow-2xl dark:bg-slate-900">
        {/* Icon & Header */}
        <div className="mb-6 flex flex-col items-center">
          <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-purple-500 text-white shadow">
            <MailCheck size={28} />
          </div>
          <h2 className="mb-0.5 text-2xl font-bold text-slate-800 dark:text-white">
            Verify Your Email
          </h2>
          <p className="mb-1.5 text-sm text-gray-500 dark:text-slate-300">
            Enter the <b>6-digit OTP</b> sent to
          </p>
          <span className="mb-2 font-mono text-base font-semibold break-all text-blue-700 dark:text-blue-300">
            {email}
          </span>
        </div>

        {/* OTP Boxes */}
        <div className="mb-6 flex justify-center gap-2">
          {otp.map((value, idx) => (
            <input
              key={idx}
              ref={inputRefs[idx]}
              type="text"
              pattern="\d*"
              inputMode="numeric"
              maxLength={1}
              className="h-12 w-12 rounded-lg border border-gray-300 bg-gray-50 text-center font-mono text-2xl shadow-sm transition-all outline-none focus:border-blue-400 focus:ring-2 focus:ring-blue-400 dark:border-slate-700 dark:bg-slate-800"
              value={value}
              onChange={(e) => handleChange(e.target.value, idx)}
              onKeyDown={(e) => handleKeyDown(e, idx)}
              autoFocus={idx === 0}
              disabled={loading || resending}
              aria-label={`OTP digit ${idx + 1}`}
            />
          ))}
        </div>

        {/* Actions */}
        <button
          onClick={verifyOtp}
          disabled={!canVerify || loading}
          className={`mb-3 flex w-full items-center justify-center rounded-xl bg-blue-600 px-4 py-3 font-semibold text-white shadow transition-all hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-blue-300`}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Verifying...
            </>
          ) : (
            "Verify & Create Account"
          )}
        </button>
        <div className="flex items-center justify-between gap-4 text-sm">
          <button
            className="text-blue-600 transition-colors hover:underline disabled:opacity-60"
            onClick={resendOtp}
            disabled={resending || loading}
            type="button"
          >
            {resending ? "Sending..." : "Resend OTP"}
          </button>
          <button
            className="text-gray-500 hover:underline disabled:opacity-60"
            onClick={onCancel}
            disabled={loading || resending}
            type="button"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
