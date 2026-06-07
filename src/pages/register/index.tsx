import React, { useState, useEffect } from "react";
import { useRegister } from "../../api/auth";
import { toast } from "sonner";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { FiUser, FiMail, FiLock, FiCheckSquare } from "react-icons/fi";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const registerMutation = useRegister();
  const navigate = useNavigate();

  // read program context from query params (set by register_to_join email link)
  const search = useSearch({ strict: false }) as {
    email?: string;
    program_id?: string;
    program_name?: string;
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

            // if user came from a program invite, auto-request join after verifying
            // we pass program context through to the verify page
            navigate({
              to: "/verify",
              search: {
                email,
                ...(search.program_id && {
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
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden">
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="w-full max-w-md bg-slate-900/60 backdrop-blur-xl border border-slate-800 p-8 rounded-2xl shadow-2xl relative">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent mb-2">
            <FiCheckSquare className="text-emerald-400 w-8 h-8" />
            PIVOTE
          </div>

          {isFromInvite ? (
            <>
              <p className="text-slate-100 font-semibold text-base mt-1">
                You've been invited to join
              </p>
              <p className="text-emerald-400 font-bold text-sm">{search.program_name}</p>
              <p className="text-slate-400 text-sm mt-1">
                Create an account to accept the invitation
              </p>
            </>
          ) : (
            <p className="text-slate-400 text-sm">Create an account to start voting</p>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-600 transition outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@domain.com"
                // lock email if it came from invite link
                readOnly={!!search.email}
                className={`w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-600 transition outline-none ${
                  search.email ? "opacity-60 cursor-not-allowed" : ""
                }`}
              />
            </div>
            {search.email && (
              <p className="text-xs text-slate-500 mt-1">Email locked to your invitation address</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Password</label>
            <div className="relative">
              <FiLock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-4 text-slate-100 placeholder-slate-600 transition outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={registerMutation.isPending}
            className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 disabled:cursor-not-allowed text-slate-950 font-semibold py-3 px-4 rounded-xl transition shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2"
          >
            {registerMutation.isPending
              ? "Registering..."
              : isFromInvite
                ? "Create Account & Join"
                : "Register"}
          </button>
        </form>

        <div className="text-center mt-6 text-sm text-slate-400">
          Already have an account?{" "}
          <Link
            to="/login"
            search={
              isFromInvite
                ? { program_id: search.program_id, program_name: search.program_name }
                : {}
            }
            className="text-emerald-400 hover:underline"
          >
            Sign in here
          </Link>
        </div>
      </div>
    </div>
  );
}
