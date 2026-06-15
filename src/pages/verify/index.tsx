import React, { useState } from "react";
import { useVerifyAccount } from "../../api/auth";
import { toast } from "sonner";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { FiCheckSquare } from "react-icons/fi";
import { useRequestJoinProgram } from "../../api/program";
import { getErrorMessage } from "../../lib/utils/get-error-message.util";

export default function Verify() {
  const search = useSearch({ strict: false }) as Record<string, string>;
  const [email, setEmail] = useState(search?.email || "");
  const [otp, setOtp] = useState("");
  const verifyMutation = useVerifyAccount();
  const requestJoinMutation = useRequestJoinProgram();
  const navigate = useNavigate();

  const isFromInvite = !!search?.program_id;

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
          const errMsg = err.response?.data?.message || err.message || "An error occurred";
          toast.error(errMsg);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-white text-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-[460px] flex flex-col items-center">
        {/* Top Logo Icon */}
        <div className="mb-4 flex items-center gap-2">
          <FiCheckSquare className="w-10 h-10 text-amber-500" />
          <p className="text-2xl font-bold">PIVOTE</p>
        </div>

        {/* Header Text */}
        <h1 className="text-3xl font-extrabold text-[#0d1e43] mb-2 tracking-tight text-center">
          {isFromInvite ? "Verify & Join" : "Verify Account"}
        </h1>

        {isFromInvite ? (
          <div className="text-center mb-8">
            <p className="text-slate-500 text-[13px] leading-relaxed">
              Verify your email to complete joining <strong className="text-[#0d1e43]">{search.program_name}</strong>.
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
              className={`w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-md py-3.5 px-4 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none ${
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
              className="w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-md py-3.5 px-4 text-slate-800 text-center tracking-widest font-bold text-lg placeholder-slate-300 transition duration-150 outline-none"
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={verifyMutation.isPending || requestJoinMutation.isPending}
            className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-md transition duration-150 flex items-center justify-center gap-2 mt-6 text-[15px]"
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
