import React, { useState } from "react";
import { useLogin } from "../../api/auth";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import { FiCheckSquare, FiEye, FiEyeOff } from "react-icons/fi";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const loginMutation = useLogin();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    loginMutation.mutate(
      { email, password },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("Logged in successfully!");
            navigate({ to: "/dashboard" });
          } else {
            toast.error(data.message || "Login failed");
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
    <div className="min-h-screen bg-white text-slate-800 flex items-center justify-center p-6">
      <div className="w-full max-w-[460px] flex flex-col items-center">
        {/* Top Logo Icon */}
        <div className="mb-4 flex items-center gap-2">
          <FiCheckSquare className="w-10 h-10 text-amber-500" />
          <p className="text-2xl font-bold">PIVOTE</p>
        </div>

        {/* Header Text */}
        <h1 className="text-3xl font-extrabold text-[#0d1e43] mb-2 tracking-tight text-center">
          Welcome Back!
        </h1>
        <p className="text-slate-500 text-[13px] text-center max-w-[340px] leading-relaxed mb-8">
          Welcome back to Pivote Online Voting system, please log into vote your preferred
          candidates
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
              className="w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-md py-3.5 px-4 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none"
            />
          </div>

          {/* Password field */}
          <div className="space-y-2">
            <label className="block text-[14px] font-semibold text-[#0d1e43] text-left">
              Password
            </label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••"
                className="w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-md py-3.5 pl-4 pr-10 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none"
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

          {/* Forgot Password Link */}
          <div className="flex justify-end pt-1">
            <Link
              to="/forgot-password"
              className="text-[#10b981] hover:text-emerald-600 text-xs font-semibold hover:underline"
            >
              Forgot Password
            </Link>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={loginMutation.isPending}
            className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-md transition duration-150 flex items-center justify-center gap-2 mt-6 text-[15px]"
          >
            {loginMutation.isPending ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              "Log In"
            )}
          </button>
        </form>

        {/* Bottom Actions */}
        <div className="text-center mt-6 text-sm text-slate-500 space-y-2">
          <div>
            I don't have an account |{" "}
            <Link
              to="/register"
              className="text-[#10b981] hover:text-emerald-600 font-semibold hover:underline"
            >
              Create Account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
