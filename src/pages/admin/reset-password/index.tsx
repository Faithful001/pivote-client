import React, { useState } from "react";
import { useResetPassword } from "../../../api/auth";
import { toast } from "sonner";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { FiCheckSquare, FiEye, FiEyeOff } from "react-icons/fi";

export default function AdminResetPassword() {
  const search = useSearch({ strict: false }) as Record<string, string>;
  const [email, setEmail] = useState(search?.email || "");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const resetPasswordMutation = useResetPassword();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !otp || !password || !confirmPassword) {
      toast.error("All fields are required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    resetPasswordMutation.mutate(
      { email, otp, password },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("Password reset successfully! Please log in.");
            navigate({ to: "/admin/login" });
          } else {
            toast.error(data.message || "Failed to reset password");
          }
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.message || err.message || "An error occurred";
          toast.error(errMsg);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6">
      {/* Fixed top-left logo */}
      <div className="fixed top-0 left-0 p-5 z-50 flex items-center gap-2">
        <Link to="/" className="fixed top-0 left-0 p-5 z-50 flex items-center gap-2">
          <FiCheckSquare className="w-6 h-6 text-amber-500" />
          <span className="text-lg font-bold text-[#0d1e43] tracking-wide">PIVOTE</span>
        </Link>
      </div>

      <div className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200/60 p-8 flex flex-col items-center">
        {/* Header Text */}
        <h1 className="text-3xl font-extrabold text-[#0d1e43] mb-2 tracking-tight text-center">
          Reset Password
        </h1>
        <p className="text-slate-500 text-[13px] text-center max-w-[340px] leading-relaxed mb-8">
          Enter the verification code sent to your admin email and choose a new password.
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Email */}
          <div className="space-y-2">
            <label className="block text-[14px] font-semibold text-[#0d1e43] text-left">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              readOnly={!!search?.email}
              className={`w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl py-3.5 px-4 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none ${
                search?.email ? "opacity-60 cursor-not-allowed" : ""
              }`}
            />
          </div>

          {/* OTP */}
          <div className="space-y-2">
            <label className="block text-[14px] font-semibold text-[#0d1e43] text-left">
              4-Digit OTP Code
            </label>
            <input
              type="text"
              value={otp}
              onChange={(e) => setOtp(e.target.value)}
              placeholder="1234"
              maxLength={4}
              className="w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl py-3.5 px-4 text-slate-800 text-center tracking-widest font-bold text-lg placeholder-slate-300 transition duration-150 outline-none"
            />
          </div>

          {/* New Password */}
          <div className="space-y-2">
            <label className="block text-[14px] font-semibold text-[#0d1e43] text-left">
              New Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl py-3.5 pl-4 pr-10 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="space-y-2">
            <label className="block text-[14px] font-semibold text-[#0d1e43] text-left">
              Confirm Password
            </label>
            <div className="relative">
              <input
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl py-3.5 pl-4 pr-10 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center"
              >
                {showConfirmPassword ? (
                  <FiEyeOff className="w-5 h-5" />
                ) : (
                  <FiEye className="w-5 h-5" />
                )}
              </button>
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={resetPasswordMutation.isPending}
            className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 mt-6 text-[15px]"
          >
            {resetPasswordMutation.isPending ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              "Reset Password"
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6 text-sm text-slate-500">
          Remember your password?{" "}
          <Link
            to="/admin/login"
            className="text-[#10b981] hover:text-emerald-600 font-semibold hover:underline"
          >
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
