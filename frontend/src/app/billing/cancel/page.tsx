import Link from "next/link";
import { ArrowLeft, HelpCircle } from "lucide-react";

export default function BillingCancelPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 hero-bg">
      <div className="max-w-md w-full text-center space-y-8">
        <div className="w-20 h-20 rounded-full bg-slate-100 flex items-center justify-center mx-auto">
          <HelpCircle className="w-10 h-10 text-slate-400" />
        </div>

        <div>
          <h1 className="text-2xl font-black text-slate-900 mb-3">Paiement annulé</h1>
          <p className="text-slate-500 leading-relaxed">
            Ton abonnement n&apos;a pas été modifié. Tu peux revenir sur la page des tarifs à tout moment.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/pricing" className="btn-primary py-3 px-6 flex items-center gap-2 justify-center">
            Voir les tarifs
          </Link>
          <Link href="/challenges" className="btn-secondary py-3 px-6 flex items-center gap-2 justify-center">
            <ArrowLeft className="w-4 h-4" /> Retour aux challenges
          </Link>
        </div>
      </div>
    </div>
  );
}
