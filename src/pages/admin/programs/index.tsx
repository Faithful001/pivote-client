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

export default function AdminPrograms() {
  const { data: programs, isLoading } = usePrograms();
  const deleteMutation = useDeleteProgram();
  const toggleMutation = useToggleProgram();
  const navigate = useNavigate();

  const [isCopied, setIsCopied] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedProgram, setSelectedProgram] = useState<Program | null>(null);

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

  const handleToggle = (id: string, checked: boolean) => {
    toggleMutation.mutate(
      { id, is_active: checked },
      {
        onSuccess: (data) => toast.success(data.message),
        onError: (err: any) => {
          toast.error(err.response?.data?.message || err.message || "Failed to update status");
        },
      }
    );
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
                        onCheckedChange={(checked) => handleToggle(program.id, checked)}
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

      {/* Share Modal */}
      <Modal open={isShareModalOpen} onOpenChange={setIsShareModalOpen} title="Share Program">
        <div className="flex flex-col gap-2">
          <div className="rounded-md bg-gray-100 p-2">
            <p className="text-sm break-all">
              {`${window.location.origin}/programs/${selectedProgram?.id}/request-join?name=${selectedProgram?.name}`}
            </p>
          </div>
          <button
            onClick={() =>
              handleCopy(
                `${window.location.origin}/programs/${selectedProgram?.id}/request-join?name=${selectedProgram?.name}`
              )
            }
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
