import React, { useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "@tanstack/react-router";
import {
  FiGrid,
  FiCheckSquare,
  FiBarChart2,
  FiBookOpen,
  FiSettings,
  FiLogOut,
  FiMenu,
  FiX,
} from "react-icons/fi";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setIsSidebarOpen(false);
  }, [location.pathname]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("workspace_id");
    localStorage.removeItem("workspace");
    localStorage.removeItem("user");
    toast.success("Logged out successfully");
    navigate({ to: "/login" });
  };

  const navItems = [
    { label: "Dashboard", path: "/dashboard", icon: FiGrid },
    { label: "Vote", path: "/vote", icon: FiCheckSquare },
    { label: "Results", path: "/results", icon: FiBarChart2 },
    { label: "Voters Guidelines", path: "/guidelines", icon: FiBookOpen },
    { label: "Settings", path: "/settings", icon: FiSettings },
  ];

  const Sidebar = () => (
    <aside className="w-64 bg-[#0d1e43] text-slate-100 flex flex-col justify-between h-full">
      <div className="flex flex-col">
        {/* Logo */}
        <div className="py-4 border-b border-white/5 px-6 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg tracking-wider text-emerald-400">
            <FiCheckSquare className="w-5 h-5" />
            PIVOTE
          </div>
          <button
            onClick={() => setIsSidebarOpen(false)}
            className="md:hidden text-slate-400 hover:text-white transition"
          >
            <FiX className="w-5 h-5" />
          </button>
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
  );

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Desktop Sidebar */}
      <div className="hidden md:flex fixed h-screen w-64 z-10 shadow-xl">
        <Sidebar />
      </div>

      {/* Mobile Sidebar Overlay */}
      <div
        className={`md:hidden fixed inset-0 z-40 flex ${
          isSidebarOpen ? "pointer-events-auto" : "pointer-events-none"
        }`}
      >
        {/* Backdrop fades in/out */}
        <div
          className={`fixed inset-0 bg-black/50 transition-opacity duration-300 ${
            isSidebarOpen ? "opacity-100" : "opacity-0"
          }`}
          onClick={() => setIsSidebarOpen(false)}
        />
        {/* Drawer slides in/out */}
        <div
          className={`relative z-50 w-64 h-full shadow-xl transform transition-transform duration-300 ease-in-out ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          <Sidebar />
        </div>
      </div>

      <main className="flex-1 min-w-0 md:pl-64 bg-[#f8fafc] min-h-screen">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 bg-[#0d1e43] shadow">
          <div className="flex items-center gap-2 font-bold text-lg tracking-wider text-emerald-400">
            <FiCheckSquare className="w-5 h-5" />
            PIVOTE
          </div>
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="text-slate-300 hover:text-white transition"
          >
            <FiMenu className="w-6 h-6" />
          </button>
        </div>

        <div className="p-4 md:p-10 max-w-7xl mx-auto min-w-0">{children}</div>
      </main>
    </div>
  );
}
