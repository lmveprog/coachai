"use client";

import { useState } from "react";
import Link from "next/link";
import { Brain, ArrowLeft, Mail, CheckCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import { Button } from "@/components/ui/Button";
import toast from "react-hot-toast";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await authApi.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error("Une erreur est survenue. Réessaie.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center px-4 py-10 hero-bg">
      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-xl shadow-blue-200">
            <Brain className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-black text-slate-900">Mot de passe oublié</h1>
          <p className="text-slate-400 text-sm mt-1">On va t&apos;envoyer un lien de réinitialisation</p>
        </div>

        <div className="glass-intense rounded-2xl p-8 border border-blue-100 shadow-xl shadow-blue-100/50">
          {sent ? (
            <div className="text-center py-4">
              <div className="w-14 h-14 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
                <CheckCircle className="w-7 h-7 text-green-600" />
              </div>
              <h2 className="text-lg font-bold text-slate-900 mb-2">Email envoyé !</h2>
              <p className="text-sm text-slate-500 leading-relaxed mb-6">
                Si un compte existe avec <strong className="text-slate-700">{email}</strong>, tu recevras un lien de réinitialisation. Vérifie tes spams.
              </p>
              <Link href="/login" className="btn-secondary text-sm inline-flex items-center gap-2">
                <ArrowLeft className="w-4 h-4" /> Retour à la connexion
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-2">
                  Adresse email
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <input
                    type="email"
                    autoComplete="email"
                    required
                    placeholder="ton@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="input-glass pl-10"
                  />
                </div>
              </div>

              <Button type="submit" loading={loading} className="w-full justify-center py-3 text-sm">
                Envoyer le lien de réinitialisation
              </Button>

              <div className="text-center pt-2">
                <Link href="/login" className="text-sm text-slate-500 hover:text-blue-600 transition-colors inline-flex items-center gap-1.5">
                  <ArrowLeft className="w-3.5 h-3.5" /> Retour à la connexion
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
