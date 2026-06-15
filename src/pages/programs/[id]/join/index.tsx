import { useState } from "react";
import { useSearch, useParams, Link } from "@tanstack/react-router";
import { useJoinProgram } from "../../../../api/program";
import {
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiShield,
  FiCheckSquare,
} from "react-icons/fi";

export default function JoinProgram() {
  const { programId } = useParams({ from: "/programs/$programId/join" });
  const {
    token = "",
    email = "",
    name = "",
    workspace_name = "",
    program_name = "",
    workspace_id = "",
  } = useSearch({ from: "/programs/$programId/join" });

  const resolvedProgramName = program_name
    ? decodeURIComponent(program_name)
    : name
      ? decodeURIComponent(name)
      : "the program";
  const resolvedWorkspaceName = workspace_name ? decodeURIComponent(workspace_name) : "";

  const joinMutation = useJoinProgram();
  const [joined, setJoined] = useState(false);

  const isInvalid = !token || !email || !workspace_id;

  const handleConfirm = () => {
    joinMutation.mutate(
      { id: programId, token, workspace_id },
      {
        onSuccess: () => setJoined(true),
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
        {/* Content Wrapper */}
        <div className="w-full text-center">
          {isInvalid ? (
            /* Invalid / missing params */
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-50 mb-2">
                <FiAlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#0d1e43] tracking-tight">
                Invalid Join Link
              </h1>
              <p className="text-slate-500 text-[13px] leading-relaxed max-w-[340px] mx-auto">
                This link appears to be incomplete or corrupted. Please request a new join link.
              </p>
              <Link
                to="/dashboard"
                className="inline-flex items-center gap-2 mt-4 bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3.5 px-6 rounded-xl text-sm transition duration-150 shadow-sm"
              >
                Go to Dashboard <FiArrowRight className="w-4 h-4" />
              </Link>
            </div>
          ) : joined ? (
            /* Success state */
            <div className="space-y-4">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-50 mb-2">
                <FiCheckCircle className="w-9 h-9 text-emerald-500" />
              </div>
              <h1 className="text-2xl font-extrabold text-[#0d1e43] tracking-tight">
                You're in! 🎉
              </h1>
              <p className="text-slate-500 text-[13px] leading-relaxed max-w-[340px] mx-auto">
                You've successfully joined{" "}
                <span className="font-semibold text-[#0d1e43]">{resolvedProgramName}</span>
                {resolvedWorkspaceName ? ` in ${resolvedWorkspaceName}` : ""}. Head to the dashboard
                to cast your vote.
              </p>
              <div className="pt-2">
                <Link
                  to="/dashboard"
                  className="flex items-center justify-center gap-2 w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3.5 rounded-xl text-sm transition duration-150"
                >
                  Go to Dashboard <FiArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          ) : (
            /* Confirmation state */
            <div className="space-y-6">
              <div>
                <h1 className="text-3xl font-extrabold text-[#0d1e43] mb-2 tracking-tight">
                  You've Been Invited
                </h1>
                <p className="text-slate-500 text-[13px] leading-relaxed max-w-[340px] mx-auto mb-6">
                  Confirm below to accept the invitation and join the voting program.
                </p>
              </div>

              {/* Program info card */}
              <div className="bg-[#f9fafb] border border-slate-200 rounded-xl p-5 text-left space-y-3">
                {resolvedWorkspaceName && (
                  <div>
                    <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                      Workspace
                    </p>
                    <p className="text-[#0d1e43] font-bold text-sm">{resolvedWorkspaceName}</p>
                  </div>
                )}
                <div className={resolvedWorkspaceName ? "border-t border-slate-100 pt-3" : ""}>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Program
                  </p>
                  <p className="text-[#0d1e43] font-bold text-lg">{resolvedProgramName}</p>
                </div>
                <div className="border-t border-slate-100 pt-3">
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Email Address
                  </p>
                  <p className="text-slate-600 text-sm truncate font-medium">{email}</p>
                </div>
              </div>

              {/* Security info */}
              <div className="flex items-start gap-3 bg-emerald-50 border border-emerald-100 rounded-xl p-4 text-left">
                <FiShield className="w-4 h-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                <p className="text-emerald-700 text-xs leading-relaxed">
                  This is a one-time secure link. It will automatically expire after use.
                </p>
              </div>

              {/* Error block */}
              {joinMutation.isError && (
                <div className="flex items-center gap-3 bg-red-50 border border-red-100 rounded-xl p-4 text-left">
                  <FiAlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
                  <p className="text-red-700 text-xs font-semibold">
                    {(joinMutation.error as any)?.response?.data?.message ||
                      "Something went wrong. Please try again."}
                  </p>
                </div>
              )}

              {/* CTA Button */}
              <button
                id="confirm-join-btn"
                onClick={handleConfirm}
                disabled={joinMutation.isPending}
                className="w-full bg-[#10b981] hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 mt-4 text-[15px]"
              >
                {joinMutation.isPending ? (
                  <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    Confirm & Join Program <FiArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              <div className="text-center pt-2 text-sm">
                <Link
                  to="/dashboard"
                  className="text-[#10b981] hover:text-emerald-600 font-semibold hover:underline"
                >
                  Ignore and go home
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
