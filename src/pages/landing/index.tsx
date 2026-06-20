import { Link } from "@tanstack/react-router";
import { FiCheckSquare, FiArrowRight, FiShield, FiZap, FiActivity } from "react-icons/fi";

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Navigation Header */}
      <header className="border-b border-slate-200/60 bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link
            to="/"
            className="flex items-center gap-2 font-bold text-xl tracking-wider text-[#0d1e43]"
          >
            <FiCheckSquare className="w-6 h-6 text-amber-500" />
            <span>PIVOTE</span>
          </Link>
          <div className="flex items-center gap-4">
            <Link
              to="/admin/register"
              className="bg-[#0d1e43] hover:bg-slate-900 text-white font-semibold px-4 py-2 rounded-sm text-sm transition shadow-sm"
            >
              Create a Program
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center py-20 px-6 max-w-5xl mx-auto text-center space-y-12">
        <div className="space-y-6">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-[#10b981] rounded-full text-xs font-semibold tracking-wide border border-emerald-100/50">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            Modern Voting System
          </div>
          <h1 className="text-5xl md:text-6xl font-extrabold text-[#0d1e43] tracking-tight max-w-3xl mx-auto leading-tight">
            Secure, simple, and <span className="text-emerald-500">real-time</span> elections.
          </h1>
          <p className="text-slate-500 text-base md:text-lg max-w-2xl mx-auto leading-relaxed">
            Pivote makes hosting and participating in elections effortless. Designed specifically
            for workspaces, student governments, and modern organizations.
          </p>
        </div>

        {/* Call to Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            to="/admin/register"
            className="w-full sm:w-auto bg-[#10b981] hover:bg-emerald-600 text-white font-bold px-8 py-4 rounded-xl shadow-md shadow-emerald-500/10 transition flex items-center justify-center gap-2 group text-base"
          >
            Create a Program
            <FiArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </Link>
          <Link
            to="/login"
            className="w-full sm:w-auto border border-slate-300 bg-white hover:bg-slate-50 text-[#0d1e43] font-semibold px-8 py-4 rounded-xl transition text-base text-center"
          >
            Vote in a Program
          </Link>
        </div>

        {/* Intent Fork + Feature Grid */}
        <div className="flex flex-col items-center gap-8 pt-16">
          {/* Intent Fork */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 w-full">
            <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <FiCheckSquare className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0d1e43] tracking-tight">
                Hosting an election?
              </h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Create a workspace and launch your program in minutes.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200/50 shadow-sm text-left space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <FiArrowRight className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-[#0d1e43] tracking-tight">Joining one?</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Use the link or code your organizer shared with you.
              </p>
            </div>
          </div>

          {/* Feature Grid heading */}
          <div className="flex flex-col items-center gap-3 max-w-xl mx-auto text-center pt-16">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-navy-50 text-[#0d1e43] rounded-full text-xs font-semibold tracking-wide">
              Why Pivote
            </div>
            <h2 className="text-2xl md:text-3xl font-bold text-[#0d1e43] tracking-tight">
              Built for trust, speed, and visibility
            </h2>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white p-8 rounded-2xl border border-slate-200/50 shadow-sm text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-500 flex items-center justify-center">
                <FiShield className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0d1e43]">Secure & Verified</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Every participant goes through verification, ensuring one secure vote per person
                with no double voting.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/50 shadow-sm text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-500 flex items-center justify-center">
                <FiZap className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0d1e43]">Minute Setup</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Administrators can register, verify, create a workspace, and launch a voting program
                in under 5 minutes.
              </p>
            </div>

            <div className="bg-white p-8 rounded-2xl border border-slate-200/50 shadow-sm text-left space-y-4">
              <div className="w-12 h-12 rounded-xl bg-navy-50 text-[#0d1e43] flex items-center justify-center">
                <FiActivity className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-[#0d1e43]">Real-time Tracking</h3>
              <p className="text-slate-500 text-sm leading-relaxed">
                Elections are live tracked with dynamic real-time progress indicators, countdown
                timers, and final summaries.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200/60 bg-white py-8 text-center">
        <div className="max-w-7xl mx-auto px-6 flex flex-col items-center gap-3">
          <Link
            to="/admin/login"
            className="text-sm font-medium text-slate-500 hover:text-[#0d1e43] transition"
          >
            Already hosting? Log in
          </Link>
          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} Pivote Online Voting. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
