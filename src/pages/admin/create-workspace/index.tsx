import React, { useState } from "react";
import { useCreateWorkspace } from "../../../api/workspace";
import { useMe } from "../../../api/auth";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import { FiCheckSquare, FiLogOut, FiBriefcase } from "react-icons/fi";

export default function AdminCreateWorkspace() {
  const [workspaceName, setWorkspaceName] = useState("");
  const createWorkspaceMutation = useCreateWorkspace();
  const { data: user } = useMe();
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("workspace_id");
    localStorage.removeItem("workspace");
    localStorage.removeItem("user");
    navigate({ to: "/admin/login" });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!workspaceName.trim()) {
      toast.error("Workspace name is required");
      return;
    }

    createWorkspaceMutation.mutate(
      { name: workspaceName.trim() },
      {
        onSuccess: (data) => {
          localStorage.setItem("workspace_id", data.id);
          localStorage.setItem("workspace", JSON.stringify(data));
          toast.success("Workspace created successfully! Welcome to Pivote.");
          navigate({ to: "/admin/dashboard" });
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.message || err.message || "Failed to create workspace";
          toast.error(errMsg);
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
      {/* Fixed top bar: logo left, logout right */}
      <div className="fixed top-0 left-0 right-0 flex items-center justify-between px-6 py-4 z-50">
        <Link
          to="/"
          className="flex items-center gap-2 font-bold text-lg tracking-wider text-[#0d1e43]"
        >
          <FiCheckSquare className="w-6 h-6 text-amber-500" />
          <span>PIVOTE</span>
        </Link>
        <button
          onClick={handleLogout}
          className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 text-sm font-medium transition"
        >
          <FiLogOut className="w-4 h-4" />
          Logout
        </button>
      </div>

      {/* Card */}
      <div className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200/60 p-8">
        <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-[#0d1e43]/5 text-[#0d1e43] mb-6">
          <FiBriefcase className="w-7 h-7" />
        </div>

        <h1 className="text-3xl font-extrabold text-[#0d1e43] mb-2 tracking-tight">
          Create Your Workspace
        </h1>
        <p className="text-slate-500 text-[13px] leading-relaxed mb-8">
          Welcome, {user?.name || "Admin"}! A workspace is where you manage your programs,
          candidates, and elections.
        </p>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-[14px] font-semibold text-[#0d1e43]">Workspace Name</label>
            <input
              type="text"
              value={workspaceName}
              onChange={(e) => setWorkspaceName(e.target.value)}
              placeholder="e.g. Student Union Government"
              className="w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl py-3.5 px-4 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none"
              autoFocus
            />
            <p className="text-xs text-slate-400">
              This will be the name visible to voters when they join programs.
            </p>
          </div>

          <button
            type="submit"
            disabled={createWorkspaceMutation.isPending}
            className="w-full bg-[#10b981] hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 text-[15px] mt-2"
          >
            {createWorkspaceMutation.isPending ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Workspace & Continue →"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
