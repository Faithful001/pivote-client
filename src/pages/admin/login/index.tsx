import React, { useState } from "react";
import { useAdminLogin } from "../../../api/auth";
import { toast } from "sonner";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { FiCheckSquare, FiEye, FiEyeOff } from "react-icons/fi";
import { useSendOtp } from "../../../api/otp";

export default function AdminLogin() {
  const search = useSearch({ strict: false }) as Record<string, string>;
  const [email, setEmail] = useState(search?.email || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useAdminLogin();
  const sendOtpMutation = useSendOtp();
  const navigate = useNavigate();

  const handleResendOtp = () => {
    if (!email) {
      toast.error("Email address is required to resend OTP");
      return;
    }

    sendOtpMutation.mutate(
      { email, purpose: "verify_account" },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("OTP resent! Check your email.");
          } else {
            toast.error(data.message || "Failed to resend OTP");
          }
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.message || err.message || "An error occurred";
          toast.error(errMsg);
        },
      }
    );
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: async (data) => {
          if (data.success) {
            const role = data.data?.user?.role;
            if (role !== "admin") {
              toast.error("Access denied. Admin credentials required.");
              localStorage.removeItem("token");
              return;
            }

            toast.success("Welcome back, Admin!");

            // Check if this admin already has a workspace
            // We use the token that was just set by the useLogin mutation
            try {
              const { apiClient } = await import("../../../api/client");
              const res = await apiClient.get<{ data: any[] }>("/workspaces");
              const workspaces = res.data?.data || [];
              if (workspaces.length === 0) {
                navigate({ to: "/admin/create-workspace" });
              } else {
                // Cache the workspace locally
                const ws = workspaces[0];
                localStorage.setItem("workspace_id", ws.id);
                localStorage.setItem("workspace", JSON.stringify(ws));
                navigate({ to: "/admin/dashboard" });
              }
            } catch {
              // If workspace check fails, just go to dashboard (AdminLayout will handle redirect)
              navigate({ to: "/admin/dashboard" });
            }
          } else {
            toast.error(data.message || "Login failed");
          }
        },
        onError: (err: any) => {
          const error = err.response?.data?.message || err.message;
          const errMsg = error || "An error occurred";
          toast.error(errMsg);
          if (error === "user not verified") {
            handleResendOtp();
            navigate({ to: "/admin/verify", search: { email: email } });
          }
        },
      }
    );
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex items-center justify-center p-6">
      {/* Fixed top-left logo */}
      <div className="fixed top-0 left-0 p-5 z-50 flex items-center gap-2">
        <Link to="/" className="fixed top-0 left-0 p-5 z-50 flex items-center gap-2">
          <FiCheckSquare className="w-6 h-6 text-amber-500" />
          <span className="text-lg font-bold text-[#0d1e43] tracking-wide">PIVOTE</span>
        </Link>
      </div>

      <div className="w-full max-w-[500px] bg-white rounded-2xl border border-slate-200/60 p-8 flex flex-col items-center">
        {/* Header Text */}
        <h1 className="text-3xl font-extrabold text-[#0d1e43] mb-2 tracking-tight text-center">
          Admin Portal
        </h1>
        <p className="text-slate-500 text-[13px] text-center max-w-[340px] leading-relaxed mb-8">
          Sign in to manage your workspace, programs, and elections.
        </p>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Email field */}
          <div className="space-y-2">
            <label className="block text-[14px] font-semibold text-[#0d1e43] text-left">
              Email Address
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email address"
              className="w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl py-3.5 px-4 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none"
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="block text-[14px] font-semibold text-[#0d1e43] text-left">
                Password
              </label>
              <Link
                to="/admin/forgot-password"
                className="text-[#10b981] hover:text-emerald-600 text-xs font-semibold hover:underline"
              >
                Forgot Password?
              </Link>
            </div>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl py-3.5 pl-4 pr-10 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none flex items-center justify-center"
              >
                {showPassword ? <FiEyeOff className="w-5 h-5" /> : <FiEye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 mt-4 text-[15px]"
          >
            {loginMutation.isPending ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              "Sign In"
            )}
          </button>
        </form>

        {/* Divider */}
        <div className="w-full flex items-center gap-3 my-6">
          <div className="flex-1 h-px bg-slate-100" />
          <span className="text-xs text-slate-400 font-medium">or</span>
          <div className="flex-1 h-px bg-slate-100" />
        </div>

        {/* Register Link */}
        <div className="text-center text-sm text-slate-500">
          Don't have an account?{" "}
          <Link
            to="/admin/register"
            className="text-[#10b981] hover:text-emerald-600 font-semibold hover:underline"
          >
            Get Started
          </Link>
        </div>
      </div>
    </div>
  );
}
