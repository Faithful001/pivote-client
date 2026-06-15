import React, { useState } from "react";
import { useForgotPassword } from "../../api/auth";
import { toast } from "sonner";
import { Link, useNavigate } from "@tanstack/react-router";
import { FiCheckSquare } from "react-icons/fi";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const forgotPasswordMutation = useForgotPassword();
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    forgotPasswordMutation.mutate(
      { email },
      {
        onSuccess: (data) => {
          if (data.success) {
            toast.success("Verification code sent to your email!");
            navigate({
              to: "/reset-password",
              search: { email },
            });
          } else {
            toast.error(data.message || "Failed to send reset code");
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
          Forgot Password
        </h1>
        <p className="text-slate-500 text-[13px] text-center max-w-[340px] leading-relaxed mb-8">
          Enter your email address to receive a 4-digit verification code to reset your password
        </p>

        {/* Form */}
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

          {/* Submit button */}
          <button
            type="submit"
            disabled={forgotPasswordMutation.isPending}
            className="w-full bg-[#10b981] hover:bg-emerald-600 text-white font-bold py-3.5 px-4 rounded-md transition duration-150 flex items-center justify-center gap-2 mt-6 text-[15px]"
          >
            {forgotPasswordMutation.isPending ? (
              <span className="inline-block w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            ) : (
              "Send Reset Code"
            )}
          </button>
        </form>

        {/* Back Link */}
        <div className="text-center mt-6 text-sm text-slate-500">
          Remember your password?{" "}
          <Link to="/login" className="text-[#10b981] hover:text-emerald-600 font-semibold hover:underline">
            Back to login
          </Link>
        </div>
      </div>
    </div>
  );
}
