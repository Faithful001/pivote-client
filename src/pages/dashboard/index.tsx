import { useState } from "react";
import { useMe } from "../../api/auth";
import { usePrograms, useRequestJoinLink } from "../../api/program";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  FiCheckCircle,
  FiLock,
  FiArrowRight,
  FiAlertCircle,
  FiX,
  FiHelpCircle,
  FiSend,
  FiMail,
} from "react-icons/fi";

export default function Dashboard() {
  const { data: user } = useMe();
  const { data: programs, isLoading: loadingPrograms } = usePrograms();
  const requestLinkMutation = useRequestJoinLink();

  // "Get Join Link" modal state
  const [linkModalOpen, setLinkModalOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedProgramName, setSelectedProgramName] = useState("");
  const [emailInput, setEmailInput] = useState("");
  const [linkSent, setLinkSent] = useState(false);

  const handleOpenLinkModal = (id: string, name: string) => {
    setSelectedProgramId(id);
    setSelectedProgramName(name);
    setEmailInput(user?.email ?? "");
    setLinkSent(false);
    setLinkModalOpen(true);
  };

  const handleCloseLinkModal = () => {
    setLinkModalOpen(false);
    setLinkSent(false);
    setEmailInput("");
  };

  const handleRequestLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput.trim()) {
      toast.error("Email is required");
      return;
    }

    requestLinkMutation.mutate(
      { id: selectedProgramId, email: emailInput.trim() },
      {
        onSuccess: () => setLinkSent(true),
        onError: (err: any) => {
          const msg = err.response?.data?.message || err.message || "Failed to send join link";
          toast.error(msg);
        },
      }
    );
  };

  // Calculations
  // const totalPrograms = programs?.length || 0;
  const joinedProgramsCount =
    programs?.filter((p) => p.is_joined || user?.role === "admin").length || 0;
  const activeProgramsCount = programs?.filter((p) => p.is_active).length || 0;

  return (
    <div className="space-y-8">
      {/* Header section */}
      <div>
        <h1 className="text-3xl font-bold text-[#0d1e43] mb-1">
          Hello, {user?.name || "Faithful"}!
        </h1>
        <p className="text-slate-500 text-sm">
          Welcome back to Pivote. Choose a program below to get started.
        </p>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-sm font-medium mb-2">Joined Programs</p>
          <p className="text-3xl font-extrabold text-[#0d1e43]">{joinedProgramsCount}</p>
        </div>
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-sm font-medium mb-2">Active Elections</p>
          <p className="text-3xl font-extrabold text-[#0d1e43]">{activeProgramsCount}</p>
        </div>
      </div>

      {/* Programs grid */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-8">
        <h2 className="text-xl font-bold text-[#0d1e43] border-b border-slate-100 pb-4 mb-6">
          Available Programs
        </h2>

        {loadingPrograms ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-2"></div>
            Loading programs...
          </div>
        ) : !programs || programs.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-slate-400">
            <FiHelpCircle className="w-12 h-12 mb-2 text-slate-300" />
            <p>No programs available at the moment.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {programs.map((program) => {
              const isJoined = program.is_joined || user?.role === "admin";
              return (
                <div
                  key={program.id}
                  className={`border rounded-2xl p-6 flex flex-col justify-between transition-all duration-200 ${
                    isJoined
                      ? "border-slate-200/70 hover:border-slate-300 hover:shadow-md"
                      : "border-slate-200/50 bg-slate-50/20"
                  }`}
                >
                  <div>
                    {/* Badge row */}
                    <div className="flex items-center justify-between mb-4">
                      <span
                        className={`text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full ${
                          program.is_active
                            ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {program.is_active ? "Active" : "Closed"}
                      </span>

                      <span
                        className={`text-xs font-semibold flex items-center gap-1 ${
                          isJoined ? "text-emerald-500" : "text-amber-500"
                        }`}
                      >
                        {isJoined ? (
                          <>
                            <FiCheckCircle className="w-4 h-4" /> Joined
                          </>
                        ) : (
                          <>
                            <FiLock className="w-3.5 h-3.5" /> Locked
                          </>
                        )}
                      </span>
                    </div>
                    {user?.role === "user" && (
                      <span>
                        <p className="text-[10px] text-slate-500">Workspace</p>
                        <h4 className="text-sm font-semibold text-[#0d1e43] mb-2">
                          {program.workspace?.name}
                        </h4>
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-[#0d1e43] mb-2">{program.name}</h3>
                    <p className="text-slate-500 text-sm line-clamp-3 mb-6">
                      {program.description || "No description provided."}
                    </p>
                  </div>

                  <div className="space-y-3">
                    {isJoined ? (
                      <Link
                        to="/programs/$programId"
                        params={{ programId: program.id }}
                        className="w-full bg-[#0d1e43] hover:bg-slate-900 text-white font-semibold py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-sm"
                      >
                        Enter Program <FiArrowRight className="w-4 h-4" />
                      </Link>
                    ) : (
                      <button
                        id={`request-link-btn-${program.id}`}
                        onClick={() => handleOpenLinkModal(program.id, program.name)}
                        className="w-full border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
                      >
                        <FiSend className="w-3.5 h-3.5" /> Get Join Link
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Get Join Link Modal */}
      {linkModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <button
              onClick={handleCloseLinkModal}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition"
            >
              <FiX className="w-5 h-5" />
            </button>

            {linkSent ? (
              /* Success state */
              <div className="text-center space-y-4 pt-4">
                <div className="inline-flex items-center justify-center w-14 h-14 rounded-full bg-emerald-50">
                  <FiCheckCircle className="w-7 h-7 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-[#0d1e43]">Check your inbox</h3>
                <p className="text-slate-400 text-sm leading-relaxed">
                  A secure join link for{" "}
                  <strong className="text-slate-600">{selectedProgramName}</strong> has been sent to{" "}
                  <strong className="text-slate-600">{emailInput}</strong>.
                </p>
                <div className="bg-amber-50 border border-amber-100 rounded-xl p-3 flex items-start gap-2 text-left">
                  <FiAlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                  <p className="text-amber-700 text-xs">
                    The link is single-use and will expire after you click it.
                  </p>
                </div>
                <button
                  onClick={handleCloseLinkModal}
                  className="w-full bg-[#0d1e43] hover:bg-slate-900 text-white font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  Done
                </button>
              </div>
            ) : (
              /* Email input form */
              <>
                <h3 className="text-xl font-bold text-[#0d1e43] mb-1">Get Join Link</h3>
                <p className="text-slate-400 text-sm mb-6">
                  We'll send a one-click join link to the email below for{" "}
                  <strong className="text-slate-600">{selectedProgramName}</strong>.
                </p>

                <form onSubmit={handleRequestLink} className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-[#0d1e43] uppercase tracking-wider mb-2">
                      Email Address
                    </label>
                    <div className="relative">
                      <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <input
                        id="join-link-email-input"
                        type="email"
                        value={emailInput}
                        onChange={(e) => setEmailInput(e.target.value)}
                        placeholder="you@example.com"
                        className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-4 text-[#0d1e43] text-sm placeholder-slate-300 transition outline-none"
                      />
                    </div>
                  </div>

                  <div className="flex gap-3 pt-1">
                    <button
                      type="button"
                      onClick={handleCloseLinkModal}
                      className="w-1/2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2.5 rounded-xl text-sm transition"
                    >
                      Cancel
                    </button>
                    <button
                      id="send-link-btn"
                      type="submit"
                      disabled={requestLinkMutation.isPending}
                      className="w-1/2 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-60 text-white font-semibold py-2.5 rounded-xl text-sm transition flex items-center justify-center gap-2"
                    >
                      {requestLinkMutation.isPending ? (
                        <>
                          <span className="inline-block w-3.5 h-3.5 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                          Sending...
                        </>
                      ) : (
                        <>
                          <FiSend className="w-3.5 h-3.5" /> Send Link
                        </>
                      )}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
