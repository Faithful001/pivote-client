import React, { useState } from "react";
import { usePrograms } from "../../api/program";
import { useCandidatesByProgram } from "../../api/candidate";
import { useProgramVotes } from "../../api/vote";
import { FiInbox, FiAward } from "react-icons/fi";

export default function Results() {
  const { data: programs, isLoading: loadingPrograms } = usePrograms();
  const [selectedProgramId, setSelectedProgramId] = useState<string>("");

  const { data: candidates, isLoading: loadingCandidates } =
    useCandidatesByProgram(selectedProgramId);
  const { data: voteInfo } = useProgramVotes(selectedProgramId);

  React.useEffect(() => {
    if (programs && programs.length > 0 && !selectedProgramId) {
      setSelectedProgramId(programs[0].id);
    }
  }, [programs, selectedProgramId]);

  // Find winner
  let winnerName = "TBD";
  let winnerVotes = 0;
  if (candidates && voteInfo) {
    candidates.forEach((candidate) => {
      const votes = voteInfo.votes_by_candidate[candidate.id] || 0;
      if (votes > winnerVotes) {
        winnerVotes = votes;
        winnerName = candidate.name;
      }
    });
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-[#0d1e43] mb-1">Election Results</h1>
        <p className="text-slate-500 text-sm">
          Real-time statistics and tallies for all election categories.
        </p>
      </div>

      {loadingPrograms ? (
        <div className="h-64 flex items-center justify-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-2"></div>
          Loading categories...
        </div>
      ) : !programs || programs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <FiInbox className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p>No active voting programs found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-1 space-y-2">
            <h3 className="text-xs font-bold text-[#0d1e43] uppercase tracking-wider px-2">
              Select Category
            </h3>
            {programs.map((program) => (
              <button
                key={program.id}
                onClick={() => setSelectedProgramId(program.id)}
                className={`w-full text-left px-4 py-3 rounded-xl text-sm font-medium transition ${
                  selectedProgramId === program.id
                    ? "bg-emerald-500 text-white font-semibold"
                    : "bg-white border border-slate-200/60 text-[#0d1e43] hover:bg-slate-50"
                }`}
              >
                {program.name}
              </button>
            ))}
          </div>

          <div className="lg:col-span-3 space-y-6">
            {winnerVotes > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-white">
                  <FiAward className="w-6 h-6" />
                </div>
                <div>
                  <h4 className="font-bold text-[#0d1e43]">Current Frontrunner</h4>
                  <p className="text-sm text-emerald-800 font-medium">
                    {winnerName} is leading with{" "}
                    <span className="font-bold">{winnerVotes} votes</span>
                  </p>
                </div>
              </div>
            )}

            <div className="bg-white border border-slate-200/60 rounded-2xl p-8">
              <h2 className="text-lg font-bold text-[#0d1e43] mb-6">Vote Distribution</h2>

              {loadingCandidates ? (
                <div className="h-48 flex items-center justify-center text-slate-400">
                  <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-emerald-500 mr-2"></div>
                  Loading breakdown...
                </div>
              ) : !candidates || candidates.length === 0 ? (
                <div className="h-48 flex flex-col items-center justify-center text-slate-400">
                  <FiInbox className="w-8 h-8 mb-2 text-slate-300" />
                  <p className="text-sm">No candidate statistics available.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {candidates.map((candidate) => {
                    const votes = voteInfo?.votes_by_candidate[candidate.id] || 0;
                    const total = voteInfo?.total_votes || 1;
                    const percent = Math.round((votes / total) * 100);

                    return (
                      <div key={candidate.id} className="space-y-2">
                        <div className="flex justify-between text-sm font-medium">
                          <span className="text-[#0d1e43]">{candidate.name}</span>
                          <span className="text-slate-500">
                            {votes} votes ({percent}%)
                          </span>
                        </div>
                        <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                          <div
                            className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                            style={{ width: `${percent}%` }}
                          />
                        </div>
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
