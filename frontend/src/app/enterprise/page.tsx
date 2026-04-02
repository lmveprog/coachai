import Link from "next/link";
import { Brain, Building2, Users, BarChart3, ShieldCheck, Zap, ArrowRight, CheckCircle, Mail } from "lucide-react";

export const metadata = {
  title: "CoachAI pour les entreprises — Équipes & Recrutement",
  description: "Formez et évaluez vos équipes data avec CoachAI. Tests techniques objectifs, challenges personnalisés, analytics RH.",
};

const FEATURES = [
  {
    icon: Users,
    title: "Évaluation technique objective",
    desc: "Tests standardisés sur SQL, ML, Python et Deep Learning pour évaluer candidats et employés avec un scoring ELO impartial.",
  },
  {
    icon: BarChart3,
    title: "Analytics & reporting",
    desc: "Dashboard RH complet : progression de vos équipes, lacunes identifiées, benchmarks sectoriels.",
  },
  {
    icon: Brain,
    title: "Challenges personnalisés",
    desc: "Créez vos propres challenges avec vos datasets internes. Simulez vos cas d'usage réels en entretien.",
  },
  {
    icon: ShieldCheck,
    title: "SSO & sécurité enterprise",
    desc: "Intégration SAML/OIDC, gestion des rôles, audit logs complets, et hébergement on-premise disponible.",
  },
  {
    icon: Zap,
    title: "Onboarding accéléré",
    desc: "Parcours d'intégration adaptés au niveau de vos recrues. Réduisez le time-to-productivity de 40%.",
  },
  {
    icon: Building2,
    title: "Support dédié",
    desc: "Customer success manager dédié, SLA garanti, formation de vos managers et référents techniques.",
  },
];

const PLANS = [
  {
    name: "Team",
    price: "49€",
    per: "/utilisateur/mois",
    min: "À partir de 5 utilisateurs",
    features: [
      "Accès illimité aux challenges",
      "Dashboard manager",
      "Reporting mensuel",
      "Support email prioritaire",
    ],
    cta: "Démarrer un essai",
    highlight: false,
  },
  {
    name: "Business",
    price: "Sur devis",
    per: "",
    min: "À partir de 20 utilisateurs",
    features: [
      "Tout le plan Team",
      "Challenges personnalisés",
      "SSO / SAML",
      "API access",
      "Customer success dédié",
      "SLA 99,9%",
    ],
    cta: "Nous contacter",
    highlight: true,
  },
  {
    name: "Enterprise",
    price: "Sur devis",
    per: "",
    min: "Volume illimité",
    features: [
      "Tout le plan Business",
      "Hébergement on-premise",
      "Intégration ATS/HRIS",
      "Audit logs complets",
      "Formation équipe dédiée",
    ],
    cta: "Parler à un expert",
    highlight: false,
  },
];

const CLIENTS_LOGOS = ["BNP Paribas", "Qonto", "Dataiku", "Criteo", "Doctolib", "Malt"];

export default function EnterprisePage() {
  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10">
      {/* Hero */}
      <div className="text-center mb-16">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-5">
          <Building2 className="w-3.5 h-3.5" /> Solution Entreprise
        </div>
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 mb-4 leading-tight">
          Formez et recrutez vos talents data<br className="hidden sm:block" /> avec <span className="gradient-text">CoachAI Enterprise</span>
        </h1>
        <p className="text-slate-500 text-lg max-w-2xl mx-auto mb-8">
          La plateforme utilisée par les meilleures équipes data pour évaluer, former et recruter leurs data scientists, ML engineers et data analysts.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <a href="mailto:enterprise@coachai.dev?subject=Démo CoachAI Enterprise"
            className="btn-primary flex items-center gap-2 justify-center py-3.5 px-8 text-sm">
            <Mail className="w-4 h-4" /> Demander une démo <ArrowRight className="w-4 h-4" />
          </a>
          <Link href="/pricing"
            className="btn-secondary flex items-center gap-2 justify-center py-3.5 px-8 text-sm">
            Voir les tarifs
          </Link>
        </div>
        <p className="text-xs text-slate-400 mt-4">Réponse sous 24h · Sans engagement</p>
      </div>

      {/* Social proof */}
      <div className="py-8 border-y border-blue-100/60 mb-16">
        <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest text-center mb-5">
          Fait confiance par des équipes data chez
        </p>
        <div className="flex flex-wrap items-center justify-center gap-8 opacity-50">
          {CLIENTS_LOGOS.map((c) => (
            <span key={c} className="text-sm font-bold text-slate-600">{c}</span>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">
            Tout ce dont vos équipes data ont besoin
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto">
            De l&apos;évaluation à la formation continue, CoachAI Enterprise couvre tout le cycle de vie de vos talents data.
          </p>
        </div>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((f) => (
            <div key={f.title} className="glass rounded-2xl p-6 border border-blue-100/60 hover:border-blue-200 transition-all hover:shadow-md">
              <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center mb-4">
                <f.icon className="w-5 h-5 text-blue-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2 text-sm">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Pricing */}
      <div id="hiring" className="mb-20">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 mb-3">Plans Entreprise</h2>
          <p className="text-slate-500">Tarification transparente adaptée à la taille de votre équipe.</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`rounded-2xl p-6 border transition-all ${
                plan.highlight
                  ? "bg-gradient-to-br from-blue-600 to-blue-700 border-blue-500 shadow-xl shadow-blue-200 text-white"
                  : "glass border-blue-100/60 hover:border-blue-200 hover:shadow-md"
              }`}
            >
              {plan.highlight && (
                <div className="text-xs font-bold text-blue-200 uppercase tracking-wider mb-3">Recommandé</div>
              )}
              <div className="mb-4">
                <h3 className={`font-black text-lg mb-1 ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                  {plan.name}
                </h3>
                <div className={`flex items-baseline gap-1 ${plan.highlight ? "text-white" : "text-slate-900"}`}>
                  <span className="text-2xl font-black">{plan.price}</span>
                  {plan.per && <span className={`text-xs ${plan.highlight ? "text-blue-200" : "text-slate-400"}`}>{plan.per}</span>}
                </div>
                <p className={`text-xs mt-1 ${plan.highlight ? "text-blue-200" : "text-slate-400"}`}>{plan.min}</p>
              </div>
              <ul className="space-y-2 mb-6">
                {plan.features.map((f) => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${plan.highlight ? "text-blue-100" : "text-slate-600"}`}>
                    <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? "text-blue-200" : "text-green-500"}`} />
                    {f}
                  </li>
                ))}
              </ul>
              <a
                href="mailto:enterprise@coachai.dev?subject=CoachAI Enterprise — Renseignements"
                className={`w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  plan.highlight
                    ? "bg-white text-blue-700 hover:bg-blue-50"
                    : "bg-blue-600 text-white hover:bg-blue-700 shadow-sm"
                }`}
              >
                {plan.cta} <ArrowRight className="w-4 h-4" />
              </a>
            </div>
          ))}
        </div>
      </div>

      {/* API section */}
      <div id="api" className="glass-intense rounded-2xl p-8 border border-blue-100 shadow-lg shadow-blue-100/30 mb-16 text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center mx-auto mb-4 shadow-md">
          <Zap className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">API CoachAI — Bientôt disponible</h2>
        <p className="text-slate-500 text-sm max-w-lg mx-auto mb-5">
          Intégrez l&apos;évaluation technique CoachAI directement dans votre ATS, votre plateforme RH ou vos outils internes via notre API REST.
        </p>
        <a href="mailto:enterprise@coachai.dev?subject=API CoachAI — Intérêt"
          className="btn-secondary inline-flex items-center gap-2 py-2.5 px-6 text-sm">
          <Mail className="w-4 h-4" /> Être notifié du lancement API
        </a>
      </div>

      {/* CTA */}
      <div className="text-center">
        <h2 className="text-2xl font-black text-slate-900 mb-3">Prêt à évaluer votre prochain data scientist ?</h2>
        <p className="text-slate-500 mb-6">Contactez notre équipe pour une démo personnalisée et un essai gratuit 14 jours.</p>
        <a href="mailto:enterprise@coachai.dev?subject=Démo CoachAI Enterprise"
          className="btn-primary inline-flex items-center gap-2 py-3.5 px-8 text-sm">
          <Mail className="w-4 h-4" /> Planifier une démo <ArrowRight className="w-4 h-4" />
        </a>
        <p className="text-xs text-slate-400 mt-4">Réponse garantie sous 24h ouvrées.</p>
      </div>
    </div>
  );
}
