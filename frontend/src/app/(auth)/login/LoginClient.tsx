"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Eye, EyeOff, ArrowRight, Zap } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export function LoginClient() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const [form, setForm] = useState({ email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const { data } = await authApi.login(form);
      setAuth(data.user, data.access_token, data.refresh_token);
      toast.success(`Bienvenue ${data.user.username} ! 👋`);
      router.push("/challenges");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Identifiants incorrects";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 hero-bg">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200 animate-pulse-glow">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Content de te revoir</h1>
          <p className="text-slate-400 text-sm mt-1">Connecte-toi pour continuer ta progression</p>
        </div>

        {/* Form card */}
        <div className="glass-intense rounded-2xl p-8 border border-blue-100 shadow-xl shadow-blue-100/50">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-xs font-semibold text-slate-600 mb-2">Email</label>
              <input
                type="email"
                autoComplete="email"
                required
                placeholder="ton@email.com"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
                className="input-glass"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-600">Mot de passe</label>
                <Link href="/forgot-password" className="text-xs text-blue-600 hover:text-blue-800 font-medium">Mot de passe oublié ?</Link>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  placeholder="••••••••"
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="input-glass pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" loading={loading} className="w-full justify-center py-3 text-sm">
              Se connecter <ArrowRight className="w-4 h-4" />
            </Button>
          </form>

          <div className="mt-6 pt-5 border-t border-blue-50 text-center">
            <p className="text-sm text-slate-500">
              Pas encore de compte ?{" "}
              <Link href="/register" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                S&apos;inscrire gratuitement
              </Link>
            </p>
          </div>
        </div>

        {/* Social proof */}
        <div className="mt-5 flex items-center justify-center gap-2 text-xs text-slate-400">
          <Zap className="w-3.5 h-3.5 text-blue-400" />
          Rejoins des milliers de data scientists
        </div>
      </div>
    </div>
  );
}
