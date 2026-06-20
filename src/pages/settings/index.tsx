import React, { useState, useEffect } from "react";
import { useMe, useUpdateUser } from "../../api/auth";
import { toast } from "sonner";
import { FiUser, FiMail, FiSave } from "react-icons/fi";

export default function Settings() {
  const { data: user } = useMe();
  const updateUserMutation = useUpdateUser();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  useEffect(() => {
    if (user) {
      setName(user.name);
      setEmail(user.email);
    }
  }, [user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email) {
      toast.error("All fields are required");
      return;
    }

    if (!user) return;

    updateUserMutation.mutate(
      { id: user.id, name },
      {
        onSuccess: () => {
          toast.success("Profile updated successfully!");
        },
        onError: (err: any) => {
          const errMsg = err.response?.data?.message || err.message || "Failed to update profile";
          toast.error(errMsg);
        },
      }
    );
  };

  return (
    <div className="space-y-8 max-w-2xl">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold text-[#0d1e43] mb-1">Account Settings</h1>
        <p className="text-slate-500 text-sm">Manage your profile details and preferences.</p>
      </div>

      <div className="bg-white border border-slate-200/60 rounded-2xl p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Full Name</label>
            <div className="relative">
              <FiUser className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="John Doe"
                className="w-full bg-white border border-slate-200/70 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-4 text-[#0d1e43] placeholder-slate-400 transition outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
            <div className="relative">
              <FiMail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                readOnly
                placeholder="you@domain.com"
                className="opacity-60 cursor-not-allowed w-full bg-white border border-slate-200/70 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl py-3 pl-10 pr-4 text-[#0d1e43] placeholder-slate-400 transition outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={updateUserMutation.isPending}
            className="text-sm bg-emerald-500 hover:bg-emerald-600 disabled:bg-emerald-700 text-white font-semibold py-3 px-6 rounded-xl transition flex items-center gap-2 shadow-md shadow-emerald-500/10"
          >
            <FiSave className="w-5 h-5" />
            {updateUserMutation.isPending ? "Saving..." : "Save Changes"}
          </button>
        </form>
      </div>
    </div>
  );
}
