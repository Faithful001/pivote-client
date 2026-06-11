import React from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import { useMe } from "../api/auth";
import {
  FiGrid,
  FiCheckSquare,
  FiBarChart2,
  FiBookOpen,
  FiSettings,
  FiLogOut,
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

  const handleLogout = () => {
    localStorage.removeItem("token");
    toast.success("Logged out successfully");
    navigate({ to: "/login" });
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
      // { label: "Admin Candidates", path: "/admin/candidates", icon: FiUsers }
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
          {/* Logo Brand area */}
          <div className="h-20 flex items-center px-6 border-b border-white/5">
            <div className="flex items-center gap-2 font-bold text-xl tracking-wider text-emerald-400">
              <FiCheckSquare className="w-6 h-6" />
              PIVOTE
            </div>
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
    </div>
  );
}
