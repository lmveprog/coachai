"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function Error({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4 hero-bg">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-10 h-10 text-red-500" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">Une erreur est survenue</h1>
          <p className="text-slate-500 leading-relaxed">
            Quelque chose s&apos;est mal passé. Notre équipe a été notifiée et travaille à la résolution.
          </p>
          {error.digest && (
            <p className="text-xs text-slate-400 mt-2 font-mono">Code : {error.digest}</p>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={reset}
            className="btn-primary py-3 px-6 flex items-center gap-2 justify-center"
          >
            <RefreshCw className="w-4 h-4" /> Réessayer
          </button>
          <Link href="/" className="btn-secondary py-3 px-6 flex items-center gap-2 justify-center">
            <ArrowLeft className="w-4 h-4" /> Retour à l&apos;accueil
          </Link>
        </div>
      </div>
    </div>
  );
}
