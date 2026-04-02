"use client";

import { useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Brain, Eye, EyeOff, CheckCircle, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Le mot de passe doit contenir au moins 8 caractères");
      return;
    }
    if (password !== confirm) {
      toast.error("Les mots de passe ne correspondent pas");
      return;
    }
    if (!token) {
      toast.error("Lien de réinitialisation invalide");
      return;
    }
    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      toast.success("Mot de passe réinitialisé !");
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail ?? "Le lien est invalide ou expiré";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }

  if (!token) {
    return (
      <div className="text-center py-8">
        <p className="text-slate-500 mb-4">Lien de réinitialisation invalide ou manquant.</p>
        <Link href="/forgot-password" className="btn-primary text-sm">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  return done ? (
    <div className="text-center py-4">
      <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
        <CheckCircle className="w-7 h-7 text-green-600" />
      </div>
      <h2 className="text-lg font-bold text-slate-900 mb-2">Mot de passe mis à jour !</h2>
      <p className="text-sm text-slate-500 mb-6">Tu peux maintenant te connecter avec ton nouveau mot de passe.</p>
      <Link href="/login" className="btn-primary text-sm inline-flex items-center gap-2">
        Se connecter <ArrowRight className="w-4 h-4" />
      </Link>
    </div>
  ) : (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">Nouveau mot de passe</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            required
            minLength={8}
            placeholder="Min. 8 caractères"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
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

      <div>
        <label className="block text-xs font-semibold text-slate-600 mb-2">Confirmer le mot de passe</label>
        <input
          type={showPassword ? "text" : "password"}
          required
          minLength={8}
          placeholder="Retape le mot de passe"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          className="input-glass"
        />
      </div>

      <Button type="submit" loading={loading} className="w-full justify-center py-3 text-sm">
        Réinitialiser le mot de passe
      </Button>
    </form>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 hero-bg">
      <div className="w-full max-w-md animate-slide-up">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Nouveau mot de passe</h1>
          <p className="text-slate-400 text-sm mt-1">Choisis un mot de passe sécurisé</p>
        </div>

        <div className="glass-intense rounded-2xl p-8 border border-blue-100 shadow-xl shadow-blue-100/50">
          <Suspense fallback={<div className="skeleton h-48 rounded-xl" />}>
            <ResetPasswordForm />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
