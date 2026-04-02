import Link from "next/link";
import { Brain, ArrowLeft, Search, Zap } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 hero-bg">
      <div className="max-w-lg w-full text-center space-y-8">
        {/* Number */}
        <div className="relative">
          <span className="text-[160px] font-black leading-none select-none gradient-text opacity-40 dark:opacity-20">
            404
          </span>
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-2xl bg-white shadow-xl border border-blue-100 flex items-center justify-center">
              <Brain className="w-8 h-8 text-blue-600" />
            </div>
          </div>
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">Cette page n&apos;existe pas</h1>
          <p className="text-slate-500 leading-relaxed">
            Le challenge que tu cherches est peut-être caché dans un challenge de niveau Expert. 🕵️
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary py-3 px-6 flex items-center gap-2 justify-center">
            <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>
          <Link href="/challenges" className="btn-secondary py-3 px-6 flex items-center gap-2 justify-center">
            <Zap className="w-4 h-4" /> Voir les challenges
          </Link>
        </div>

        <div className="glass rounded-2xl p-5 border border-blue-100 text-left">
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">Pages populaires</p>
          <div className="grid grid-cols-2 gap-2">
            {[
              { label: "Challenges SQL", href: "/challenges?category=sql" },
              { label: "Machine Learning", href: "/challenges?category=machine_learning" },
              { label: "Formations", href: "/learn" },
              { label: "Classement", href: "/leaderboard" },
            ].map((item) => (
              <Link key={item.href} href={item.href}
                className="text-sm text-blue-600 hover:text-blue-700 hover:underline flex items-center gap-1">
                <Search className="w-3 h-3" /> {item.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
