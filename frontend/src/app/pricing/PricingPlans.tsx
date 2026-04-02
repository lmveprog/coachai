"use client";

import { useState } from "react";
import Link from "next/link";
import { CheckCircle, X, Lock } from "lucide-react";
import { CheckoutButton } from "@/components/billing/CheckoutButton";
import { cn } from "@/lib/utils";

const PLANS = [
  {
    name: "Gratuit",
    badge: null,
    monthlyPrice: "0€",
    annualPrice: "0€",
    period: "pour toujours",
    annualPeriod: "pour toujours",
    desc: "Pour découvrir la plateforme et commencer à progresser.",
    highlight: false,
    features: [
      { text: "3 challenges/jour (SQL & Python)", ok: true },
      { text: "1 formation complète (SQL)", ok: true },
      { text: "Classement global", ok: true },
      { text: "Profil public vérifiable", ok: true },
      { text: "Badges de base", ok: true },
      { text: "Challenges ML & Deep Learning (Pro)", ok: false },
      { text: "Toutes les formations (Pro)", ok: false },
      { text: "Certifications vérifiables", ok: false },
      { text: "Streak bonus ELO", ok: false },
      { text: "Support prioritaire", ok: false },
    ],
    cta: "Commencer gratuitement",
    href: "/register",
    ctaStyle: "btn-secondary w-full justify-center py-3 text-sm",
    isCheckout: false,
  },
  {
    name: "Pro",
    badge: "Le plus populaire",
    monthlyPrice: "15€",
    annualPrice: "10€",
    period: "/mois",
    annualPeriod: "/mois, facturé annuellement",
    annualSavings: "2 mois offerts",
    desc: "Pour les data scientists qui veulent progresser vite et sérieusement.",
    highlight: true,
    features: [
      { text: "Tous les challenges (100+)", ok: true },
      { text: "Toutes les formations (5 parcours)", ok: true },
      { text: "Classements par catégorie & période", ok: true },
      { text: "Profil public vérifiable", ok: true },
      { text: "Tous les badges & récompenses", ok: true },
      { text: "Challenges ML & Deep Learning", ok: true },
      { text: "Certifications vérifiables", ok: true },
      { text: "Streak bonus ELO (+20%)", ok: true },
      { text: "Support prioritaire", ok: true },
      { text: "Accès anticipé aux nouvelles features", ok: true },
    ],
    cta: "Essayer 7 jours gratuits",
    href: "/register?plan=pro",
    ctaStyle: "w-full justify-center py-3 text-sm font-bold text-center rounded-xl bg-white text-blue-700 hover:bg-blue-50 transition-all shadow-lg",
    isCheckout: true,
  },
  {
    name: "Équipe",
    badge: null,
    monthlyPrice: "Sur devis",
    annualPrice: "Sur devis",
    period: "",
    annualPeriod: "",
    desc: "Pour les équipes data qui veulent monter en compétences ensemble.",
    highlight: false,
    features: [
      { text: "Tout le plan Pro inclus", ok: true },
      { text: "Dashboard équipe & analytics", ok: true },
      { text: "Challenges personnalisés", ok: true },
      { text: "Intégration RH / ATS", ok: true },
      { text: "Formation on-boarding sur mesure", ok: true },
      { text: "SLA garanti & support dédié", ok: true },
      { text: "Facturation centralisée", ok: true },
      { text: "Accès API", ok: true },
      { text: "SSO / SAML", ok: true },
      { text: "Audit & rapports de compétences", ok: true },
    ],
    cta: "Contacter l'équipe commerciale",
    href: "mailto:sales@coachai.dev",
    ctaStyle: "btn-secondary w-full justify-center py-3 text-sm",
    isCheckout: false,
  },
];

export function PricingPlans() {
  const [annual, setAnnual] = useState(false);

  return (
    <section className="max-w-6xl mx-auto px-4 py-14">
      {/* Toggle */}
      <div className="flex items-center justify-center gap-3 mb-10">
        <span className={cn("text-sm font-semibold", !annual ? "text-slate-900" : "text-slate-400")}>Mensuel</span>
        <button
          onClick={() => setAnnual(!annual)}
          className={cn(
            "relative w-14 h-7 rounded-full transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500",
            annual ? "bg-blue-600" : "bg-slate-200"
          )}
          aria-label="Basculer facturation annuelle"
        >
          <span className={cn(
            "absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform",
            annual ? "translate-x-7" : "translate-x-0"
          )} />
        </button>
        <span className={cn("text-sm font-semibold", annual ? "text-slate-900" : "text-slate-400")}>
          Annuel
        </span>
        {annual && (
          <span className="text-xs font-bold text-green-700 bg-green-100 border border-green-200 px-2.5 py-1 rounded-full">
            2 mois offerts
          </span>
        )}
      </div>

      <div className="grid md:grid-cols-3 gap-6 items-start">
        {PLANS.map((plan) => {
          const price = annual ? plan.annualPrice : plan.monthlyPrice;
          const period = annual ? plan.annualPeriod : plan.period;
          return (
            <div
              key={plan.name}
              className={`rounded-2xl p-8 flex flex-col gap-6 relative ${
                plan.highlight
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-200 border border-blue-500"
                  : "glass border border-blue-100"
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-5 py-1.5 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold shadow-lg whitespace-nowrap">
                  {plan.badge}
                </div>
              )}

              <div>
                <p className={`text-xs font-bold uppercase tracking-widest mb-2 ${plan.highlight ? "text-blue-200" : "text-slate-400"}`}>{plan.name}</p>
                <div className="flex items-end gap-1 mb-1">
                  <span className={`text-4xl font-black ${plan.highlight ? "text-white" : "gradient-text"}`}>{price}</span>
                  {period && <span className={`text-sm pb-1 ${plan.highlight ? "text-blue-200" : "text-slate-400"}`}>{period}</span>}
                </div>
                {annual && plan.name === "Pro" && (
                  <p className={`text-xs font-semibold mb-1 ${plan.highlight ? "text-blue-200" : "text-green-600"}`}>
                    120€/an — économise 60€
                  </p>
                )}
                <p className={`text-sm leading-relaxed ${plan.highlight ? "text-blue-100" : "text-slate-500"}`}>{plan.desc}</p>
              </div>

              <ul className="space-y-2.5 flex-1">
                {plan.features.map((f) => (
                  <li key={f.text} className="flex items-start gap-2.5 text-sm">
                    {f.ok
                      ? <CheckCircle className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-blue-200" : "text-green-500"}`} />
                      : <X className={`w-4 h-4 flex-shrink-0 mt-0.5 ${plan.highlight ? "text-blue-400/40" : "text-slate-300"}`} />
                    }
                    <span className={f.ok ? (plan.highlight ? "text-blue-100" : "text-slate-700") : (plan.highlight ? "text-blue-300/50" : "text-slate-400")}>
                      {f.text}
                    </span>
                  </li>
                ))}
              </ul>

              {plan.isCheckout ? (
                <CheckoutButton className={plan.ctaStyle}>
                  {plan.cta}
                </CheckoutButton>
              ) : plan.href.startsWith("mailto:") ? (
                <a href={plan.href} className={plan.ctaStyle}>{plan.cta}</a>
              ) : (
                <Link href={plan.href} className={plan.ctaStyle}>{plan.cta}</Link>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-slate-400 mt-6 flex items-center justify-center gap-2">
        <Lock className="w-3.5 h-3.5" />
        Paiement sécurisé SSL · Annulation à tout moment · TVA française incluse
      </p>
    </section>
  );
}
