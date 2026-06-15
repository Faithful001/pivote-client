import React, { useState } from "react";
import { useVerifyAccount } from "../../../api/auth";
import { toast } from "sonner";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { FiCheckSquare } from "react-icons/fi";

export default function AdminVerify() {
  const search = useSearch({ strict: false }) as Record<string, string>;
  const [email, setEmail] = useState(search?.email || "");
  const [otp, setOtp] = useState("");
  const verifyMutation = useVerifyAccount();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !otp) {
      toast.error("Email and OTP code are required");
      return;
    }

    verifyMutation.mutate(
      { email, otp },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("Admin account verified successfully! Please log in.");
            navigate({
              to: "/admin/login",
              search: { email },
            });
          } else {
            toast.error(data.message || "Verification failed");
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
        {/* Progress Steps */}
        <div className="w-full flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center text-white text-xs font-bold">
              ✓
            </div>
            <span className="text-xs font-semibold text-emerald-500">Register</span>
          </div>
          <div className="flex-1 h-px bg-emerald-200" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#0d1e43] flex items-center justify-center text-white text-xs font-bold">
              2
            </div>
            <span className="text-xs font-semibold text-[#0d1e43]">Verify Email</span>
          </div>
        </div>

        {/* Header Text */}
        <h1 className="text-3xl font-extrabold text-[#0d1e43] mb-2 tracking-tight text-center">
          Verify Admin Account
        </h1>
        <p className="text-slate-500 text-[13px] text-center max-w-[340px] leading-relaxed mb-8">
          We sent a 4-digit OTP to your email. Enter it below to verify your admin account.
        </p>

        {/* Verify Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Email field */}
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

          {/* OTP field */}
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={verifyMutation.isPending}
            className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 mt-6 text-[15px]"
          >
            {verifyMutation.isPending ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              "Verify Admin Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
