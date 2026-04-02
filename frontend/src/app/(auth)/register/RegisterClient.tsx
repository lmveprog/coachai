"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Brain, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuthStore } from "@/store/auth";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

const PERKS = [
  "Commence avec 1000 ELO",
  "3 challenges par jour (SQL & Python)",
  "Formation SQL complète offerte",
  "Profil public & badges",
];

export function RegisterClient() {
  const router = useRouter();
  const { setAuth, setNewUser } = useAuthStore();
  const [form, setForm] = useState({ username: "", email: "", password: "", confirm: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [tosAccepted, setTosAccepted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.password !== form.confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (!tosAccepted) {
      toast.error("Tu dois accepter les CGU et la Politique de confidentialité pour continuer.");
      return;
    }
    setLoading(true);
    try {
      const { data } = await authApi.register({
        email: form.email,
        username: form.username,
        password: form.password,
      });
      setAuth(data.user, data.access_token, data.refresh_token);
      setNewUser();
      router.push("/challenges");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Erreur lors de l'inscription";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 hero-bg">
      <div className="w-full max-w-4xl animate-slide-up">
        <div className="grid md:grid-cols-[1fr_1.5fr] gap-6 items-center">
          {/* Left: value prop */}
          <div className="hidden md:block">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mb-6 shadow-xl shadow-blue-200">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h1 className="text-3xl font-black text-slate-900 mb-3 leading-tight">
              Lance-toi.<br />
              <span className="gradient-text">Gratuitement.</span>
            </h1>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">
              Résous des challenges réels, gagne de l&apos;ELO, débloque des formations.
              La plateforme data science la plus gamifiée du marché.
            </p>
            <ul className="space-y-3">
              {PERKS.map((p) => (
                <li key={p} className="flex items-center gap-3 text-sm text-slate-600">
                  <div className="w-5 h-5 rounded-full bg-green-100 border border-green-200 flex items-center justify-center flex-shrink-0">
                    <CheckCircle className="w-3 h-3 text-green-600" />
                  </div>
                  {p}
                </li>
              ))}
            </ul>
            <div className="mt-8 p-4 glass rounded-2xl border border-blue-100">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-orange-400 flex items-center justify-center text-sm font-bold text-white">👑</div>
                <div>
                  <p className="text-xs font-bold text-slate-900">Système ELO</p>
                  <p className="text-xs text-slate-400">Comme aux échecs</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">
                Tu commences à 1000 ELO. Chaque challenge résolu te rapporte entre +15 et +80 ELO.
                Rookie → Grand Master.
              </p>
            </div>
          </div>

          {/* Right: form */}
          <div>
            <div className="text-center mb-6 md:hidden">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-3 shadow-xl shadow-blue-200">
                <Brain className="w-7 h-7 text-white" />
              </div>
              <h1 className="text-xl font-black text-slate-900">Créer un compte</h1>
              <p className="text-slate-400 text-sm mt-1">Gratuit, aucune carte bancaire</p>
            </div>

            <div className="glass-intense rounded-2xl p-8 border border-blue-100 shadow-xl shadow-blue-100/50">
              <h2 className="hidden md:block text-lg font-black text-slate-900 mb-5">Créer ton compte gratuit</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-2">Nom d&apos;utilisateur</label>
                  <input
                    type="text"
                    autoComplete="username"
                    required
                    placeholder="data_wizard"
                    pattern="[a-zA-Z0-9_]{3,20}"
                    value={form.username}
                    onChange={(e) => setForm({ ...form, username: e.target.value })}
                    className="input-glass"
                  />
                  <p className="text-xs text-slate-400 mt-1">3-20 caractères — lettres, chiffres, underscore</p>
                </div>

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

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Mot de passe</label>
                    <div className="relative">
                      <input
                        type={showPassword ? "text" : "password"}
                        autoComplete="new-password"
                        required
                        minLength={8}
                        placeholder="8 car. minimum"
                        value={form.password}
                        onChange={(e) => setForm({ ...form, password: e.target.value })}
                        className="input-glass pr-9"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors">
                        {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-2">Confirmer</label>
                    <input
                      type="password"
                      autoComplete="new-password"
                      required
                      placeholder="••••••••"
                      value={form.confirm}
                      onChange={(e) => setForm({ ...form, confirm: e.target.value })}
                      className="input-glass"
                    />
                  </div>
                </div>

                {/* GDPR ToS checkbox — required */}
                <label className="flex items-start gap-2.5 cursor-pointer select-none mt-1">
                  <input
                    type="checkbox"
                    checked={tosAccepted}
                    onChange={(e) => setTosAccepted(e.target.checked)}
                    className="mt-0.5 w-4 h-4 rounded border-slate-300 text-blue-600 cursor-pointer"
                    required
                  />
                  <span className="text-xs text-slate-500 leading-relaxed">
                    J&apos;accepte les{" "}
                    <Link href="/terms" className="text-blue-600 hover:underline font-medium">CGU</Link>{" "}
                    et la{" "}
                    <Link href="/privacy" className="text-blue-600 hover:underline font-medium">Politique de confidentialité</Link>{" "}
                    de CoachAI.
                  </span>
                </label>

                <Button type="submit" loading={loading} disabled={!tosAccepted} className="w-full justify-center py-3 text-sm mt-2">
                  Créer mon compte gratuitement <ArrowRight className="w-4 h-4" />
                </Button>
              </form>

              <div className="mt-5 pt-4 border-t border-blue-50 text-center">
                <p className="text-sm text-slate-500">
                  Déjà un compte ?{" "}
                  <Link href="/login" className="text-blue-600 hover:text-blue-800 font-semibold transition-colors">
                    Se connecter
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
