"use client";

import Link from "next/link";
import { Brain, Github, Twitter, Linkedin, Mail } from "lucide-react";

const LINKS = {
  Produit: [
    { label: "Challenges", href: "/challenges" },
    { label: "Formation", href: "/learn" },
    { label: "Classement", href: "/leaderboard" },
    { label: "Tarifs", href: "/pricing" },
  ],
  Apprendre: [
    { label: "SQL pour la Data", href: "/learn/sql-pour-data-analysts" },
    { label: "Machine Learning", href: "/learn/machine-learning-fondamentaux" },
    { label: "Python & Pandas", href: "/learn/python-pandas-debutant" },
    { label: "Blog", href: "/blog" },
  ],
  Entreprise: [
    { label: "Équipes", href: "/enterprise" },
    { label: "Recrutement", href: "/enterprise#hiring" },
    { label: "Contact", href: "mailto:contact@coachai.dev" },
    { label: "API (bientôt)", href: "/enterprise#api" },
  ],
  Légal: [
    { label: "Mentions légales", href: "/legal" },
    { label: "CGU", href: "/terms" },
    { label: "Confidentialité", href: "/privacy" },
    { label: "Cookies", href: "/cookies" },
  ],
};

export function Footer() {
  return (
    <footer className="mt-24 border-t border-blue-100/80 dark:border-blue-900/30 footer-bar">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-1">
            <Link href="/" className="flex items-center gap-2.5 mb-4 group">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-lg shadow-blue-200">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="font-black text-xl gradient-text">CoachAI</span>
            </Link>
            <p className="text-sm text-slate-500 leading-relaxed mb-5 max-w-[180px]">
              La plateforme data/IA gamifiée. Progressez par la pratique.
            </p>
            <div className="flex items-center gap-3">
              <a href="https://github.com/coachai-dev" target="_blank" rel="noopener noreferrer" aria-label="GitHub"
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors hover:shadow-md">
                <Github className="w-4 h-4" />
              </a>
              <a href="https://twitter.com/coachai_dev" target="_blank" rel="noopener noreferrer" aria-label="Twitter"
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors hover:shadow-md">
                <Twitter className="w-4 h-4" />
              </a>
              <a href="https://linkedin.com/company/coachai" target="_blank" rel="noopener noreferrer" aria-label="LinkedIn"
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors hover:shadow-md">
                <Linkedin className="w-4 h-4" />
              </a>
              <a href="mailto:contact@coachai.dev" aria-label="Email"
                className="w-8 h-8 rounded-lg glass flex items-center justify-center text-slate-400 hover:text-blue-600 transition-colors hover:shadow-md">
                <Mail className="w-4 h-4" />
              </a>
            </div>
          </div>

          {/* Links */}
          {Object.entries(LINKS).map(([section, items]) => (
            <div key={section}>
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider mb-4">{section}</h4>
              <ul className="space-y-2.5">
                {items.map((item) => (
                  <li key={item.label}>
                    <Link href={item.href}
                      className="text-sm text-slate-500 hover:text-blue-600 transition-colors">
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-6 border-t border-blue-100/60 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} CoachAI. Tous droits réservés.
          </p>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block animate-pulse" />
              Beta ouverte — Gratuit
            </span>
            <span className="text-xs text-slate-400">Fait avec ❤️ en France</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
