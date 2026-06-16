import React, { useState } from "react";
import { useMe } from "../../../api/auth";
import { useAdminPrograms } from "../../../api/program";
import { useCandidatesByProgram } from "../../../api/candidate";
import { useProgramVotes, useToggleVote } from "../../../api/vote";
import { toast } from "sonner";
import { FiCheck, FiInbox, FiLock } from "react-icons/fi";

export default function AdminVote() {
  const { data: user } = useMe();
  const { data: programs, isLoading: loadingPrograms } = useAdminPrograms();
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");

  const joinedPrograms = React.useMemo(() => {
    if (!programs) return [];
    return programs.filter((p) => p.is_joined || user?.role === "admin");
  }, [programs, user]);

  // Selected program info
  const activeProgram = React.useMemo(() => {
    return joinedPrograms.find((p) => p.id === selectedProgramId);
  }, [joinedPrograms, selectedProgramId]);

  // Fetch candidates and votes of selected program
  const { data: candidates, isLoading: loadingCandidates } =
    useCandidatesByProgram(selectedProgramId);
  const { data: voteInfo } = useProgramVotes(selectedProgramId);
  const toggleVoteMutation = useToggleVote();

  // If no program selected, select the first joined one when loaded
  React.useEffect(() => {
    if (joinedPrograms.length > 0 && !selectedProgramId) {
      setSelectedProgramId(joinedPrograms[0].id);
    }
  }, [joinedPrograms, selectedProgramId]);

  const handleVote = (candidateId: string) => {
    if (!activeProgram?.is_active) {
      toast.error("Voting is closed for this program");
      return;
    }
    toggleVoteMutation.mutate(
      { candidate_id: candidateId, program_id: selectedProgramId },
      {
        onSuccess: () => {
          toast.success("Vote cast successfully!");
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.message || err.message || "Failed to submit vote";
          toast.error(errMsg);
        },
      }
    );
  };

  const userVotedCandidateId = voteInfo?.user_vote_candidate_id;
  const hasVotedInProgram = !!userVotedCandidateId;

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d1e43] mb-1">Cast Your Vote</h1>
        <p className="text-slate-500 text-sm">
          Select a joined program to view candidates and place your vote.
        </p>
      </div>

      {loadingPrograms ? (
        <div className="h-64 flex items-center justify-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-2"></div>
          Loading programs...
        </div>
      ) : joinedPrograms.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <FiInbox className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p className="mb-2">You haven't joined any voting programs yet.</p>
          <p className="text-sm text-slate-500">
            Go to the Dashboard to request access codes and join programs.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Categories Sidebar List */}
          <div className="lg:col-span-1 space-y-3">
            <h3 className="text-xs font-bold text-[#0d1e43] uppercase tracking-wider px-2">
              Joined Programs
            </h3>
            <div className="space-y-1">
              {joinedPrograms.map((program) => (
                <button
                  key={program.id}
                  onClick={() => setSelectedProgramId(program.id)}
                  className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition flex items-center justify-between ${
                    selectedProgramId === program.id
                      ? "bg-emerald-500 text-white font-semibold shadow-sm"
                      : "bg-white border border-slate-200/60 text-[#0d1e43] hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate mr-2">{program.name}</span>
                  {!program.is_active && (
                    <span
                      className={`text-[9px] uppercase font-bold px-1.5 py-0.5 rounded-full ${
                        selectedProgramId === program.id
                          ? "bg-white/20 text-white"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      Closed
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Candidates Grid Panel */}
          <div className="lg:col-span-3">
            <div className="bg-white border border-slate-200/60 rounded-2xl p-8 min-h-[400px]">
              <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-100 pb-6 mb-6 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-[#0d1e43]">Candidates List</h2>
                  {activeProgram && (
                    <p className="text-slate-400 text-xs mt-0.5">{activeProgram.description}</p>
                  )}
                </div>
                {activeProgram && !activeProgram.is_active && (
                  <div className="bg-amber-50 border border-amber-100 text-amber-700 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium">
                    <FiLock className="w-3.5 h-3.5" /> Voting Closed
                  </div>
                )}
                {hasVotedInProgram && (
                  <div className="bg-emerald-50 border border-emerald-100 text-emerald-700 text-xs px-3 py-1.5 rounded-xl flex items-center gap-1.5 font-medium">
                    <FiCheck className="w-3.5 h-3.5" /> Vote Registered
                  </div>
                )}
              </div>

              {loadingCandidates ? (
                <div className="h-48 flex items-center justify-center text-slate-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-emerald-500 mr-2"></div>
                  Loading candidates...
                </div>
              ) : !candidates || candidates.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                  <FiInbox className="w-8 h-8 mb-2 text-slate-300" />
                  <p className="text-sm">No candidates nominated in this program yet.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {candidates.map((candidate) => {
                    const voteCount = voteInfo?.votes_by_candidate[candidate.id] || 0;
                    const isVoted = userVotedCandidateId === candidate.id;
                    const isDisableVote =
                      hasVotedInProgram ||
                      !activeProgram?.is_active ||
                      toggleVoteMutation.isPending;

                    return (
                      <div
                        key={candidate.id}
                        className={`border rounded-2xl p-6 flex flex-col justify-between transition duration-200 ${
                          isVoted
                            ? "border-emerald-500 bg-emerald-50/10"
                            : "border-slate-200/70 hover:border-slate-300"
                        }`}
                      >
                        <div className="flex items-center gap-4 mb-4">
                          <div
                            className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg ${
                              isVoted
                                ? "bg-emerald-100 text-emerald-600"
                                : "bg-slate-100 text-slate-400"
                            }`}
                          >
                            {candidate.name.charAt(0)}
                          </div>
                          <div>
                            <h4 className="font-bold text-[#0d1e43]">{candidate.name}</h4>
                            <p className="text-xs text-slate-400 font-mono mt-0.5">
                              {voteCount} Votes
                            </p>
                          </div>
                        </div>

                        {isVoted ? (
                          <div className="w-full py-2.5 rounded-xl text-sm font-semibold bg-emerald-500 text-white flex items-center justify-center gap-2">
                            <FiCheck className="w-4 h-4" /> Voted
                          </div>
                        ) : (
                          <button
                            onClick={() => handleVote(candidate.id)}
                            disabled={isDisableVote}
                            className={`w-full py-2.5 rounded-xl text-sm font-semibold transition flex items-center justify-center gap-2 ${
                              isDisableVote
                                ? "bg-slate-100 text-slate-400 cursor-not-allowed border border-slate-200/50"
                                : "bg-emerald-500 hover:bg-emerald-600 text-white shadow-sm"
                            }`}
                          >
                            {!activeProgram?.is_active ? (
                              <>
                                <FiLock className="w-4 h-4" /> Locked
                              </>
                            ) : hasVotedInProgram ? (
                              "Vote"
                            ) : (
                              "Cast Vote"
                            )}
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
