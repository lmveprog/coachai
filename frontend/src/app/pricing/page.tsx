import type { Metadata } from "next";
import Link from "next/link";
import { Zap, Shield, Lock, Star, Award, Users, Building2 } from "lucide-react";
import { PricingPlans } from "./PricingPlans";

export const metadata: Metadata = {
  title: "Tarifs — CoachAI",
  description: "Plans CoachAI. Gratuit pour toujours ou Pro à 15€/mois. Formations, challenges illimités, certifications.",
};


const FAQ = [
  {
    q: "Est-ce que le plan gratuit est vraiment gratuit ?",
    a: "Oui, sans limite de temps et sans carte bancaire. Tu accèdes à 3 challenges par jour et une formation complète, pour toujours.",
  },
  {
    q: "Comment fonctionne l'essai gratuit Pro ?",
    a: "7 jours complets sans engagement. Tu peux annuler à tout moment avant la fin de la période d'essai, sans être débité.",
  },
  {
    q: "Puis-je annuler mon abonnement Pro à tout moment ?",
    a: "Oui, résiliation immédiate depuis ton profil. Tu gardes l'accès Pro jusqu'à la fin de la période payée.",
  },
  {
    q: "Y a-t-il une réduction annuelle ?",
    a: "Oui — bascule le toggle Annuel sur la page Tarifs pour voir le prix à 10€/mois (120€/an au lieu de 180€/an, soit 2 mois offerts).",
  },
  {
    q: "Comment fonctionnent les certifications ?",
    a: "Chaque certification est un badge numérique vérifiable (Open Badge) lié à ton profil public CoachAI, partageable sur LinkedIn.",
  },
  {
    q: "Vous avez une offre étudiante ?",
    a: "Oui — 50% de réduction avec une adresse email universitaire. Envoie un email à students@coachai.dev.",
  },
];

const FEATURES_COMPARE = [
  { label: "Challenges disponibles", free: "3/jour", pro: "Illimités (100+)", team: "Illimités + custom" },
  { label: "Formations", free: "1", pro: "5 parcours", team: "5 + custom" },
  { label: "ELO & classement", free: "Global", pro: "Global + catégories", team: "Global + équipe" },
  { label: "Badges & certifications", free: "Basiques", pro: "Tous", team: "Tous + custom" },
  { label: "Streak bonus ELO", free: "✗", pro: "+20%", team: "+20%" },
  { label: "Support", free: "Communauté", pro: "Prioritaire", team: "Dédié + SLA" },
  { label: "Dashboard équipe", free: "✗", pro: "✗", team: "✓" },
  { label: "API Access", free: "✗", pro: "✗", team: "✓" },
];

export default function PricingPage() {
  return (
    <div className="overflow-x-hidden">
      {/* Header */}
      <section className="pt-16 pb-8 px-4 text-center hero-bg">
        <div className="max-w-3xl mx-auto">
          <span className="section-label mb-4">Tarifs</span>
          <h1 className="text-4xl sm:text-5xl font-black text-slate-900 mt-5 mb-4">
            Simple, transparent,{" "}
            <span className="gradient-text">abordable</span>
          </h1>
          <p className="text-lg text-slate-500 max-w-xl mx-auto">
            Commence gratuitement. Passe à Pro quand tu es prêt. Résilie à tout moment.
          </p>
        </div>
      </section>

      {/* Plans with annual toggle */}
      <PricingPlans />

      {/* Comparison table */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Comparaison détaillée</h2>
        <div className="glass rounded-2xl overflow-hidden border border-blue-100">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50/50">
                <th className="text-left px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Fonctionnalité</th>
                <th className="text-center px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Gratuit</th>
                <th className="text-center px-5 py-4 text-xs font-bold text-blue-700 uppercase tracking-wider bg-blue-50/50">Pro</th>
                <th className="text-center px-5 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Équipe</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {FEATURES_COMPARE.map((row) => (
                <tr key={row.label} className="hover:bg-blue-50/20 transition-colors">
                  <td className="px-5 py-3.5 text-sm text-slate-600 font-medium">{row.label}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 text-center">{row.free}</td>
                  <td className="px-5 py-3.5 text-sm text-blue-700 text-center font-semibold bg-blue-50/30">{row.pro}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500 text-center">{row.team}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Trust badges */}
      <section className="max-w-5xl mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { icon: Shield, title: "Paiement sécurisé", desc: "SSL + Stripe" },
            { icon: Zap, title: "Accès immédiat", desc: "Activation instantanée" },
            { icon: Star, title: "7 jours offerts", desc: "Essai sans risque" },
            { icon: Award, title: "Certifications", desc: "Open Badge standard" },
          ].map((b) => (
            <div key={b.title} className="glass rounded-2xl p-5 text-center border border-blue-100/60">
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-3">
                <b.icon className="w-5 h-5 text-blue-600" />
              </div>
              <p className="text-sm font-bold text-slate-900 mb-1">{b.title}</p>
              <p className="text-xs text-slate-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section className="max-w-3xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-black text-slate-900 mb-8 text-center">Questions fréquentes</h2>
        <div className="space-y-4">
          {FAQ.map((item) => (
            <div key={item.q} className="glass rounded-2xl p-6 border border-blue-100/60">
              <h3 className="font-bold text-slate-900 mb-2 text-sm">{item.q}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Enterprise CTA */}
      <section className="max-w-4xl mx-auto px-4 pb-20">
        <div className="glass rounded-2xl p-8 md:p-10 border border-blue-100 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-200 flex items-center justify-center">
              <Users className="w-7 h-7 text-blue-600" />
            </div>
          </div>
          <h2 className="text-2xl font-black text-slate-900 mb-2">Vous êtes une équipe ou une entreprise ?</h2>
          <p className="text-slate-500 mb-6 max-w-lg mx-auto text-sm leading-relaxed">
            Montez en compétences vos équipes data avec des challenges personnalisés, un dashboard d&apos;analytics et une intégration directe à vos outils RH.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <a href="mailto:sales@coachai.dev" className="btn-primary px-7 py-3">
              Parler à un expert
            </a>
            <Link href="/enterprise" className="btn-secondary px-7 py-3 flex items-center gap-2">
              <Building2 className="w-4 h-4" /> En savoir plus
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
