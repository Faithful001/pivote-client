import { useState } from "react";
import { useSearch, useParams } from "@tanstack/react-router";
import { useRequestJoinProgram } from "../../../../api/program";
import { FiCheckSquare } from "react-icons/fi";
import { toast } from "sonner";
import { Link } from "@tanstack/react-router";

export default function RequestJoinProgram() {
  const [email, setEmail] = useState("");
  const { programId } = useParams({ from: "/programs/$programId/request-join" });
  const {
    name = "",
    workspace_name = "",
    program_name = "",
    workspace_id = "",
  } = useSearch({ from: "/programs/$programId/request-join" });

  const resolvedProgramName = program_name
    ? decodeURIComponent(program_name)
    : name
      ? decodeURIComponent(name)
      : "the program";
  const resolvedWorkspaceName = workspace_name ? decodeURIComponent(workspace_name) : "";

  const requestJoinMutation = useRequestJoinProgram();

  const handleRequestJoin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.warning("Email required");
      return;
    }
    requestJoinMutation.mutate(
      { id: programId, email, workspace_id },
      {
        onSuccess: (data: string) => {
          toast.success(data ?? "Join link sent to email");
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
          You've Been Invited
        </h1>

        <div className="text-center mb-8">
          <p className="text-slate-500 text-[13px] leading-relaxed">
            Confirm your email to join{" "}
            {resolvedWorkspaceName ? `the ${resolvedWorkspaceName} workspace` : "the program"}.
          </p>
        </div>

        {/* Program Info Panel */}
        <div className="w-full bg-[#f9fafb] border border-slate-200 rounded-xl p-5 mb-6 space-y-3">
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
        </div>

        {/* Join Form */}
        <form onSubmit={handleRequestJoin} className="w-full space-y-5">
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
              className="w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl py-3.5 px-4 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none"
            />
          </div>

          {/* Submit button */}
          <button
            id="confirm-request-join-btn"
            type="submit"
            disabled={requestJoinMutation.isPending}
            className="w-full bg-[#10b981] hover:bg-emerald-600 disabled:opacity-60 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 mt-6 text-[15px]"
          >
            {requestJoinMutation.isPending ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              "Request to join"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
