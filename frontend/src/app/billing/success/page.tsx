"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { CheckCircle, Zap, ArrowRight } from "lucide-react";
import { useAuthStore } from "@/store/auth";
import { authApi } from "@/lib/api";

export default function BillingSuccessPage() {
  const { setUser } = useAuthStore();
  const router = useRouter();

  // Refresh user so is_premium = true is reflected immediately
  useEffect(() => {
    authApi.me().then((r) => setUser(r.data)).catch(() => {});
  }, [setUser]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 hero-bg">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto shadow-xl shadow-green-100">
          <CheckCircle className="w-10 h-10 text-green-500" />
        </div>

        <div>
          <h1 className="text-3xl font-black text-slate-900 mb-3">
            Bienvenue dans CoachAI <span className="gradient-text">Pro</span> !
          </h1>
          <p className="text-slate-500 leading-relaxed">
            Ton abonnement est actif. Tu as maintenant accès à tous les challenges,
            toutes les formations et des soumissions illimitées.
          </p>
        </div>

        <div className="glass rounded-2xl p-6 border border-blue-100 text-left space-y-3">
          {[
            "100+ challenges (ML, Deep Learning, NLP, SQL…)",
            "5 parcours de formation complets",
            "Soumissions illimitées chaque jour",
            "Streak bonus ELO +20%",
            "Certifications vérifiables",
          ].map((f) => (
            <div key={f} className="flex items-center gap-3 text-sm text-slate-700">
              <Zap className="w-4 h-4 text-blue-500 flex-shrink-0" />
              {f}
            </div>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/challenges" className="btn-primary py-3 px-6 flex items-center gap-2 justify-center">
            Explorer les challenges <ArrowRight className="w-4 h-4" />
          </Link>
          <Link href="/learn" className="btn-secondary py-3 px-6 justify-center">
            Voir les formations
          </Link>
        </div>
      </div>
    </div>
  );
}
