import React, { useState } from 'react';
import { 
  usePrograms, 
  useCreateProgram, 
  useUpdateProgram, 
  useDeleteProgram,
  useToggleProgram 
} from '../api/program';
import { toast } from 'sonner';
import { FiPlus, FiEdit2, FiTrash2, FiInbox, FiX, FiCheck, FiLock } from 'react-icons/fi';

export default function AdminPrograms() {
  const { data: programs, isLoading } = usePrograms();
  const createMutation = useCreateProgram();
  const updateMutation = useUpdateProgram();
  const deleteMutation = useDeleteProgram();
  const toggleMutation = useToggleProgram();

  // Modal / Form state
  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');

  const openCreateModal = () => {
    setName('');
    setDescription('');
    setEditingId(null);
    setIsOpen(true);
  };

  const openEditModal = (prog: any) => {
    setName(prog.name);
    setDescription(prog.description);
    setEditingId(prog.id);
    setIsOpen(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name) {
      toast.error('Program Name is required');
      return;
    }

    if (editingId) {
      updateMutation.mutate(
        { id: editingId, name, description },
        {
          onSuccess: () => {
            toast.success('Program updated successfully!');
            setIsOpen(false);
          },
          onError: (err: any) => {
            const errMsg = err.response?.data?.message || err.message || 'Failed to update program';
            toast.error(errMsg);
          },
        }
      );
    } else {
      createMutation.mutate(
        { name, description },
        {
          onSuccess: () => {
            toast.success('Program created successfully!');
            setIsOpen(false);
          },
          onError: (err: any) => {
            const errMsg = err.response?.data?.message || err.message || 'Failed to create program';
            toast.error(errMsg);
          },
        }
      );
    }
  };

  const handleDelete = (id: string) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      deleteMutation.mutate(id, {
        onSuccess: () => {
          toast.success('Program deleted successfully!');
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.message || err.message || 'Failed to delete program';
          toast.error(errMsg);
        },
      });
    }
  };

  const handleToggle = (id: string, currentStatus: boolean) => {
    toggleMutation.mutate(
      { id, is_active: !currentStatus },
      {
        onSuccess: () => {
          toast.success('Voting status updated successfully!');
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.message || err.message || 'Failed to update status';
          toast.error(errMsg);
        },
      }
    );
  };

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#0d1e43] mb-1">Manage Programs</h1>
          <p className="text-slate-500 text-sm">Create and organize election categories.</p>
        </div>
        <button
          onClick={openCreateModal}
          className="bg-[#10b981] hover:bg-emerald-600 text-white font-semibold py-2.5 px-5 rounded-xl transition flex items-center gap-2 shadow-lg shadow-emerald-500/10"
        >
          <FiPlus className="w-5 h-5" />
          Add Program
        </button>
      </div>

      {isLoading ? (
        <div className="h-64 flex items-center justify-center text-slate-400">
          <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-emerald-500 mr-2"></div>
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
                <th className="px-6 py-4">Access Code</th>
                <th className="px-6 py-4">Voting Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
              {programs.map((program) => (
                <tr key={program.id} className="hover:bg-slate-50/50 transition">
                  <td className="px-6 py-4 font-semibold text-[#0d1e43]">{program.name}</td>
                  <td className="px-6 py-4 text-slate-500 max-w-xs truncate">{program.description || '-'}</td>
                  <td className="px-6 py-4 font-mono font-bold text-slate-700">{program.access_code}</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => handleToggle(program.id, program.is_active)}
                      disabled={toggleMutation.isPending}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition flex items-center gap-1.5 ${
                        program.is_active
                          ? 'bg-emerald-50 text-emerald-600 border-emerald-100 hover:bg-emerald-100/50'
                          : 'bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100/50'
                      }`}
                    >
                      {program.is_active ? (
                        <>
                          <FiCheck className="w-3.5 h-3.5" /> Voting On
                        </>
                      ) : (
                        <>
                          <FiLock className="w-3.5 h-3.5" /> Voting Off
                        </>
                      )}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => openEditModal(program)}
                        className="p-2 text-slate-500 hover:text-emerald-500 hover:bg-slate-100 rounded-lg transition"
                      >
                        <FiEdit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(program.id)}
                        className="p-2 text-slate-500 hover:text-red-500 hover:bg-slate-100 rounded-lg transition"
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

      {/* Slide-over or modal for program editor */}
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
              {editingId ? 'Edit Program' : 'Create Program'}
            </h3>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-2">Program Name</label>
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
                  rows={4}
                  className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 px-4 text-[#0d1e43] placeholder-slate-400 transition outline-none resize-none"
                />
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
                  Save Program
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
