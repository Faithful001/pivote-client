import React, { useState } from "react";
import {
  useCandidates,
  useCreateCandidate,
  useUpdateCandidate,
  useDeleteCandidate,
} from "../../../api/candidate";
import { useAdminPrograms } from "../../../api/program";
import { toast } from "sonner";
import { FiPlus, FiEdit2, FiTrash2, FiInbox, FiX } from "react-icons/fi";

export default function AdminCandidates() {
  const { data: candidates, isLoading: loadingCandidates } = useCandidates();
  const { data: programs, isLoading: loadingPrograms } = useAdminPrograms();
  const createMutation = useCreateCandidate();
  const updateMutation = useUpdateCandidate();
  const deleteMutation = useDeleteCandidate();

  // Modal / Form state
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [programId, setProgramId] = useState("");

  const openCreateModal = () => {
    setName("");
    setProgramId(programs && programs.length > 0 ? programs[0].id : "");
    setEditingId(null);
    setIsOpen(true);
  };

  const openEditModal = (cand: any) => {
    setName(cand.name);
    setProgramId(cand.program_id);
    setEditingId(cand.id);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !programId) {
      toast.error("All fields are required");
      return;
    }

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, name, program_id: programId },
        {
          onSuccess: () => {
            toast.success("Candidate updated successfully!");
            setIsOpen(false);
          },
          onError: (err: any) => {
            const errMsg =
              err.response?.data?.message || err.message || "Failed to update candidate";
            toast.error(errMsg);
          },
        }
      );
    } else {
      createMutation.mutate(
        { name, program_id: programId },
        {
          onSuccess: () => {
            toast.success("Candidate registered successfully!");
            setIsOpen(false);
          },
          onError: (err: any) => {
            const errMsg =
              err.response?.data?.message || err.message || "Failed to create candidate";
            toast.error(errMsg);
          },
        }
      );
    }
  };

  const handleDelete = (id: string, progId: string) => {
    if (window.confirm("Are you sure you want to delete this candidate?")) {
      deleteMutation.mutate(
        { id, programId: progId },
        {
          onSuccess: () => {
            toast.success("Candidate deleted successfully!");
          },
          onError: (err: any) => {
            const errMsg =
              err.response?.data?.message || err.message || "Failed to delete candidate";
            toast.error(errMsg);
          },
        }
      );
    }
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#0d1e43] mb-1">
            Nominate Candidates
          </h1>
          <p className="text-slate-500 text-sm">
            Register new candidates to active election categories.
          </p>
        </div>
        <button
          onClick={openCreateModal}
          disabled={!programs || programs.length === 0}
          className="bg-[#10b981] hover:bg-emerald-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-semibold py-2.5 px-5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/10"
        >
          <FiPlus className="w-5 h-5" />
          <span className="hidden sm:inline">Add Candidate</span>
        </button>
      </div>

      {loadingCandidates || loadingPrograms ? (
        <div className="h-64 flex items-center justify-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-2"></div>
          Loading candidates list...
        </div>
      ) : !candidates || candidates.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <FiInbox className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p>No candidates nominated yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-2xl overflow-x-auto shadow-sm">
          <table className="w-full min-w-[500px] text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-[#0d1e43] uppercase tracking-wider">
                <th className="px-6 py-4">Candidate Name</th>
                <th className="px-6 py-4">Program / Category</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {candidates.map((cand) => {
                const programName =
                  programs?.find((p) => p.id === cand.program_id)?.name || "Unknown Program";
                return (
                  <tr key={cand.id} className="hover:bg-slate-50/50 transition">
                    <td className="px-6 py-4 font-semibold text-[#0d1e43]">{cand.name}</td>
                    <td className="px-6 py-4 text-slate-500">{programName}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          onClick={() => openEditModal(cand)}
                          className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-slate-100 rounded-lg transition"
                        >
                          <FiEdit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(cand.id, cand.program_id)}
                          className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-100 rounded-lg transition"
                        >
                          <FiTrash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Editor Modal */}
      {isOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-100 p-8 relative">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 p-2 hover:bg-slate-50 rounded-full transition"
            >
              <FiX className="w-5 h-5" />
            </button>

            <h3 className="text-xl font-bold text-[#0d1e43] mb-6">
              {editingId ? "Edit Candidate" : "Add Candidate"}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Candidate Name
                </label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. John Samson"
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 px-4 text-[#0d1e43] placeholder-slate-400 transition outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Select Program
                </label>
                <select
                  value={programId}
                  onChange={(e) => setProgramId(e.target.value)}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 px-4 text-[#0d1e43] placeholder-slate-400 transition outline-none"
                >
                  {programs?.map((prog) => (
                    <option key={prog.id} value={prog.id}>
                      {prog.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-4 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="w-1/2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-3 rounded-xl transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createMutation.isPending || updateMutation.isPending}
                  className="w-1/2 bg-[#10b981] hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition"
                >
                  Save Candidate
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
