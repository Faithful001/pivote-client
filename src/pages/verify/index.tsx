import React, { useState, useEffect } from "react";
import { useVerifyAccount } from "../../api/auth";
import { toast } from "sonner";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { FiCheckSquare } from "react-icons/fi";
import { useRequestJoinProgram } from "../../api/program";
import { getErrorMessage } from "../../lib/utils/get-error-message.util";
import { useSendOtp } from "../../api/otp";

export default function Verify() {
  const search = useSearch({ strict: false }) as Record<string, string>;
  const [email, setEmail] = useState(search?.email || "");
  const [otp, setOtp] = useState("");
  const [cooldown, setCooldown] = useState(0);
  const verifyMutation = useVerifyAccount();
  const requestJoinMutation = useRequestJoinProgram();
  const navigate = useNavigate();

  const sendOtpMutation = useSendOtp();

  const isFromInvite = !!search?.program_id;

  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [cooldown]);

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
            toast.success("Account verified successfully!");

            if (isFromInvite) {
              requestJoinMutation.mutate(
                { id: search.program_id, email, workspace_id: search.workspace_id },
                {
                  onSuccess: () => {
                    toast.success("Join link sent! Check your email.");
                    setTimeout(() => {
                      navigate({ to: "/login" });
                    }, 2000);
                  },
                  onError: (err: any) => {
                    const errorMessage = getErrorMessage(err);
                    toast.error(errorMessage);
                  },
                }
              );
            } else {
              navigate({ to: "/login" });
            }
          } else {
            toast.error(data.message || "Verification failed");
          }
        },
        onError: (err: any) => {
          const error = err.response?.data?.message || err.message;
          const errorMessage = error || "An error occurred";

          if (error === "User already verified") {
            navigate({
              to: "/login",
              search: { email },
            });
          }
          toast.error(errorMessage);
        },
      }
    );
  };

  const handleResendOtp = () => {
    if (!email) {
      toast.error("Email address is required to resend OTP");
      return;
    }

    sendOtpMutation.mutate(
      { email, purpose: "verify_account" },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("OTP resent! Check your email.");
            setCooldown(30);
          } else {
            toast.error(data.message || "Failed to resend OTP");
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
          {isFromInvite ? "Verify & Join" : "Verify Account"}
        </h1>

        {isFromInvite ? (
          <div className="text-center mb-8">
            <p className="text-slate-500 text-[13px] leading-relaxed">
              Verify your email to complete joining{" "}
              <strong className="text-[#0d1e43]">{search.program_name}</strong>.
            </p>
          </div>
        ) : (
          <p className="text-slate-500 text-[13px] text-center max-w-[340px] leading-relaxed mb-8">
            Verify your email address to activate your account and start voting
          </p>
        )}

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
            <div className="flex items-center justify-between">
              <label className="block text-[14px] font-semibold text-[#0d1e43] text-left">
                4-Digit OTP Code
              </label>
              <button
                type="button"
                onClick={handleResendOtp}
                disabled={sendOtpMutation.isPending || cooldown > 0}
                className="text-[13px] text-[#10b981] hover:text-emerald-600 font-semibold hover:underline disabled:opacity-50 disabled:cursor-not-allowed disabled:no-underline transition"
              >
                {sendOtpMutation.isPending
                  ? "Sending..."
                  : cooldown > 0
                    ? `Resend in ${cooldown}s`
                    : "Resend OTP"}
              </button>
            </div>
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
            disabled={verifyMutation.isPending || requestJoinMutation.isPending}
            className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 mt-6 text-[15px]"
          >
            {verifyMutation.isPending ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : requestJoinMutation.isPending ? (
              "Sending join link..."
            ) : isFromInvite ? (
              "Verify & Join Program"
            ) : (
              "Verify Account"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
