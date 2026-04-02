"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Cookie, X, CheckCircle } from "lucide-react";

const STORAGE_KEY = "cookie_consent_v1";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const consent = localStorage.getItem(STORAGE_KEY);
    if (!consent) setVisible(true);
  }, []);

  function accept() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: true, date: new Date().toISOString() }));
    setVisible(false);
  }

  function decline() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ accepted: false, date: new Date().toISOString() }));
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-label="Consentement aux cookies"
      className="fixed bottom-4 left-4 right-4 sm:left-6 sm:right-auto sm:max-w-md z-50 glass-intense rounded-2xl border border-blue-100 shadow-2xl p-5 animate-slide-up"
    >
      <div className="flex items-start gap-3 mb-3">
        <div className="w-8 h-8 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
          <Cookie className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <p className="text-sm font-bold text-slate-900 mb-1">Nous utilisons des cookies</p>
          <p className="text-xs text-slate-500 leading-relaxed">
            CoachAI utilise des cookies essentiels pour ton compte et ta session.{" "}
            <Link href="/cookies" className="text-blue-600 hover:underline">
              En savoir plus
            </Link>
          </p>
        </div>
        <button
          onClick={decline}
          aria-label="Fermer"
          className="ml-auto text-slate-400 hover:text-slate-600 transition-colors flex-shrink-0"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
      <div className="flex gap-2">
        <button
          onClick={accept}
          className="flex-1 flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition-colors"
        >
          <CheckCircle className="w-3.5 h-3.5" /> Accepter
        </button>
        <button
          onClick={decline}
          className="flex-1 px-4 py-2 rounded-xl border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs font-semibold transition-colors"
        >
          Refuser
        </button>
      </div>
    </div>
  );
}
