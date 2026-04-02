"use client";

import Link from "next/link";
import { useState } from "react";
import { Brain, BookOpen, ArrowRight, Rss, CheckCircle } from "lucide-react";

const UPCOMING_ARTICLES = [
  {
    title: "Comment maîtriser SQL pour la Data Science en 2025",
    category: "SQL",
    emoji: "🗄️",
    desc: "Les requêtes indispensables que tout data analyst doit connaître, avec des exercices pratiques.",
  },
  {
    title: "Introduction aux réseaux de neurones avec PyTorch",
    category: "Deep Learning",
    emoji: "🧠",
    desc: "Construire ton premier réseau de neurones from scratch : théorie, code et résultats.",
  },
  {
    title: "Feature Engineering : 10 techniques pour booster tes modèles ML",
    category: "Machine Learning",
    emoji: "⚙️",
    desc: "Les techniques de transformation de données que les top Kagglers utilisent.",
  },
  {
    title: "Pandas avancé : GroupBy, MultiIndex et performance",
    category: "Python",
    emoji: "🐼",
    desc: "Dépasser les bases de Pandas pour traiter des millions de lignes efficacement.",
  },
  {
    title: "Système ELO en Data Science : comment progresser rapidement",
    category: "Carrière",
    emoji: "📈",
    desc: "Notre approche gamifiée pour mesurer et booster ta progression en data.",
  },
  {
    title: "Préparer un entretien Data Scientist : le guide complet",
    category: "Carrière",
    emoji: "💼",
    desc: "Algorithmes, ML theory, SQL, et culture d'entreprise — tout ce que tu dois savoir.",
  },
];

const CATEGORY_COLORS: Record<string, string> = {
  SQL: "bg-blue-50 text-blue-700 border-blue-100",
  "Deep Learning": "bg-purple-50 text-purple-700 border-purple-100",
  "Machine Learning": "bg-green-50 text-green-700 border-green-100",
  Python: "bg-amber-50 text-amber-700 border-amber-100",
  Carrière: "bg-orange-50 text-orange-700 border-orange-100",
};

export default function BlogPage() {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // Store locally — real submission would POST to an email service
    const existing = JSON.parse(localStorage.getItem("blog_subscribers") ?? "[]") as string[];
    if (!existing.includes(email)) {
      localStorage.setItem("blog_subscribers", JSON.stringify([...existing, email]));
    }
    setSubmitted(true);
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">
      {/* Header */}
      <div className="text-center mb-14">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-5 shadow-lg shadow-blue-200">
          <BookOpen className="w-7 h-7 text-white" />
        </div>
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 text-blue-700 dark:text-blue-400 text-xs font-semibold mb-4">
          <Rss className="w-3.5 h-3.5" /> Bientôt disponible
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mb-3">
          Le blog CoachAI
        </h1>
        <p className="text-slate-500 text-lg max-w-xl mx-auto">
          Tutoriels, guides pratiques et conseils pour devenir un data scientist de haut niveau.
        </p>
      </div>

      {/* Newsletter CTA */}
      <div className="glass-intense rounded-2xl p-8 border border-blue-100 shadow-lg shadow-blue-100/30 mb-12 text-center">
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center mx-auto mb-4 shadow-md shadow-blue-200">
          <Brain className="w-6 h-6 text-white" />
        </div>
        <h2 className="text-xl font-black text-slate-900 mb-2">Sois notifié à la publication</h2>
        <p className="text-slate-500 text-sm mb-6 max-w-md mx-auto">
          Le blog arrive bientôt. Laisse ton email et reçois nos premiers articles directement dans ta boîte mail.
        </p>
        {submitted ? (
          <div className="flex items-center justify-center gap-3 py-4">
            <CheckCircle className="w-6 h-6 text-green-500" />
            <div className="text-left">
              <p className="text-sm font-bold text-slate-900">Parfait, tu es inscrit !</p>
              <p className="text-xs text-slate-500">On te préviendra dès la publication du premier article.</p>
            </div>
          </div>
        ) : (
          <>
            <form className="flex gap-3 max-w-sm mx-auto" onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="ton@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-glass flex-1 text-sm"
                required
              />
              <button type="submit" className="btn-primary flex items-center gap-1.5 px-4 py-2.5 text-sm">
                S&apos;inscrire <ArrowRight className="w-4 h-4" />
              </button>
            </form>
            <p className="text-xs text-slate-400 mt-3">Pas de spam. Désabonnement en 1 clic.</p>
          </>
        )}
      </div>

      {/* Upcoming articles */}
      <div>
        <h2 className="text-base font-bold text-slate-900 mb-6 flex items-center gap-2">
          <span className="text-blue-600">✍️</span> Articles en préparation
        </h2>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {UPCOMING_ARTICLES.map((article) => (
            <div
              key={article.title}
              className="glass rounded-2xl p-5 border border-blue-100/60 hover:border-blue-200 transition-all hover:shadow-md group"
            >
              <div className="text-3xl mb-3">{article.emoji}</div>
              <span className={`text-xs font-semibold px-2 py-0.5 rounded-lg border ${CATEGORY_COLORS[article.category] ?? "bg-slate-50 text-slate-600 border-slate-100"}`}>
                {article.category}
              </span>
              <h3 className="font-bold text-slate-900 text-sm mt-3 mb-2 leading-snug group-hover:text-blue-700 transition-colors">
                {article.title}
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">{article.desc}</p>
              <div className="mt-4 text-xs font-semibold text-slate-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-400 inline-block" />
                En rédaction
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Back to platform */}
      <div className="mt-14 text-center">
        <Link href="/challenges" className="btn-primary inline-flex items-center gap-2 py-3 px-6">
          <Brain className="w-4 h-4" /> En attendant, pratique sur les challenges
        </Link>
        <p className="text-xs text-slate-400 mt-3">La pratique vaut mieux que la théorie 🚀</p>
      </div>
    </div>
  );
}
