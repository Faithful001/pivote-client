import { useState } from "react";
import { useMe } from "../api/auth";
import { usePrograms, useJoinProgram, useProgramAccessCode } from "../api/program";
import { Link } from "@tanstack/react-router";
import { toast } from "sonner";
import {
  FiCheckCircle,
  FiLock,
  FiKey,
  FiArrowRight,
  FiAlertCircle,
  FiX,
  FiHelpCircle,
} from "react-icons/fi";

export default function Dashboard() {
  const { data: user } = useMe();
  const { data: programs, isLoading: loadingPrograms } = usePrograms();
  console.log("programs", programs);
  const joinProgramMutation = useJoinProgram();

  // State for joining modal
  const [joinModalOpen, setJoinModalOpen] = useState(false);
  const [selectedProgramId, setSelectedProgramId] = useState("");
  const [selectedProgramName, setSelectedProgramName] = useState("");
  const [accessCode, setAccessCode] = useState("");

  // State for access code modal
  const [codeModalOpen, setCodeModalOpen] = useState(false);

  const { isLoading: loadingCode, isError: codeError } = useProgramAccessCode(
    selectedProgramId,
    codeModalOpen
  );

  const handleOpenJoinModal = (id: string, name: string) => {
    setSelectedProgramId(id);
    setSelectedProgramName(name);
    setAccessCode("");
    setJoinModalOpen(true);
  };

  const handleRequestCode = (id: string, name: string) => {
    setSelectedProgramId(id);
    setSelectedProgramName(name);
    setCodeModalOpen(true);
  };

  const handleJoinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accessCode) {
      toast.error("Access code is required");
      return;
    }

    joinProgramMutation.mutate(
      { id: selectedProgramId, access_code: accessCode },
      {
        onSuccess: () => {
          toast.success(`Successfully joined ${selectedProgramName}!`);
          setJoinModalOpen(false);
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.message || err.message || "Failed to join program";
          toast.error(errMsg);
        },
      }
    );
  };

  // Calculations
  const totalPrograms = programs?.length || 0;
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-sm font-medium mb-2">Total Programs</p>
          <p className="text-3xl font-extrabold text-[#0d1e43]">{totalPrograms}</p>
        </div>
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleRequestCode(program.id, program.name)}
                          className="flex-1 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2.5 rounded-xl text-xs transition flex items-center justify-center gap-1"
                        >
                          <FiKey className="w-3.5 h-3.5" /> Request Code
                        </button>
                        <button
                          onClick={() => handleOpenJoinModal(program.id, program.name)}
                          className="flex-1 bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl text-xs transition"
                        >
                          Join Program
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Join Program Access Code Modal */}
      {joinModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <button
              onClick={() => setJoinModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#0d1e43] mb-2">Join Program</h3>
            <p className="text-slate-400 text-sm mb-6">
              Enter the 4-digit access code for{" "}
              <strong className="text-slate-600">{selectedProgramName}</strong> to join and vote.
            </p>

            <form onSubmit={handleJoinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#0d1e43] uppercase tracking-wider mb-2">
                  Access Code
                </label>
                <input
                  type="text"
                  maxLength={4}
                  value={accessCode}
                  onChange={(e) => setAccessCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="e.g. 1234"
                  className="w-full bg-slate-50 border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 px-4 text-[#0d1e43] text-center font-bold tracking-[0.5em] text-lg placeholder-slate-300 transition outline-none"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setJoinModalOpen(false)}
                  className="w-1/2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={joinProgramMutation.isPending}
                  className="w-1/2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-semibold py-2.5 rounded-xl text-sm transition"
                >
                  {joinProgramMutation.isPending ? "Joining..." : "Join"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Request Access Code Modal */}
      {codeModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-100 p-6 relative">
            <button
              onClick={() => setCodeModalOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#0d1e43] mb-2">Access Code Requested</h3>
            <p className="text-slate-400 text-sm mb-6">
              Requesting access code for{" "}
              <strong className="text-slate-600">{selectedProgramName}</strong>...
            </p>

            {loadingCode ? (
              <div className="h-20 flex items-center justify-center text-slate-400">
                <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-emerald-500 mr-2"></div>
                Sending access code to your email...
              </div>
            ) : codeError ? (
              <div className="bg-red-50 border border-red-100 rounded-2xl p-4 flex items-center gap-3">
                <FiAlertCircle className="text-red-400 w-5 h-5 flex-shrink-0" />
                <p className="text-red-500 text-sm font-medium">
                  Failed to request access code. Please try again.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-50 border border-emerald-100 rounded-2xl p-4 flex items-center gap-3">
                  <FiAlertCircle className="text-emerald-500 w-5 h-5 flex-shrink-0" />
                  <p className="text-emerald-700 text-sm font-medium">
                    Your access code has been sent to your email address. Check your inbox and use
                    it to join.
                  </p>
                </div>

                <div className="pt-4">
                  <button
                    onClick={() => {
                      setCodeModalOpen(false);
                      handleOpenJoinModal(selectedProgramId, selectedProgramName);
                    }}
                    className="w-full bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2.5 rounded-xl text-sm transition"
                  >
                    Enter Access Code to Join
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
