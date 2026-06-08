import React, { useState } from "react";
import { useVerifyAccount } from "../../api/auth";
import { toast } from "sonner";
import { useNavigate, useSearch } from "@tanstack/react-router";
import { FiCheckSquare, FiShield } from "react-icons/fi";
import { useRequestJoinProgram } from "../../api/program";

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
                { id: search.program_id, email },
                {
                  onSuccess: () => {
                    toast.success("Join link sent! Check your email.");
                    navigate({ to: "/login" });
                  },
                  onError: () => {
                    navigate({ to: "/login" });
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2">
            <FiCheckSquare className="text-emerald-400 w-8 h-8" />
            PIVOTE
          </div>
          {isFromInvite ? (
            <>
              <p className="text-slate-100 font-semibold text-base mt-1">Almost there!</p>
              <p className="text-slate-400 text-sm mt-1">
                Verify your email to complete joining{" "}
                <span className="text-emerald-400 font-semibold">{search.program_name}</span>
              </p>
            </>
          ) : (
            <p className="text-slate-400 text-sm">
              Verify your email address to activate your account
            </p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@domain.com"
              readOnly={!!search?.email}
              className={`w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 px-4 text-slate-100 placeholder-slate-600 transition outline-none ${
                search?.email ? "opacity-60 cursor-not-allowed" : ""
              }`}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">
              4-Digit OTP Code
            </label>
            <div className="relative">
              <FiShield className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                placeholder="1234"
                maxLength={4}
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-600 transition tracking-widest text-center font-bold text-lg outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={verifyMutation.isPending || requestJoinMutation.isPending}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 disabled:cursor-not-allowed text-slate-950 font-semibold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {verifyMutation.isPending
              ? "Verifying..."
              : requestJoinMutation.isPending
                ? "Sending join link..."
                : isFromInvite
                  ? "Verify & Join Program"
                  : "Verify Account"}
          </button>
        </form>
      </div>
    </div>
  );
}
