"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { X, Zap, BookOpen, Trophy, ArrowRight, Database, Bot } from "lucide-react";
import { useAuthStore } from "@/store/auth";

const STEPS = [
  {
    icon: Database,
    color: "bg-blue-50 text-blue-600 border-blue-100",
    title: "Ton premier challenge SQL",
    desc: "Commence par un challenge débutant pour gagner tes premiers ELO. Résolu en moins de 5 minutes.",
    cta: "Voir les challenges SQL",
    href: "/challenges?category=sql",
  },
  {
    icon: BookOpen,
    color: "bg-purple-50 text-purple-600 border-purple-100",
    title: "Explore les formations",
    desc: "Des cours structurés directement liés aux challenges. Théorie + pratique dans le même endroit.",
    cta: "Voir les formations",
    href: "/learn",
  },
  {
    icon: Trophy,
    color: "bg-amber-50 text-amber-600 border-amber-100",
    title: "Rejoins le classement",
    desc: "Tu commences à 1000 ELO. Vois où tu te situes par rapport à la communauté.",
    cta: "Voir le classement",
    href: "/leaderboard",
  },
  {
    icon: Bot,
    color: "bg-green-50 text-green-600 border-green-100",
    title: "Utilise CoachAI Assistant",
    desc: "Le chatbot en bas à droite peut t'aider sur n'importe quel challenge ou concept data.",
    cta: null,
    href: null,
  },
];

export function OnboardingModal() {
  const { user, isNewUser, clearNewUser } = useAuthStore();
  const router = useRouter();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isNewUser && user) {
      setVisible(true);
    }
  }, [isNewUser, user]);

  function close() {
    setVisible(false);
    clearNewUser();
  }

  function goTo(href: string) {
    close();
    router.push(href);
  }

  if (!visible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4" style={{ background: "rgba(15,23,42,0.6)", backdropFilter: "blur(8px)" }}>
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-blue-100 overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="relative p-8 pb-6" style={{ background: "linear-gradient(135deg, #1d4ed8, #2563eb)" }}>
          <button onClick={close} aria-label="Fermer" className="absolute top-4 right-4 w-8 h-8 rounded-xl bg-white/20 hover:bg-white/30 flex items-center justify-center text-white transition-colors">
            <X className="w-4 h-4" />
          </button>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-white/20 flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <div>
              <p className="text-blue-200 text-xs font-semibold uppercase tracking-wider">Bienvenue !</p>
              <h2 className="text-xl font-black text-white">Salut {user?.username} 👋</h2>
            </div>
          </div>
          <p className="text-blue-100 text-sm leading-relaxed">
            Tu commences avec <strong className="text-white">1000 ELO</strong>. Voici les premières étapes pour bien démarrer sur CoachAI.
          </p>
        </div>

        {/* Steps */}
        <div className="p-6 space-y-3">
          {STEPS.map((step, i) => (
            <div key={i} className={`flex items-start gap-3 p-4 rounded-2xl border ${step.color.split(" ")[2]} bg-gradient-to-r from-white`}>
              <div className={`w-9 h-9 rounded-xl border flex items-center justify-center flex-shrink-0 ${step.color}`}>
                <step.icon className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-slate-900 text-sm">{step.title}</p>
                <p className="text-slate-500 text-xs leading-relaxed mt-0.5">{step.desc}</p>
              </div>
              {step.href && (
                <button onClick={() => goTo(step.href!)}
                  className="text-xs font-semibold text-blue-600 hover:text-blue-700 whitespace-nowrap flex items-center gap-1 mt-0.5">
                  <ArrowRight className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="px-6 pb-6 flex gap-3">
          <button onClick={() => goTo("/challenges")} className="flex-1 btn-primary py-3 justify-center text-sm">
            Commencer les challenges <ArrowRight className="w-4 h-4" />
          </button>
          <button onClick={close} className="btn-secondary py-3 px-4 text-sm">
            Plus tard
          </button>
        </div>
      </div>
    </div>
  );
}
