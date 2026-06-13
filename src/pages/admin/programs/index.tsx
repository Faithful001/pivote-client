import { useState } from "react";
import {
  usePrograms,
  useDeleteProgram,
  useToggleProgram,
  type Program,
} from "../../../api/program";
import { toast } from "sonner";
import { FiPlus, FiTrash2, FiInbox, FiShare2, FiCopy, FiExternalLink } from "react-icons/fi";
import { TiTick } from "react-icons/ti";
import Modal from "../../../components/modals";
import { Loader2 } from "lucide-react";
import * as Switch from "@radix-ui/react-switch";
import { useNavigate } from "@tanstack/react-router";

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

export default function AdminPrograms() {
  const { data: programs, isLoading } = usePrograms();
  const deleteMutation = useDeleteProgram();
  const toggleMutation = useToggleProgram();
  const navigate = useNavigate();

  const [isCopied, setIsCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isDurationModalOpen, setIsDurationModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

  // duration state for the modal
  const [durationDays, setDurationDays] = useState(0);
  const [durationHours, setDurationHours] = useState(0);
  const [durationMinutes, setDurationMinutes] = useState(30);

  const totalMinutes = durationDays * 24 * 60 + durationHours * 60 + durationMinutes;

  const workspaceId = localStorage.getItem("workspace_id") || "";
  const workspaceObjStr = localStorage.getItem("workspace");
  let workspaceName = "";
  if (workspaceObjStr) {
    try {
      workspaceName = JSON.parse(workspaceObjStr).name || "";
    } catch (e) {}
  }

  const shareLink = selectedProgram
    ? `${window.location.origin}/programs/${selectedProgram.id}/request-join?workspace_id=${workspaceId}&workspace_name=${encodeURIComponent(workspaceName)}&program_name=${encodeURIComponent(selectedProgram.name)}`
    : "";

  const handleCopy = (text: string) => {
    setIsCopied(true);
    navigator.clipboard.writeText(text);
    setTimeout(() => setIsCopied(false), 1000);
  };

  const openShareModal = (prog: Program) => {
    setSelectedProgram(prog);
    setIsShareModalOpen(true);
  };

  const openDeleteModal = (prog: Program) => {
    setSelectedProgram(prog);
    setIsDeleteModalOpen(true);
  };

  const handleDelete = () => {
    if (!selectedProgram) return;
    deleteMutation.mutate(selectedProgram.id, {
      onSuccess: () => {
        toast.success("Program deleted successfully!");
        setIsDeleteModalOpen(false);
        setSelectedProgram(null);
      },
      onError: (err: any) => {
        toast.error(err.response?.data?.message || err.message || "Failed to delete program");
      },
    });
  };

  // toggle on - open duration modal instead of firing immediately
  const handleToggle = (prog: Program, checked: boolean) => {
    if (checked) {
      setSelectedProgram(prog);
      setDurationDays(0);
      setDurationHours(0);
      setDurationMinutes(30);
      setIsDurationModalOpen(true);
    } else {
      // toggle off - fire immediately with null voting_ends_at
      toggleMutation.mutate(
        { id: prog.id, is_active: false, voting_ends_at: null },
        {
          onSuccess: (data) => toast.success(data.message),
          onError: (err: any) => {
            toast.error(err.response?.data?.message || err.message || "Failed to update status");
          },
        }
      );
    }
  };

  const handleDurationSave = () => {
    if (!selectedProgram) return;

    const error = validateDuration(durationDays, durationHours, durationMinutes);
    if (error) {
      toast.error(error);
      return;
    }

    toggleMutation.mutate(
      {
        id: selectedProgram.id,
        is_active: true,
        voting_ends_at: durationToTimestamp(durationDays, durationHours, durationMinutes),
      },
      {
        onSuccess: (data) => {
          toast.success(data.message);
          setIsDurationModalOpen(false);
          setSelectedProgram(null);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || err.message || "Failed to update status");
          setIsDurationModalOpen(false);
          setSelectedProgram(null);
        },
      }
    );
  };

  const handleDurationModalClose = (open: boolean) => {
    // modal closed without saving — snap switch back to off
    if (!open) {
      setIsDurationModalOpen(false);
      setSelectedProgram(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0d1e43] mb-1">Manage Programs</h1>
          <p className="text-slate-500 text-sm">Create and organize election categories.</p>
        </div>
        <button
          onClick={() => navigate({ to: "/admin/programs/create" })}
          className="bg-[#10b981] hover:bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/10"
        >
          <FiPlus className="w-5 h-5" />
          Add Program
        </button>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-2" />
          Loading programs...
        </div>
      ) : !programs || programs.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-slate-400">
          <FiInbox className="w-12 h-12 mx-auto mb-4 text-slate-300" />
          <p>No programs created yet.</p>
        </div>
      ) : (
        <div className="bg-white border border-slate-200/60 rounded-2xl overflow-hidden shadow-sm">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100 text-xs font-bold text-[#0d1e43] uppercase tracking-wider">
                <th className="px-6 py-4">Name</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Voting Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-semibold text-[#0d1e43]">{program.name}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">
                    {program.description || "-"}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Switch.Root
                        checked={program.is_active}
                        onCheckedChange={(checked) => handleToggle(program, checked)}
                        disabled={toggleMutation.isPending}
                        className="w-11 h-6 rounded-full transition data-[state=checked]:bg-emerald-500 data-[state=unchecked]:bg-slate-300"
                      >
                        <Switch.Thumb className="block w-5 h-5 bg-white rounded-full shadow transition-transform translate-x-0 data-[state=checked]:translate-x-5" />
                      </Switch.Root>
                      <span className="text-xs font-bold text-slate-600">
                        {program.is_active ? "Voting On" : "Voting Off"}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() =>
                          navigate({
                            to: "/admin/programs/$programId/view",
                            params: { programId: program.id },
                          })
                        }
                        className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-slate-100 rounded-lg transition"
                        title="View program"
                      >
                        <FiExternalLink className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openShareModal(program)}
                        className="p-2 text-slate-500 hover:text-blue-500 hover:bg-slate-100 rounded-lg transition"
                        title="Share join link"
                      >
                        <FiShare2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => openDeleteModal(program)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-100 rounded-lg transition"
                        title="Delete program"
                      >
                        <FiTrash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Duration Modal */}
      <Modal
        open={isDurationModalOpen}
        onOpenChange={handleDurationModalClose}
        title="Set Voting Duration"
      >
        <div className="space-y-5">
          <p className="text-sm text-slate-500">
            How long should voting be open for{" "}
            <span className="font-semibold text-[#0d1e43]">{selectedProgram?.name}</span>?
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

      {/* Share Modal */}
      <Modal open={isShareModalOpen} onOpenChange={setIsShareModalOpen} title="Share Program">
        <div className="flex flex-col gap-2">
          <div className="rounded-md bg-gray-100 p-2">
            <p className="text-sm break-all">
              {shareLink}
            </p>
          </div>
          <button
            onClick={() => handleCopy(shareLink)}
            className="flex text-white items-center gap-1 rounded-md bg-emerald-600 p-2 cursor-pointer w-max hover:bg-emerald-500 transition"
          >
            {isCopied ? <TiTick className="w-4 h-4" /> : <FiCopy className="w-4 h-4" />}
            <p className="text-xs">{isCopied ? "Copied!" : "Copy"}</p>
          </button>
        </div>
      </Modal>

      {/* Delete Modal */}
      <Modal open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen} title="Delete Program">
        <div className="flex flex-col gap-2">
          <p className="text-sm">
            Are you sure you want to delete{" "}
            <span className="font-semibold text-[#0d1e43]">{selectedProgram?.name}</span>? This will
            also remove all candidates in this program.
          </p>
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => setIsDeleteModalOpen(false)}
              className="w-1/2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-3 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDelete}
              disabled={deleteMutation.isPending}
              className="w-1/2 bg-red-500 flex items-center justify-center hover:bg-red-600 disabled:bg-red-700 text-white font-semibold py-3 rounded-xl transition"
            >
              {deleteMutation.isPending ? <Loader2 className="animate-spin w-5 h-5" /> : "Delete"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
