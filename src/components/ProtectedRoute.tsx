import { type ReactNode, useEffect } from "react";
import { useNavigate } from "@tanstack/react-router";
import { useMe } from "../api/auth";

interface ProtectedRouteProps {
  children: ReactNode;
  /** Pass true for routes that only admins may visit */
  requireAdmin?: boolean;
}

export default function ProtectedRoute({ children, requireAdmin = false }: ProtectedRouteProps) {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");
  const { data: user, isLoading } = useMe();

  // 1. No token → send to login
  useEffect(() => {
    if (!token) {
      if (window.location.pathname.includes("admin")) {
        navigate({ to: "/admin/login" });
      } else {
        navigate({ to: "/login" });
      }
    }
  }, [token, navigate]);

  // 2. Role enforcement (runs once the user object is loaded)
  useEffect(() => {
    if (!token || isLoading || !user) return;

    const isAdmin = user.role === "admin";

    if (requireAdmin && !isAdmin) {
      // Regular user tried to visit an admin route → send to user dashboard
      navigate({ to: "/dashboard" });
    } else if (!requireAdmin && isAdmin) {
      // Admin tried to visit a user route → send to admin dashboard
      navigate({ to: "/admin/dashboard" });
    }
  }, [token, isLoading, user, requireAdmin, navigate]);

  // Show spinner while token is present but user is still loading
  if (!token || isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center text-slate-300">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-emerald-500"></div>
      </div>
    );
  }

  // Block render until role check resolves
  if (!user) return null;

  const isAdmin = user.role === "admin";
  if (requireAdmin && !isAdmin) return null;
  if (!requireAdmin && isAdmin) return null;

  return <>{children}</>;
}
