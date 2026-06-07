import { useState } from "react";
import { useSearch, useParams, Link } from "@tanstack/react-router";
import { useJoinProgram } from "../../../../api/program";
import { FiCheckCircle, FiAlertCircle, FiArrowRight, FiMail, FiShield } from "react-icons/fi";

export default function JoinProgram() {
  const { programId } = useParams({ from: "/programs/$programId/join" });
  const { token = "", email = "", name = "" } = useSearch({ from: "/programs/$programId/join" });

  const programName = name ? decodeURIComponent(name) : "the program";

  const joinMutation = useJoinProgram();
  const [joined, setJoined] = useState(false);

  const isInvalid = !token || !email;

  const handleConfirm = () => {
    joinMutation.mutate(
      { id: programId, token },
      {
        onSuccess: () => setJoined(true),
      }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo / branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0d1e43] shadow-lg mb-4">
            <span className="text-white font-extrabold text-xl">P</span>
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-wide uppercase">Pivote</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-3xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-emerald-400 to-teal-500" />

          <div className="p-8">
            {isInvalid ? (
              /* Invalid / missing params */
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-2">
                  <FiAlertCircle className="w-8 h-8 text-red-400" />
                </div>
                <h1 className="text-xl font-bold text-[#0d1e43]">Invalid Join Link</h1>
                <p className="text-slate-400 text-sm leading-relaxed">
                  This link appears to be incomplete or corrupted. Please request a new join link.
                </p>
                <Link
                  to="/"
                  className="inline-flex items-center gap-2 mt-4 bg-[#0d1e43] text-white font-semibold py-3 px-6 rounded-xl text-sm hover:bg-slate-900 transition"
                >
                  Go to Dashboard <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            ) : joined ? (
              /* Success state */
              <div className="text-center space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-2">
                  <FiCheckCircle className="w-9 h-9 text-emerald-500" />
                </div>
                <h1 className="text-2xl font-bold text-[#0d1e43]">You're in! 🎉</h1>
                <p className="text-slate-500 text-sm leading-relaxed">
                  You've successfully joined{" "}
                  <span className="font-semibold text-[#0d1e43]">{programName}</span>. Head to the
                  dashboard to cast your vote.
                </p>
                <div className="pt-2 space-y-3">
                  <Link
                    to="/"
                    className="flex items-center justify-center gap-2 w-full bg-[#0d1e43] text-white font-semibold py-3 rounded-xl text-sm hover:bg-slate-900 transition"
                  >
                    Go to Dashboard <FiArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            ) : (
              /* Confirmation state */
              <div className="space-y-6">
                <div>
                  <h1 className="text-2xl font-bold text-[#0d1e43] mb-1">You've been invited</h1>
                  <p className="text-slate-400 text-sm">
                    Confirm below to join the voting program.
                  </p>
                </div>

                {/* Program info */}
                <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Program
                    </p>
                    <p className="text-[#0d1e43] font-bold text-lg">{programName}</p>
                  </div>
                  <div className="border-t border-slate-100 pt-3 flex items-center gap-2">
                    <FiMail className="w-4 h-4 text-slate-400 flex-shrink-0" />
                    <p className="text-slate-500 text-sm truncate">{email}</p>
                  </div>
                </div>

                {/* Security note */}
                <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
                  <FiShield className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                  <p className="text-emerald-700 text-xs leading-relaxed">
                    This is a one-time secure link. It will expire after use.
                  </p>
                </div>

                {/* Error */}
                {joinMutation.isError && (
                  <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-4">
                    <FiAlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                    <p className="text-red-600 text-sm">
                      {(joinMutation.error as any)?.response?.data?.message ||
                        "Something went wrong. Please try again."}
                    </p>
                  </div>
                )}

                {/* CTA */}
                <button
                  id="confirm-join-btn"
                  onClick={handleConfirm}
                  disabled={joinMutation.isPending}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
                >
                  {joinMutation.isPending ? (
                    <>
                      <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                      Confirming...
                    </>
                  ) : (
                    <>
                      Confirm & Join Program <FiArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>

                <p className="text-center text-slate-400 text-xs">
                  Not expecting this?{" "}
                  <Link to="/" className="text-[#0d1e43] font-semibold hover:underline">
                    Ignore and go home
                  </Link>
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
