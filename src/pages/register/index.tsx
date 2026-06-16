import React, { useState, useEffect } from "react";
import { useRegister } from "../../api/auth";
import { toast } from "sonner";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { FiCheckSquare, FiEye, FiEyeOff } from "react-icons/fi";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  const registerMutation = useRegister();
  const navigate = useNavigate();

  const search = useSearch({ strict: false }) as {
    email?: string;
    program_id?: string;
    program_name?: string;
    workspace_id?: string;
    workspace_name?: string;
  };

  // pre-fill email if it came from the invite link
  useEffect(() => {
    if (search.email) {
      setEmail(search.email);
    }
  }, [search.email]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !password) {
      toast.error("All fields are required");
      return;
    }

    registerMutation.mutate(
      { name, email, password },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("Registration successful! Check your email for OTP.");
            navigate({
              to: "/verify",
              search: {
                email,
                ...(search.workspace_id &&
                  search.workspace_name && {
                    workspace_id: search.workspace_id,
                    workspace_name: search.workspace_name,
                  }),
                ...(search.program_id &&
                  search.program_name && {
                    program_id: search.program_id,
                    program_name: search.program_name,
                  }),
              },
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

  const isFromInvite = !!search.program_id;

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
          {isFromInvite ? "Join Program" : "Create Account"}
        </h1>

        {isFromInvite ? (
          <div className="text-center mb-8">
            <p className="text-slate-500 text-[13px] leading-relaxed">
              You've been invited to join{" "}
              <strong className="text-[#0d1e43]">{search.program_name}</strong>.
            </p>
            <p className="text-slate-400 text-xs mt-1">
              Create an account to accept the invitation
            </p>
          </div>
        ) : (
          <p className="text-slate-500 text-[13px] text-center max-w-[340px] leading-relaxed mb-8">
            Create a Pivote account to start participating and voting in your workspace programs
          </p>
        )}

        {/* Register Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-5">
          {/* Full Name field */}
          <div className="space-y-2">
            <label className="block text-[14px] font-semibold text-[#0d1e43] text-left">
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Enter your full name"
              className="w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl py-3.5 px-4 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none"
            />
          </div>

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
              readOnly={!!search.email}
              className={`w-full bg-[#f9fafb] border border-slate-200 focus:border-[#10b981] focus:ring-1 focus:ring-[#10b981] rounded-xl py-3.5 px-4 text-slate-800 text-sm placeholder-slate-300 transition duration-150 outline-none ${
                search.email ? "opacity-60 cursor-not-allowed" : ""
              }`}
            />
            {search.email && (
              <p className="text-[11px] text-slate-400">Email locked to your invitation address</p>
            )}
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
            disabled={registerMutation.isPending}
            className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-xl transition duration-150 flex items-center justify-center gap-2 mt-6 text-[15px]"
          >
            {registerMutation.isPending ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : isFromInvite ? (
              "Create Account & Join"
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6 text-sm text-slate-500">
          Already have an account?{" "}
          <Link
            to="/login"
            search={
              isFromInvite
                ? { program_id: search.program_id, program_name: search.program_name }
                : {}
            }
            className="text-[#10b981] hover:text-emerald-600 font-semibold hover:underline"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
