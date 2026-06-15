import React, { useState } from "react";
import { useAdminRegister } from "../../../api/auth";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import { FiCheckSquare, FiEye, FiEyeOff, FiUser, FiMail, FiLock } from "react-icons/fi";

export default function AdminRegister() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const adminRegisterMutation = useAdminRegister();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    if (password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    adminRegisterMutation.mutate(
      { name, email, password },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("Admin registered successfully! Check your email for OTP.");
            navigate({
              to: "/admin/verify",
              search: { email },
            });
          } else {
            toast.error(data.message || "Registration failed");
          }
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.message || err.message || "An error occurred";
          toast.error(errMsg);
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
        {/* Progress Steps */}
        <div className="w-full flex items-center gap-2 mb-6">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-[#0d1e43] flex items-center justify-center text-white text-xs font-bold">
              1
            </div>
            <span className="text-xs font-semibold text-[#0d1e43]">Register</span>
          </div>
          <div className="flex-1 h-px bg-slate-200" />
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-full bg-slate-200 flex items-center justify-center text-slate-400 text-xs font-bold">
              2
            </div>
            <span className="text-xs font-medium text-slate-400">Verify Email</span>
          </div>
        </div>

        <h1 className="text-3xl font-extrabold text-[#0d1e43] mb-2 tracking-tight text-center">
          Create Admin Account
        </h1>
        <p className="text-slate-500 text-[13px] text-center max-w-[340px] leading-relaxed mb-8">
          Register as an administrator to create your workspace and launch voting programs.
        </p>

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Full Name field */}
          <div className="space-y-2">
            <label className="block text-[14px] font-semibold text-[#0d1e43] text-left">
              Full Name
            </label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter your full name"
                className="w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl py-3 pl-10 pr-4 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none"
              />
            </div>
          </div>

          {/* Email field */}
          <div className="space-y-2">
            <label className="block text-[14px] font-semibold text-[#0d1e43] text-left">
              Email Address
            </label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email address"
                className="w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl py-3 pl-10 pr-4 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none"
              />
            </div>
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label className="block text-[14px] font-semibold text-[#0d1e43] text-left">
              Password
            </label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl py-3 pl-10 pr-10 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none"
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
            disabled={adminRegisterMutation.isPending}
            className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 mt-6 text-[15px]"
          >
            {adminRegisterMutation.isPending ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              "Create Admin Account"
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6 text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/admin/login"
            className="text-[#10b981] hover:text-emerald-600 font-semibold hover:underline"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
