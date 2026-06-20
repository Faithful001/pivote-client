import { useState, useEffect } from "react";
import { useParams, Link } from "@tanstack/react-router";
import { useProgram } from "../../../api/program";
import { useCandidatesByProgram } from "../../../api/candidate";
import { useProgramVotes } from "../../../api/vote";
import { useSocket } from "../../../contexts/useSocket";
import { API_BASE_URL } from "../../../api/client";
import { FiChevronLeft, FiCheckSquare } from "react-icons/fi";
import { useQueryClient } from "@tanstack/react-query";

export default function ProgramDashboard() {
  const queryClient = useQueryClient();
  const { programId } = useParams({ strict: false }) as { programId: string };
  const { joinProgram } = useSocket();

  const { data: program, isLoading: loadingProgram } = useProgram(programId);
  const { data: candidates, isLoading: loadingCandidates } = useCandidatesByProgram(programId);
  const { data: voteInfo, isLoading: loadingVotes } = useProgramVotes(programId);

  useEffect(() => {
    if (programId && program?.workspace_id) {
      joinProgram(programId, program.workspace_id);
    }
  }, [programId, program?.workspace_id, joinProgram]);

  // Real-time countdown timer state
  const [timeLeft, setTimeLeft] = useState(0);

  // Initialize/fallback local time estimation when program loads
  useEffect(() => {
    if (program?.voting_ends_at) {
      const diff = Math.floor((new Date(program.voting_ends_at).getTime() - Date.now()) / 1000);
      setTimeLeft(diff > 0 ? diff : 0);
    }
  }, [program]);

  // Connect to the SSE countdown stream
  useEffect(() => {
    if (!programId || !program?.is_active) return;

    const token = localStorage.getItem("token");
    const sseUrl = `${API_BASE_URL}/programs/${programId}/countdown?token=${token}`;
    const eventSource = new EventSource(sseUrl);
    let fallbackInterval: ReturnType<typeof setInterval> | null = null;

    eventSource.addEventListener("countdown", (event) => {
      const val = parseInt(event.data, 10);
      if (!isNaN(val)) {
        setTimeLeft(val);
      }
      if (val === 0) {
        queryClient.invalidateQueries({
          queryKey: ["programs", programId],
        });
      }
    });

    eventSource.onerror = (err) => {
      console.error("SSE countdown connection error, falling back to local countdown:", err);
      eventSource.close();

      // Start local fallback ticker
      if (!fallbackInterval) {
        fallbackInterval = setInterval(() => {
          setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
        }, 1000);
      }
    };

    return () => {
      eventSource.close();
      if (fallbackInterval) {
        clearInterval(fallbackInterval);
      }
    };
  }, [programId, program?.is_active]);

  const formatCountdown = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h}h:${m.toString().padStart(2, "0")}m:${s.toString().padStart(2, "0")}s`;
  };

  if (loadingProgram) {
    return (
      <div className="h-96 flex items-center justify-center text-slate-400">
        <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-2"></div>
        Loading dashboard...
      </div>
    );
  }

  if (!program) {
    return (
      <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
        <p>Program not found.</p>
        <Link
          to="/"
          className="mt-4 inline-flex items-center text-emerald-500 font-semibold hover:underline"
        >
          <FiChevronLeft className="mr-1" /> Back to Programs list
        </Link>
      </div>
    );
  }

  // Stats matching screenshot metrics
  const totalCandidates = candidates ? candidates.length : 0;
  const totalVotes = voteInfo ? voteInfo.total_votes : 0;

  // Simulated total voters enrolled in this program
  // const totalVoters = program.is_joined ? 568 : 0;

  const totalParticipants = voteInfo?.participants_count ?? 0;

  // Chart bounds
  const maxVoteCount =
    Math.max(...(candidates?.map((c) => voteInfo?.votes_by_candidate[c.id] || 0) || []), 10) * 1.2;
  const roundedMax = Math.ceil(maxVoteCount / 30) * 30 || 240;

  return (
    <div className="space-y-8">
      {/* Back Button & Navigation Header */}
      <div>
        <Link
          to="/"
          className="inline-flex items-center text-sm font-semibold text-slate-500 hover:text-[#0d1e43] transition mb-4"
        >
          <FiChevronLeft className="w-4 h-4 mr-1" /> Back to Programs
        </Link>
      </div>

      {/* Header section matching screenshot */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <span>
            <p className="text-[12px] text-slate-500">Workspace</p>
            <h4 className="text-md font-semibold text-[#0d1e43] mb-2">{program.workspace?.name}</h4>
          </span>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0d1e43] mb-1">
            {program.name} Dashboard
          </h1>
          <p className="text-slate-500 text-sm">
            {program.description || "Welcome back to Pivote"}
          </p>
        </div>

        <div className="flex items-center gap-6 text-sm">
          <div className="flex items-center gap-2">
            <span className="text-[#0d1e43] font-medium">Election Status:</span>
            <span
              className={`text-white text-xs px-3 py-1 rounded-full font-semibold ${
                program.is_active ? "bg-emerald-500" : "bg-slate-400"
              }`}
            >
              {program.is_active ? "Ongoing" : "Closed"}
            </span>
          </div>
          {program.is_active && (
            <div>
              <span className="text-[#0d1e43] font-medium mr-2">Countdown:</span>
              <span className="font-mono font-bold text-[#0d1e43] bg-slate-200/50 px-3 py-1.5 rounded-lg border border-slate-300/40">
                {formatCountdown(timeLeft)}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-sm font-medium mb-2">Total number of Joined voters</p>
          <p className="text-3xl font-extrabold text-[#0d1e43]">{totalParticipants}</p>
        </div>
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-sm font-medium mb-2">Total number of Candidates</p>
          <p className="text-3xl font-extrabold text-[#0d1e43]">{totalCandidates}</p>
        </div>
        <div className="bg-white border border-slate-200/60 p-6 rounded-2xl shadow-sm">
          <p className="text-slate-400 text-sm font-medium mb-2">Total number of votes</p>
          <p className="text-3xl font-extrabold text-[#0d1e43]">{totalVotes}</p>
        </div>
      </div>

      {/* Live Results Panel */}
      <div className="bg-white border border-slate-200/60 rounded-2xl shadow-sm p-8">
        <div className="flex items-center justify-between border-b border-slate-100 pb-6 mb-8">
          <div>
            <h2 className="text-xl font-bold text-[#0d1e43]">Live Results</h2>
            <p className="text-slate-400 text-xs mt-1">See the current results of the election</p>
          </div>

          {program.is_active && (
            <Link
              to="/vote"
              className="bg-emerald-500 hover:bg-emerald-600 text-white font-semibold py-2 px-4 rounded-xl text-sm transition flex items-center gap-2 shadow-sm"
            >
              <FiCheckSquare className="w-4 h-4" /> Vote Now
            </Link>
          )}
        </div>

        {loadingCandidates || loadingVotes ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-2"></div>
            Loading results...
          </div>
        ) : !candidates || candidates.length === 0 ? (
          <div className="h-64 flex items-center justify-center text-slate-400">
            No candidates found in this program.
          </div>
        ) : (
          /* Horizontal Bar Chart matching the design exactly */
          <div className="overflow-x-auto w-full pb-4">
            <div className="min-w-[600px] space-y-8 max-w-4xl mx-auto py-4">
              <div className="space-y-6">
                {candidates.map((candidate, idx) => {
                  const votes = voteInfo?.votes_by_candidate[candidate.id] || 0;
                  // Calculate percentage based on max vote bound
                  const percentage = Math.min((votes / roundedMax) * 100, 100);

                  // Alternating custom colors matching the screenshot
                  const barColor =
                    idx === 0
                      ? "bg-indigo-300" // Light purple/indigo
                      : idx % 2 === 1
                        ? "bg-[#0d1e43]" // Dark navy blue
                        : "bg-blue-800"; // Another dark blue

                  return (
                    <div key={candidate.id} className="flex items-center gap-6">
                      {/* Candidate Name */}
                      <span className="w-32 text-right font-medium text-slate-600 truncate flex-shrink-0">
                        {candidate.name}
                      </span>

                      {/* Bar container */}
                      <div className="flex-1 bg-slate-100/50 rounded-full h-8 relative border border-slate-100 overflow-hidden">
                        <div
                          className={`h-full ${barColor} rounded-full transition-all duration-500 ease-out`}
                          style={{ width: `${percentage || 0}%` }}
                        />
                      </div>

                      {/* Votes count label */}
                      <span className="w-20 text-left font-bold text-slate-700 font-mono text-sm flex-shrink-0">
                        {votes} {votes === 1 ? "Vote" : "Votes"}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Grid Line labels matching screenshot scale */}
              <div className="relative pt-4">
                <div className="flex justify-between pl-[152px] pr-[104px] text-[10px] font-mono text-slate-400 font-medium">
                  {Array.from({ length: 9 }).map((_, i) => {
                    const val = Math.round((roundedMax / 8) * i);
                    return <span key={i}>{val}</span>;
                  })}
                </div>
                {/* Scale line */}
                <div className="absolute inset-x-0 top-0 h-[2px] bg-slate-100 pl-[152px] pr-[104px] flex justify-between" />
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
