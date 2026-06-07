import { useState } from "react";
import { useSearch, useParams } from "@tanstack/react-router";
import { useRequestJoinProgram } from "../../../../api/program";
import { FiMail } from "react-icons/fi";
import { toast } from "sonner";

export default function RequestJoinProgram() {
  const [email, setEmail] = useState("");
  const { programId } = useParams({ from: "/programs/$programId/request-join" });
  const { name = "" } = useSearch({ from: "/programs/$programId/request-join" });

  const programName = name ? decodeURIComponent(name) : "the program";

  const requestJoinMutation = useRequestJoinProgram();

  const handleRequestJoin = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.warning("Email required");
    }
    requestJoinMutation.mutate(
      { id: programId, email },
      {
        onSuccess: (data: string) => {
          toast.success(data ?? "Join link sent to email");
        },
      }
    );
  };

  return (
    <form
      onSubmit={handleRequestJoin}
      className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50/30 flex items-center justify-center p-4"
    >
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
            <div className="space-y-6">
              <div>
                <h1 className="text-2xl font-bold text-[#0d1e43] mb-1">You've been invited</h1>
                <p className="text-slate-400 text-sm">Confirm below to join the voting program.</p>
              </div>

              {/* Program info */}
              <div className="bg-slate-50 border border-slate-100 rounded-2xl p-5 space-y-3">
                <div>
                  <p className="text-[10px] uppercase font-bold tracking-wider text-slate-400 mb-1">
                    Program
                  </p>
                  <p className="text-[#0d1e43] font-bold text-lg">{programName}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#0d1e43] uppercase tracking-wider mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    id="join-link-email-input"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-4 text-[#0d1e43] text-sm placeholder-slate-300 transition outline-none"
                  />
                </div>
              </div>

              {/* CTA */}
              <button
                id="confirm-request-join-btn"
                // onClick={handleRequestJoin}
                disabled={requestJoinMutation.isPending}
                className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold py-3.5 rounded-xl text-sm transition-all duration-200 flex items-center justify-center gap-2 shadow-sm shadow-emerald-200"
              >
                <>{!requestJoinMutation.isPending ? "Request to join" : "Requesting..."}</>
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
