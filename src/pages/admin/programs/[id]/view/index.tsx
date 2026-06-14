import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "@tanstack/react-router";
import { useUpdateProgram, useProgram, useToggleProgram } from "../../../../../api/program";
import {
  useCandidatesByProgram,
  useCreateCandidate,
  useUpdateCandidate,
  useDeleteCandidate,
} from "../../../../../api/candidate";
import { toast } from "sonner";
import { FiPlus, FiTrash2, FiEdit2, FiCheck, FiX, FiArrowLeft } from "react-icons/fi";
import { Loader2 } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import Modal from "../../../../../components/shared/modals";

const MIN_MINUTES = 30;
const MAX_MINUTES = 30 * 24 * 60;

function durationToTimestamp(days: number, hours: number, minutes: number): string {
  const totalMinutes = days * 24 * 60 + hours * 60 + minutes;
  return new Date(Date.now() + totalMinutes * 60 * 1000).toISOString();
}

function validateDuration(days: number, hours: number, minutes: number): string | null {
  const totalMinutes = days * 24 * 60 + hours * 60 + minutes;
  if (totalMinutes < MIN_MINUTES) return "Minimum voting duration is 30 minutes";
  if (totalMinutes > MAX_MINUTES) return "Maximum voting duration is 30 days";
  return null;
}

export default function AdminViewProgram() {
  const navigate = useNavigate();
  const { programId } = useParams({ strict: false }) as { programId: string };

  const { data: program, isLoading: loadingProgram } = useProgram(programId);
  const updateProgramMutation = useUpdateProgram();
  const toggleMutation = useToggleProgram();

  const { data: existingCandidates, isLoading: loadingCandidates } =
    useCandidatesByProgram(programId);
  const createCandidateMutation = useCreateCandidate();
  const updateCandidateMutation = useUpdateCandidate();
  const deleteCandidateMutation = useDeleteCandidate();

  const [isEditing, setIsEditing] = useState(false);
  const [isDurationModalOpen, setIsDurationModalOpen] = useState(false);

  // Program fields
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  // Duration modal fields
  const [durationDays, setDurationDays] = useState(0);
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(30);

  // Candidate inline form
  const [candidateName, setCandidateName] = useState("");
  const [editingCandidateId, setEditingCandidateId] = useState<string | null>(null);
  const [editingCandidateName, setEditingCandidateName] = useState("");

  useEffect(() => {
    if (program) {
      setName(program.name);
      setDescription(program.description);
    }
  }, [program]);

  const handleCancelEdit = () => {
    if (program) {
      setName(program.name);
      setDescription(program.description);
    }
    setIsEditing(false);
  };

  const totalMinutes = durationDays * 24 * 60 + durationHours * 60 + durationMinutes;

  // ─── Program update ───────────────────────────────────────────────
  const handleSaveProgram = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error("Program name is required");
      return;
    }

    updateProgramMutation.mutate(
      { id: programId, name, description },
      {
        onSuccess: () => {
          toast.success("Program updated successfully!");
          setIsEditing(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to update program");
        },
      }
    );
  };

  // ─── Toggle ───────────────────────────────────────────────────────
  const handleToggle = (checked: boolean) => {
    if (checked) {
      setDurationDays(0);
      setDurationHours(0);
      setDurationMinutes(30);
      setIsDurationModalOpen(true);
    } else {
      toggleMutation.mutate(
        { id: programId, is_active: false, voting_ends_at: null },
        {
          onSuccess: (data) => toast.success(data.message),
          onError: (err: any) => {
            toast.error(err.response?.data?.message || "Failed to update status");
          },
        }
      );
    }
  };

  const handleDurationSave = () => {
    const error = validateDuration(durationDays, durationHours, durationMinutes);
    if (error) {
      toast.error(error);
      return;
    }

    toggleMutation.mutate(
      {
        id: programId,
        is_active: true,
        voting_ends_at: durationToTimestamp(durationDays, durationHours, durationMinutes),
      },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          setIsDurationModalOpen(false);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to update status");
          setIsDurationModalOpen(false);
        },
      }
    );
  };

  const handleDurationModalClose = (open: boolean) => {
    if (!open) setIsDurationModalOpen(false);
  };

  // ─── Candidate actions ────────────────────────────────────────────
  const handleAddCandidate = () => {
    if (!candidateName.trim()) {
      toast.error("Candidate name is required");
      return;
    }
    createCandidateMutation.mutate(
      { name: candidateName.trim(), program_id: programId },
      {
        onSuccess: () => {
          toast.success("Candidate added!");
          setCandidateName("");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to add candidate");
        },
      }
    );
  };

  const handleUpdateCandidate = (id: string) => {
    if (!editingCandidateName.trim()) {
      toast.error("Candidate name is required");
      return;
    }
    updateCandidateMutation.mutate(
      { id, name: editingCandidateName.trim(), program_id: programId },
      {
        onSuccess: () => {
          toast.success("Candidate updated!");
          setEditingCandidateId(null);
          setEditingCandidateName("");
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to update candidate");
        },
      }
    );
  };

  const handleDeleteCandidate = (id: string) => {
    deleteCandidateMutation.mutate(
      { id, programId },
      {
        onSuccess: () => toast.success("Candidate removed!"),
        onError: (err: any) => {
          toast.error(err.response?.data?.message || "Failed to delete candidate");
        },
      }
    );
  };

  if (loadingProgram) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading program...
      </div>
    );
  }

  if (!program) {
    return (
      <div className="h-64 flex items-center justify-center text-slate-400">Program not found.</div>
    );
  }

  return (
    <div className="space-y-8 max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate({ to: "/admin/programs" })}
            className="p-2 text-slate-500 hover:text-[#0d1e43] hover:bg-slate-100 rounded-lg transition"
          >
            <FiArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#0d1e43]">{program.name}</h1>
            <p className="text-slate-500 text-sm mt-1">
              {isEditing ? "Editing program details." : "View program details and candidates."}
            </p>
          </div>
        </div>

        {!isEditing ? (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 text-sm font-semibold text-slate-600 hover:text-[#0d1e43] border border-slate-200 hover:bg-slate-50 py-2 px-4 rounded-xl transition"
          >
            <FiEdit2 className="w-4 h-4" />
            Edit Program
          </button>
        ) : (
          <button
            onClick={handleCancelEdit}
            className="flex items-center gap-2 text-sm font-semibold text-slate-500 hover:text-slate-700 border border-slate-200 hover:bg-slate-50 py-2 px-4 rounded-xl transition"
          >
            <FiX className="w-4 h-4" />
            Cancel
          </button>
        )}
      </div>

      {/* ── Section 1: Program Details ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <h2 className="text-base font-bold text-[#0d1e43] mb-6">Program Details</h2>

        {isEditing ? (
          <form onSubmit={handleSaveProgram} className="space-y-5">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">
                Program Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Presidential Election"
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 px-4 text-[#0d1e43] placeholder-slate-400 transition outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Details about the program or criteria"
                rows={3}
                className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 px-4 text-[#0d1e43] placeholder-slate-400 transition outline-none resize-none"
              />
            </div>

            {/* Voting toggle — only in edit mode */}
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-3">
                Voting Status
              </label>
              <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                <Switch.Root
                  checked={program.is_active}
                  onCheckedChange={handleToggle}
                  disabled={toggleMutation.isPending}
                  className="w-11 h-6 rounded-full transition data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300"
                >
                  <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow transition-transform translate-x-0 data-[state=checked]:translate-x-5" />
                </Switch.Root>
                <div>
                  <p className="text-sm font-semibold text-[#0d1e43]">
                    {program.is_active ? "Voting is On" : "Voting is Off"}
                  </p>
                  {program.is_active && program.voting_ends_at && (
                    <p className="text-xs text-slate-400 mt-0.5">
                      Ends {new Date(program.voting_ends_at).toLocaleString()}
                    </p>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={handleCancelEdit}
                className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-3 px-6 rounded-xl transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={updateProgramMutation.isPending}
                className="bg-[#10b981] hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-semibold py-3 px-8 rounded-xl transition flex items-center gap-2"
              >
                {updateProgramMutation.isPending ? (
                  <Loader2 className="animate-spin w-5 h-5" />
                ) : (
                  "Save Changes"
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-5">
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Program Name
              </p>
              <p className="text-sm font-semibold text-[#0d1e43]">{program.name}</p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Description
              </p>
              <p className="text-sm text-slate-600">
                {program.description || "No description provided."}
              </p>
            </div>
            <div>
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">
                Status
              </p>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-bold ${
                  program.is_active
                    ? "bg-emerald-100 text-emerald-700"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {program.is_active ? "Voting On" : "Voting Off"}
              </span>
              {program.is_active && program.voting_ends_at && (
                <p className="text-xs text-slate-400 mt-2">
                  Ends {new Date(program.voting_ends_at).toLocaleString()}
                </p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* ── Section 2: Candidates ── */}
      <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-bold text-[#0d1e43]">Candidates</h2>
            <p className="text-xs text-slate-400 mt-0.5">Add and manage candidates.</p>
          </div>
          <span className="text-xs font-semibold text-slate-400 bg-slate-100 px-3 py-1 rounded-full">
            {existingCandidates?.length ?? 0} added
          </span>
        </div>

        <div className="flex gap-3 mb-6">
          <input
            type="text"
            value={candidateName}
            onChange={(e) => setCandidateName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCandidate())}
            placeholder="e.g. John Samson"
            className="flex-1 bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 px-4 text-[#0d1e43] placeholder-slate-400 transition outline-none"
          />
          <button
            type="button"
            onClick={handleAddCandidate}
            disabled={createCandidateMutation.isPending}
            className="bg-[#10b981] hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-semibold py-3 px-5 rounded-xl transition flex items-center gap-2"
          >
            {createCandidateMutation.isPending ? (
              <Loader2 className="animate-spin w-4 h-4" />
            ) : (
              <FiPlus className="w-4 h-4" />
            )}
            Add
          </button>
        </div>

        {loadingCandidates ? (
          <div className="flex items-center justify-center py-8 text-slate-400">
            <Loader2 className="animate-spin w-5 h-5 mr-2" />
            Loading candidates...
          </div>
        ) : !existingCandidates || existingCandidates.length === 0 ? (
          <div className="text-center py-8 text-slate-400 text-sm border border-dashed border-slate-200 rounded-xl">
            No candidates added yet. Add one above.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {existingCandidates.map((cand, index) => (
              <li key={cand.id} className="flex items-center gap-3 py-3">
                <span className="text-xs font-bold text-slate-400 w-5 text-center">
                  {index + 1}
                </span>
                {editingCandidateId === cand.id ? (
                  <>
                    <input
                      type="text"
                      value={editingCandidateName}
                      onChange={(e) => setEditingCandidateName(e.target.value)}
                      autoFocus
                      className="flex-1 bg-white border border-emerald-500 ring-1 ring-emerald-500 rounded-xl py-2 px-3 text-[#0d1e43] text-sm outline-none"
                    />
                    <button
                      onClick={() => handleUpdateCandidate(cand.id)}
                      disabled={updateCandidateMutation.isPending}
                      className="p-2 text-emerald-500 hover:bg-emerald-50 rounded-lg transition"
                    >
                      {updateCandidateMutation.isPending ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <FiCheck className="w-4 h-4" />
                      )}
                    </button>
                    <button
                      onClick={() => {
                        setEditingCandidateId(null);
                        setEditingCandidateName("");
                      }}
                      className="p-2 text-slate-400 hover:bg-slate-50 rounded-lg transition"
                    >
                      <FiX className="w-4 h-4" />
                    </button>
                  </>
                ) : (
                  <>
                    <span className="flex-1 text-sm font-semibold text-[#0d1e43]">{cand.name}</span>
                    <button
                      onClick={() => {
                        setEditingCandidateId(cand.id);
                        setEditingCandidateName(cand.name);
                      }}
                      className="p-2 text-slate-400 hover:text-emerald-500 hover:bg-slate-100 rounded-lg transition"
                    >
                      <FiEdit2 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteCandidate(cand.id)}
                      disabled={deleteCandidateMutation.isPending}
                      className="p-2 text-slate-400 hover:text-red-500 hover:bg-slate-100 rounded-lg transition"
                    >
                      {deleteCandidateMutation.isPending ? (
                        <Loader2 className="animate-spin w-4 h-4" />
                      ) : (
                        <FiTrash2 className="w-4 h-4" />
                      )}
                    </button>
                  </>
                )}
              </li>
            ))}
          </ul>
        )}

        <div className="flex justify-end mt-6 pt-4 border-t border-slate-100">
          <button
            onClick={() => navigate({ to: "/admin/programs" })}
            className="bg-[#0d1e43] hover:bg-slate-800 text-white font-semibold py-3 px-8 rounded-xl transition"
          >
            Done
          </button>
        </div>
      </div>

      {/* Duration Modal */}
      <Modal
        open={isDurationModalOpen}
        onOpenChange={handleDurationModalClose}
        title="Set Voting Duration"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-500">
            How long should voting be open for{" "}
            <span className="font-semibold text-[#0d1e43]">{program.name}</span>?
          </p>

          <div>
            <p className="text-xs text-slate-400 mb-3">Min 30 minutes · Max 30 days</p>
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: "Days", value: durationDays, max: 30, setter: setDurationDays },
                { label: "Hours", value: durationHours, max: 23, setter: setDurationHours },
                { label: "Minutes", value: durationMinutes, max: 59, setter: setDurationMinutes },
              ].map(({ label, value, max, setter }) => (
                <div key={label}>
                  <label className="block text-xs text-slate-500 mb-1">{label}</label>
                  <input
                    type="number"
                    min={0}
                    max={max}
                    value={value}
                    onChange={(e) => setter(Math.max(0, Math.min(max, Number(e.target.value))))}
                    className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 px-4 text-[#0d1e43] transition outline-none"
                  />
                </div>
              ))}
            </div>
            <div
              className={`mt-3 text-xs px-3 py-2 rounded-lg ${
                totalMinutes < MIN_MINUTES || totalMinutes > MAX_MINUTES
                  ? "bg-red-50 text-red-500"
                  : "bg-emerald-50 text-emerald-600"
              }`}
            >
              {totalMinutes < MIN_MINUTES
                ? "Too short — minimum is 30 minutes"
                : totalMinutes > MAX_MINUTES
                  ? "Too long — maximum is 30 days"
                  : `Voting will run for ${durationDays > 0 ? `${durationDays}d ` : ""}${durationHours > 0 ? `${durationHours}h ` : ""}${durationMinutes > 0 ? `${durationMinutes}m` : ""}`}
            </div>
          </div>

          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => handleDurationModalClose(false)}
              className="w-1/2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-3 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDurationSave}
              disabled={toggleMutation.isPending}
              className="w-1/2 bg-[#10b981] hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center"
            >
              {toggleMutation.isPending ? (
                <Loader2 className="animate-spin w-5 h-5" />
              ) : (
                "Start Voting"
              )}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
