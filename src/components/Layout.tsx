import React, { useState } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useMe } from "../api/auth";
import { useQueryClient } from "@tanstack/react-query";
import { useWorkspaces, useCreateWorkspace, type Workspace } from "../api/workspace";
import Modal from "./modals";
import {
  FiGrid,
  FiCheckSquare,
  FiBarChart2,
  FiBookOpen,
  FiSettings,
  FiLogOut,
  FiChevronDown,
  FiPlus,
  // FiUsers,
} from "react-icons/fi";
import { toast } from "sonner";
import { LiaVoteYeaSolid } from "react-icons/lia";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { data: user, isLoading } = useMe();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();

  const [isWorkspaceDropdownOpen, setIsWorkspaceDropdownOpen] = useState(false);
  const [isCreateWorkspaceModalOpen, setIsCreateWorkspaceModalOpen] = useState(false);
  const [newWorkspaceName, setNewWorkspaceName] = useState("");

  const { data: workspaces } = useWorkspaces();
  const createWorkspaceMutation = useCreateWorkspace();

  const currentWorkspaceId = localStorage.getItem("workspace_id");
  const workspaceObjStr = localStorage.getItem("workspace");
  let currentWorkspaceName = "";
  if (workspaceObjStr) {
    try {
      currentWorkspaceName = JSON.parse(workspaceObjStr).name || "";
    } catch (e) {}
  }

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("workspace_id");
    localStorage.removeItem("workspace");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate({ to: "/login" });
  };

  const handleSelectWorkspace = (ws: Workspace) => {
    localStorage.setItem("workspace_id", ws.id);
    localStorage.setItem("workspace", JSON.stringify(ws));
    setIsWorkspaceDropdownOpen(false);
    
    // Invalidate react-query cache to force refetch of all queries
    queryClient.invalidateQueries();
    
    toast.success(`Switched to workspace: ${ws.name}`);
    
    // Redirect to home dashboard of the new workspace
    navigate({ to: "/" });
  };

  const handleCreateWorkspace = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newWorkspaceName.trim()) return;

    createWorkspaceMutation.mutate(
      { name: newWorkspaceName.trim() },
      {
        onSuccess: (data) => {
          toast.success("Workspace created successfully!");
          setIsCreateWorkspaceModalOpen(false);
          setNewWorkspaceName("");
          handleSelectWorkspace(data);
        },
        onError: (err: any) => {
          toast.error(err.response?.data?.message || err.message || "Failed to create workspace");
        },
      }
    );
  };

  const navItems = [
    { label: "Dashboard", path: "/", icon: FiGrid },
    { label: "Vote", path: "/vote", icon: FiCheckSquare },
    { label: "Results", path: "/results", icon: FiBarChart2 },
    { label: "Voters Guidelines", path: "/guidelines", icon: FiBookOpen },
    { label: "Settings", path: "/settings", icon: FiSettings },
  ];

  // Add Admin-only links if user is admin
  if (user?.role === "admin") {
    navItems.push(
      { label: "Admin Programs", path: "/admin/programs", icon: LiaVoteYeaSolid }
    );
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center text-slate-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar: Deep Navy matching screenshot */}
      <aside className="w-64 bg-[#0d1e43] text-slate-100 flex flex-col justify-between shrink-0 shadow-xl fixed h-screen z-10">
        <div className="flex flex-col">
          {/* Logo Brand area with Switcher */}
          <div className="py-4 border-b border-white/5 px-6 flex flex-col justify-center gap-1.5 relative">
            <div className="flex items-center gap-2 font-bold text-lg tracking-wider text-emerald-400">
              <FiCheckSquare className="w-5 h-5" />
              PIVOTE
            </div>

            {user?.role === "admin" && (
              <div className="relative mt-1">
                <button
                  onClick={() => setIsWorkspaceDropdownOpen(!isWorkspaceDropdownOpen)}
                  className="flex items-center justify-between w-full bg-white/5 border border-white/10 rounded-lg px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-white/10 transition"
                >
                  <span className="truncate">{currentWorkspaceName || "Select Workspace"}</span>
                  <FiChevronDown className="w-3.5 h-3.5 ml-1 flex-shrink-0" />
                </button>
                
                {isWorkspaceDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-slate-800 border border-slate-700 rounded-lg shadow-xl py-1 z-50">
                    <div className="max-h-40 overflow-y-auto">
                      {workspaces?.map((ws) => (
                        <button
                          key={ws.id}
                          onClick={() => handleSelectWorkspace(ws)}
                          className={`flex items-center w-full px-3 py-2 text-left text-xs hover:bg-white/5 transition ${
                            ws.id === currentWorkspaceId ? "text-emerald-400 font-bold" : "text-slate-300"
                          }`}
                        >
                          {ws.name}
                        </button>
                      ))}
                    </div>
                    <div className="border-t border-slate-700 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsWorkspaceDropdownOpen(false);
                          setIsCreateWorkspaceModalOpen(true);
                        }}
                        className="flex items-center gap-1.5 w-full px-3 py-2 text-left text-xs text-emerald-400 hover:bg-white/5 transition font-semibold"
                      >
                        <FiPlus className="w-3.5 h-3.5" />
                        Create Workspace
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Navigation Links */}
          <nav className="mt-8 px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path;
              return (
                <Link
                  key={item.label}
                  to={item.path}
                  className={`flex items-center gap-3 px-4 py-3 rounded-md text-sm font-medium transition duration-200 ${
                    isActive
                      ? "bg-emerald-500 text-white font-semibold shadow-lg shadow-emerald-500/10"
                      : "text-slate-300 hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <item.icon className="w-5 h-5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Logout area */}
        <div className="p-4 border-t border-white/5">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-4 py-3 rounded-lg text-sm font-medium text-slate-300 hover:bg-red-500/10 hover:text-red-400 transition duration-200"
          >
            <FiLogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 min-h-screen pl-64 bg-[#f8fafc]">
        <div className="p-10 max-w-7xl mx-auto">{children}</div>
      </main>

      {/* Create Workspace Modal */}
      <Modal
        open={isCreateWorkspaceModalOpen}
        onOpenChange={setIsCreateWorkspaceModalOpen}
        title="Create New Workspace"
      >
        <form onSubmit={handleCreateWorkspace} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-slate-700 mb-2">Workspace Name</label>
            <input
              type="text"
              required
              value={newWorkspaceName}
              onChange={(e) => setNewWorkspaceName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="w-full bg-white border border-slate-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 px-4 text-[#0d1e43] placeholder-slate-400 transition outline-none"
            />
          </div>
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={() => setIsCreateWorkspaceModalOpen(false)}
              className="w-1/2 border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-3 rounded-xl transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createWorkspaceMutation.isPending}
              className="w-1/2 bg-[#10b981] hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-semibold py-3 rounded-xl transition flex items-center justify-center"
            >
              {createWorkspaceMutation.isPending ? (
                <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
              ) : (
                "Create Workspace"
              )}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
