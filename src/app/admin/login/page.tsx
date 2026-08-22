"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Lock, Mail, Eye, EyeOff, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const res = await fetch("/api/admin/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Invalid credentials. Please verify email and password.");
      }

      router.push("/admin");
      router.refresh();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Authentication failed.";
      setErrorMsg(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[85vh] bg-slate-100 flex flex-col justify-center items-center px-4 sm:px-6 pt-28 sm:pt-32 pb-16">
      <div className="w-full max-w-md">

        {/* Header inside container */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-1.5 bg-[#051448]/10 text-[#051448] text-xs font-bold px-3 py-1 rounded-full mb-2">
            <ShieldCheck size={14} />
            <span>Secure Admin Gateway</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#051448] tracking-tight">Admin Sign In</h1>
          <p className="text-black/70 text-xs mt-1">
            Access LabelCropOnline administrative tools &amp; customer inquiries
          </p>
        </div>

        {/* Login Box */}
        <div className="bg-white border border-[#051448]/20 rounded-md p-6 sm:p-8 shadow-sm">
          {errorMsg && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 text-xs rounded-md flex items-start gap-2 animate-in fade-in">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{errorMsg}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1">
                Admin Email
              </label>
              <div className="relative flex items-center">
                <Mail size={16} className="absolute left-3 text-black/40 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  required
                  placeholder="admin@labelcroponline.com"
                  className="w-full border border-[#051448]/30 rounded pl-9 pr-3 py-2 text-sm text-black placeholder:text-black/40 focus:outline-hidden focus:border-[#051448] transition-all bg-white"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-xs font-bold text-black uppercase tracking-wide mb-1">
                Password
              </label>
              <div className="relative flex items-center">
                <Lock size={16} className="absolute left-3 text-black/40 pointer-events-none" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errorMsg) setErrorMsg(null);
                  }}
                  required
                  placeholder="••••••••••••"
                  className="w-full border border-[#051448]/30 rounded pl-9 pr-9 py-2 text-sm text-black placeholder:text-black/40 focus:outline-hidden focus:border-[#051448] transition-all bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 text-black/40 hover:text-black transition-colors cursor-pointer"
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 bg-[#051448] hover:bg-[#071a5e] text-white text-sm font-bold py-2.5 px-4 rounded transition-colors flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Verifying...</span>
                </>
              ) : (
                <>
                  <Lock size={15} />
                  <span>Sign In</span>
                </>
              )}
            </button>
          </form>

          <div className="mt-5 pt-4 border-t border-slate-100 text-center">
            <Link
              href="/"
              className="text-xs text-black/60 hover:text-[#051448] font-semibold transition-colors"
            >
              ← Back to Home
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
