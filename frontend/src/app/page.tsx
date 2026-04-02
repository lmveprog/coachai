import type { Metadata } from "next";
import Link from "next/link";
import {
  Zap, Trophy, BookOpen, Brain, ArrowRight, Database, Bot, MessageSquare,
  BarChart3, GitBranch, Star, Users, Code2, TrendingUp, CheckCircle,
  Target, Flame, Award, Lock, Shield, Cpu, Layers, ChevronRight,
} from "lucide-react";

export const metadata: Metadata = {
  title: "CoachAI — Maîtrise la Data & l'IA par la pratique",
  description: "La plateforme gamifiée pour devenir Data Scientist. Challenges SQL, ML, Deep Learning avec système ELO. Formations intégrées et certifications.",
};

const FEATURES = [
  {
    icon: Zap,
    title: "Challenges réels",
    desc: "SQL, Machine Learning, Deep Learning, NLP. Code évalué en sandbox Docker isolée en moins d'1 seconde.",
    color: "text-blue-600",
    bg: "bg-blue-50",
    border: "border-blue-100",
    gradient: "from-blue-50 to-blue-100/50",
  },
  {
    icon: Trophy,
    title: "Système ELO dynamique",
    desc: "Classement compétitif en temps réel. Rookie → Analyst → Expert → Master → Grand Master.",
    color: "text-amber-600",
    bg: "bg-amber-50",
    border: "border-amber-100",
    gradient: "from-amber-50 to-amber-100/50",
  },
  {
    icon: BookOpen,
    title: "Formations intégrées",
    desc: "Cours structurés directement liés aux challenges. Apprends la théorie, applique-la immédiatement.",
    color: "text-purple-600",
    bg: "bg-purple-50",
    border: "border-purple-100",
    gradient: "from-purple-50 to-purple-100/50",
  },
  {
    icon: Award,
    title: "Badges & Certifications",
    desc: "Récompenses vérifiables pour chaque milestone. Valorise ton portfolio et tes compétences.",
    color: "text-green-600",
    bg: "bg-green-50",
    border: "border-green-100",
    gradient: "from-green-50 to-green-100/50",
  },
  {
    icon: Flame,
    title: "Streak & Motivation",
    desc: "Bonus ELO pour les sessions quotidiennes. Comme Duolingo, mais pour la data science.",
    color: "text-orange-600",
    bg: "bg-orange-50",
    border: "border-orange-100",
    gradient: "from-orange-50 to-orange-100/50",
  },
  {
    icon: Users,
    title: "Classement mondial",
    desc: "Compare-toi aux meilleurs data scientists. Classements global, par catégorie, par semaine.",
    color: "text-indigo-600",
    bg: "bg-indigo-50",
    border: "border-indigo-100",
    gradient: "from-indigo-50 to-indigo-100/50",
  },
];

const CATEGORIES = [
  { icon: Database, label: "SQL", slug: "sql", count: "8 challenges", desc: "SELECT, JOIN, GROUP BY, Window Functions" },
  { icon: Bot, label: "Machine Learning", slug: "machine_learning", count: "8 challenges", desc: "Sklearn, régression, classification, KNN" },
  { icon: Brain, label: "Deep Learning", slug: "deep_learning", count: "Bientôt", desc: "PyTorch, TensorFlow, CNN, RNN" },
  { icon: MessageSquare, label: "NLP", slug: "nlp", count: "Bientôt", desc: "BERT, transformers, text mining" },
  { icon: BarChart3, label: "Visualisation", slug: "visualization", count: "Bientôt", desc: "Matplotlib, Plotly, storytelling" },
  { icon: Cpu, label: "Data Engineering", slug: "data_engineering", count: "9 challenges", desc: "Python, Pandas, ETL, pipelines" },
];

const HOW_IT_WORKS = [
  { step: "01", title: "Crée ton compte", desc: "Inscription gratuite en 30 secondes. Tu commences avec 1000 ELO." },
  { step: "02", title: "Choisis un challenge", desc: "Filtre par catégorie et difficulté. Du SQL débutant au ML avancé." },
  { step: "03", title: "Code ta solution", desc: "Éditeur Monaco intégré. Python, SQL supportés. Auto-complétion." },
  { step: "04", title: "Soumets et progresse", desc: "Résultat instantané. Gagne de l'ELO, débloque des badges." },
];

const COMPETITORS = [
  { name: "LeetCode / HackerRank", pro: "Challenges algorithmiques", con: "Pas de focus data/IA, pas de formation" },
  { name: "Kaggle", pro: "Compétitions ML", con: "Pas d'apprentissage guidé, pas d'ELO individuel" },
  { name: "OpenClassrooms", pro: "Formation structurée", con: "Aucun aspect compétitif ou gamifié" },
  { name: "HackTheBox / RootMe", pro: "Gamification & ELO", con: "Cybersécurité uniquement" },
];

// Testimonials will be added once real beta users share their feedback.
// For now we show the beta call-to-action section.

const STATS = [
  { value: "25+", label: "Challenges actifs", icon: Code2 },
  { value: "4", label: "Formations complètes", icon: BookOpen },
  { value: "10+", label: "Badges à débloquer", icon: Star },
  { value: "1000", label: "ELO de départ", icon: TrendingUp },
];

const PLANS = [
  {
    name: "Gratuit",
    price: "0€",
    period: "pour toujours",
    highlight: false,
    features: [
      "3 challenges/jour (SQL & Python)",
      "1 formation complète",
      "Classement global",
      "Profil public",
      "Badges de base",
    ],
    cta: "Commencer gratuitement",
    href: "/register",
  },
  {
    name: "Pro",
    price: "15€",
    period: "/mois",
    highlight: true,
    badge: "Populaire",
    features: [
      "Tous les challenges (100+)",
      "Toutes les formations",
      "Classements par catégorie",
      "Certifications vérifiables",
      "Streak boosts & bonus ELO",
      "Support prioritaire",
    ],
    cta: "Essayer 7 jours gratuits",
    href: "/pricing",
  },
  {
    name: "Équipe",
    price: "Sur devis",
    period: "",
    highlight: false,
    features: [
      "Tout Pro inclus",
      "Dashboard équipe",
      "Challenges personnalisés",
      "Intégration RH & ATS",
      "Formation on-boarding",
      "SLA & support dédié",
    ],
    cta: "Contacter les ventes",
    href: "mailto:sales@coachai.dev",
  },
];

export default function HomePage() {
  return (
    <div className="overflow-x-hidden">
      {/* ── Hero ── */}
      <section className="relative min-h-[92vh] flex items-center justify-center px-4 hero-bg">
        <div className="absolute inset-0 dot-grid opacity-40 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto text-center animate-slide-up z-10">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass border border-blue-200 text-blue-700 text-sm font-semibold mb-10 shadow-sm">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
            </span>
            Beta ouverte — Gratuit pour toujours sur le plan Free 🚀
          </div>

          {/* Headline */}
          <h1 className="text-5xl sm:text-7xl lg:text-8xl font-black tracking-tight mb-6 leading-[0.95] text-slate-900">
            Deviens expert en{" "}
            <span className="gradient-text">Data & IA</span>
            <br />
            par la pratique.
          </h1>

          <p className="text-lg sm:text-xl text-slate-500 max-w-2xl mx-auto mb-10 leading-relaxed">
            La plateforme gamifiée qui combine challenges réels, système ELO compétitif
            et formations structurées — comme HackTheBox, mais pour la data science.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-16">
            <Link href="/register" className="btn-primary text-base px-8 py-3.5 shadow-xl">
              Commencer gratuitement
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link href="/challenges" className="btn-secondary text-base px-8 py-3.5">
              <Zap className="w-4 h-4" />
              Voir les challenges
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 max-w-2xl mx-auto">
            {STATS.map((s) => (
              <div key={s.label} className="glass px-4 py-4 rounded-2xl text-center shadow-sm border border-blue-100/60">
                <div className="text-2xl font-black gradient-text">{s.value}</div>
                <div className="text-xs text-slate-500 mt-1 leading-tight">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Trusted By ── */}
      <section className="py-10 border-y border-blue-100/60 section-alt">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-widest mb-6">Conçu pour les métiers de la data</p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              { icon: "🗄️", label: "Data Analyst" },
              { icon: "🤖", label: "ML Engineer" },
              { icon: "🧠", label: "Data Scientist" },
              { icon: "⚙️", label: "Data Engineer" },
              { icon: "📊", label: "BI Developer" },
              { icon: "☁️", label: "MLOps" },
            ].map((r) => (
              <span key={r.label} className="flex items-center gap-2 text-sm font-semibold text-slate-600 bg-white border border-blue-100 rounded-full px-4 py-2 shadow-sm">
                {r.icon} {r.label}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section className="max-w-6xl mx-auto px-4 py-24">
        <div className="text-center mb-16">
          <span className="section-label mb-4">Fonctionnalités</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-4 mb-3">
            Tout pour progresser vite
          </h2>
          <p className="text-slate-500 max-w-xl mx-auto text-lg">
            Une plateforme complète, conçue pour les data scientists sérieux.
          </p>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {FEATURES.map((f) => (
            <div key={f.title} className={`glass glass-hover rounded-2xl p-7 border ${f.border} group bg-gradient-to-br ${f.gradient}`}>
              <div className={`w-12 h-12 rounded-xl ${f.bg} border ${f.border} flex items-center justify-center mb-5 group-hover:scale-110 transition-transform`}>
                <f.icon className={`w-6 h-6 ${f.color}`} />
              </div>
              <h3 className="text-lg font-bold text-slate-900 mb-2">{f.title}</h3>
              <p className="text-slate-500 text-sm leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="py-20 px-4 section-alt">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="section-label mb-4">Comment ça marche</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-4 mb-3">De zéro à expert en 4 étapes</h2>
            <p className="text-slate-500 text-lg">Simple à démarrer. Difficile à arrêter.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {HOW_IT_WORKS.map((step, i) => (
              <div key={step.step} className="glass rounded-2xl p-6 relative border border-blue-100/60 hover:border-blue-200 transition-all hover:shadow-lg">
                <div className="text-5xl font-black text-blue-50 absolute top-4 right-4 select-none leading-none">{step.step}</div>
                <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center mb-4 shadow-lg shadow-blue-200">
                  <span className="text-white font-bold text-sm">{i + 1}</span>
                </div>
                <h3 className="font-bold text-slate-900 mb-2">{step.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{step.desc}</p>
                {i < 3 && (
                  <ChevronRight className="hidden lg:block absolute -right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-300 z-10" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Categories ── */}
      <section className="max-w-6xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="section-label mb-4">Catégories</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-4 mb-3">Toutes les compétences data</h2>
          <p className="text-slate-500 text-lg">Du SQL débutant au Deep Learning avancé.</p>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {CATEGORIES.map((cat) => (
            <Link
              key={cat.label}
              href={`/challenges?category=${cat.slug}`}
              className="glass glass-hover rounded-2xl p-4 text-center group border border-blue-100/60"
            >
              <div className="w-10 h-10 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center mx-auto mb-3 group-hover:bg-blue-100 group-hover:border-blue-200 transition-all">
                <cat.icon className="w-5 h-5 text-blue-600" />
              </div>
              <div className="text-sm font-bold text-slate-800 mb-1">{cat.label}</div>
              <div className="text-xs text-blue-600 font-medium mb-1">{cat.count}</div>
              <div className="text-xs text-slate-500 leading-tight hidden sm:block">{cat.desc}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── Beta CTA ── */}
      <section className="py-20 px-4 section-alt">
        <div className="max-w-3xl mx-auto text-center">
          <span className="section-label mb-4">Bêta ouverte</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-4 mb-4">
            Rejoins les premiers utilisateurs
          </h2>
          <p className="text-slate-500 text-lg mb-10 leading-relaxed">
            CoachAI est en bêta ouverte. Inscris-toi gratuitement, teste tous les challenges SQL, Python et ML,
            et aide-nous à construire la meilleure plateforme data/IA du marché.
          </p>
          <div className="grid sm:grid-cols-3 gap-5 mb-10">
            {[
              { emoji: "🎯", title: "Accès gratuit complet", desc: "3 challenges/jour sans carte bancaire" },
              { emoji: "🏆", title: "ELO dès le premier jour", desc: "Commence à 1000 ELO, progresse à ton rythme" },
              { emoji: "💬", title: "Feedback direct", desc: "Tes retours façonnent les prochains challenges" },
            ].map((item) => (
              <div key={item.title} className="glass rounded-2xl p-6 border border-blue-100/60 text-center">
                <div className="text-3xl mb-3">{item.emoji}</div>
                <h3 className="font-bold text-slate-900 mb-1 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
          <Link href="/register" className="btn-primary text-base px-8 py-3.5 inline-flex items-center gap-2 shadow-xl">
            Rejoindre la bêta gratuitement <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {/* ── Vs Competitors ── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="text-center mb-12">
          <span className="section-label mb-4">Pourquoi CoachAI</span>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-4 mb-3">
            Tout ce que les autres n&apos;ont pas
          </h2>
        </div>
        <div className="glass rounded-2xl overflow-hidden border border-blue-100">
          <table className="w-full">
            <thead>
              <tr className="bg-blue-50/50">
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Plateforme</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Point fort</th>
                <th className="text-left px-5 py-3.5 text-xs font-bold text-slate-600 uppercase tracking-wider">Limite</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {COMPETITORS.map((c) => (
                <tr key={c.name} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-5 py-3.5 text-sm font-semibold text-slate-700">{c.name}</td>
                  <td className="px-5 py-3.5 text-sm text-slate-500">{c.pro}</td>
                  <td className="px-5 py-3.5 text-sm text-red-500 flex items-start gap-1.5">
                    <span className="mt-0.5 flex-shrink-0">✗</span>{c.con}
                  </td>
                </tr>
              ))}
              <tr className="bg-gradient-to-r from-blue-50/60 to-indigo-50/60">
                <td className="px-5 py-3.5">
                  <span className="inline-flex items-center gap-2 font-black text-blue-700 text-sm">
                    <Brain className="w-4 h-4" /> CoachAI
                    <span className="text-xs bg-blue-600 text-white px-2 py-0.5 rounded-full">Nous</span>
                  </span>
                </td>
                <td className="px-5 py-3.5 text-sm font-bold text-blue-700">Data/IA + ELO + Formation + Gamification</td>
                <td className="px-5 py-3.5 text-sm text-green-600 font-semibold flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" /> Tout à la fois
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── Pricing preview ── */}
      <section className="py-20 px-4 section-alt">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-14">
            <span className="section-label mb-4">Tarifs</span>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 mt-4 mb-3">Simple, transparent, abordable</h2>
            <p className="text-slate-500 text-lg">Commence gratuitement. Passe à Pro quand tu veux.</p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {PLANS.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-7 flex flex-col gap-5 relative ${
                  plan.highlight
                    ? "bg-gradient-to-br from-blue-600 to-blue-700 text-white shadow-2xl shadow-blue-200 border border-blue-500 scale-[1.02]"
                    : "glass border border-blue-100/60"
                }`}
              >
                {plan.badge && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-gradient-to-r from-amber-400 to-orange-400 text-white text-xs font-bold shadow-lg">
                    {plan.badge}
                  </div>
                )}
                <div>
                  <p className={`text-sm font-semibold mb-1 ${plan.highlight ? "text-blue-200" : "text-slate-500"}`}>{plan.name}</p>
                  <div className="flex items-end gap-1">
                    <span className={`text-4xl font-black ${plan.highlight ? "text-white" : "gradient-text"}`}>{plan.price}</span>
                    {plan.period && <span className={`text-sm pb-1 ${plan.highlight ? "text-blue-200" : "text-slate-400"}`}>{plan.period}</span>}
                  </div>
                </div>
                <ul className="space-y-2.5 flex-1">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2.5 text-sm">
                      <CheckCircle className={`w-4 h-4 flex-shrink-0 ${plan.highlight ? "text-blue-200" : "text-green-500"}`} />
                      <span className={plan.highlight ? "text-blue-100" : "text-slate-600"}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={plan.href}
                  className={`w-full text-center py-3 rounded-xl font-semibold text-sm transition-all ${
                    plan.highlight
                      ? "bg-white text-blue-700 hover:bg-blue-50 shadow-lg"
                      : "btn-secondary"
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
          <p className="text-center text-xs text-slate-400 mt-5">
            <Lock className="w-3 h-3 inline mr-1" />
            Paiement sécurisé · Résiliation à tout moment · Aucune carte requise pour le plan gratuit
          </p>
        </div>
      </section>

      {/* ── ELO Ranks showcase ── */}
      <section className="max-w-5xl mx-auto px-4 py-20">
        <div className="glass rounded-3xl p-8 md:p-12 border border-blue-100 glow-blue">
          <div className="grid md:grid-cols-2 gap-10 items-center">
            <div>
              <span className="section-label mb-4">Progression</span>
              <h2 className="text-3xl font-black text-slate-900 mt-4 mb-4">Grimpe dans les rangs</h2>
              <p className="text-slate-500 mb-6 leading-relaxed">
                Comme aux échecs, ton ELO évolue à chaque soumission.
                Plus tu bats des challenges difficiles, plus tu gagnes d&apos;ELO.
              </p>
              <div className="space-y-2.5">
                {[
                  { rank: "Rookie", elo: "0-999", icon: "🔰", color: "text-slate-500 bg-slate-50 border-slate-200" },
                  { rank: "Analyst", elo: "1000-1299", icon: "📊", color: "text-green-600 bg-green-50 border-green-200" },
                  { rank: "Expert", elo: "1300-1599", icon: "⚡", color: "text-blue-600 bg-blue-50 border-blue-200" },
                  { rank: "Master", elo: "1600-1899", icon: "🔮", color: "text-purple-600 bg-purple-50 border-purple-200" },
                  { rank: "Grand Master", elo: "1900+", icon: "👑", color: "text-amber-600 bg-amber-50 border-amber-200" },
                ].map((r) => (
                  <div key={r.rank} className={`flex items-center gap-3 px-4 py-2.5 rounded-xl border ${r.color} transition-all hover:shadow-sm`}>
                    <span className="text-xl">{r.icon}</span>
                    <span className="font-bold text-sm flex-1">{r.rank}</span>
                    <span className="text-xs font-mono font-semibold opacity-60">{r.elo} ELO</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="glass rounded-2xl p-5 border border-blue-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-blue-100 flex items-center justify-center">
                    <GitBranch className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <span className="text-slate-900 font-bold text-sm block">ELO dynamique</span>
                    <span className="text-xs text-slate-400">Calculé comme aux échecs</span>
                  </div>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">Commence à 1000 ELO. Gagne entre +15 et +80 ELO par challenge selon la difficulté et ton niveau actuel.</p>
              </div>
              <div className="glass rounded-2xl p-5 border border-green-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-green-100 flex items-center justify-center">
                    <Flame className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <span className="text-slate-900 font-bold text-sm block">Streak quotidien</span>
                    <span className="text-xs text-slate-400">Bonus ELO chaque jour</span>
                  </div>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">7 jours consécutifs = badge Semaine de Feu + bonus ELO. 30 jours = Mois d&apos;Acier.</p>
              </div>
              <div className="glass rounded-2xl p-5 border border-purple-100">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-100 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-purple-600" />
                  </div>
                  <div>
                    <span className="text-slate-900 font-bold text-sm block">Sandbox isolée</span>
                    <span className="text-xs text-slate-400">Docker — résultat en &lt;1s</span>
                  </div>
                </div>
                <p className="text-slate-500 text-xs leading-relaxed">Ton code tourne dans un container Docker sécurisé. Réseau désactivé, limite mémoire/CPU stricte.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Final ── */}
      <section className="max-w-4xl mx-auto px-4 pb-24">
        <div
          className="rounded-3xl p-12 text-center relative overflow-hidden"
          style={{
            background: "linear-gradient(135deg, #1d4ed8 0%, #2563eb 50%, #4f46e5 100%)",
            boxShadow: "0 20px 80px rgba(37,99,235,0.4)",
          }}
        >
          <div className="absolute inset-0 opacity-20 pointer-events-none"
            style={{ backgroundImage: "radial-gradient(rgba(255,255,255,0.3) 1px, transparent 1px)", backgroundSize: "24px 24px" }} />
          <div className="relative">
            <span className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-xs font-semibold mb-6 border border-white/20">
              <Layers className="w-3.5 h-3.5" /> Plateforme complète · Beta ouverte
            </span>
            <h2 className="text-4xl sm:text-5xl font-black text-white mb-4 leading-tight">Prêt à te dépasser ?</h2>
            <p className="text-blue-100 mb-8 text-lg max-w-md mx-auto">
              Rejoins la plateforme data gamifiée. Gratuit, sans carte bancaire.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/register"
                className="inline-flex items-center gap-2 bg-white text-blue-700 font-bold px-8 py-3.5 rounded-xl hover:bg-blue-50 transition-all shadow-xl text-sm">
                Créer mon compte gratuitement
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/challenges"
                className="inline-flex items-center gap-2 bg-white/10 text-white font-semibold px-8 py-3.5 rounded-xl hover:bg-white/20 transition-all border border-white/20 text-sm">
                <Target className="w-4 h-4" /> Voir les challenges
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
