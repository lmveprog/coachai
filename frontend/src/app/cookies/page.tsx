import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique cookies",
  robots: { index: false, follow: false },
};

export default function CookiesPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black text-slate-900 mb-2">Politique cookies</h1>
      <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : 12 mars 2026</p>

      <div className="space-y-10 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">1. Qu&apos;est-ce qu&apos;un cookie ?</h2>
          <p>
            Un cookie est un petit fichier texte déposé sur votre terminal (ordinateur, smartphone, tablette) lors de votre visite sur un site web.
            Il permet au site de mémoriser des informations sur votre visite et de vous reconnaître lors de votre prochaine connexion.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">2. Cookies utilisés par CoachAI</h2>

          <div className="space-y-4 mt-3">
            <div className="glass rounded-xl p-5 border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-green-100 text-green-700">Strictement nécessaires</span>
                <span className="text-xs text-slate-400">Toujours actifs</span>
              </div>
              <p className="text-sm">Ces cookies sont indispensables au fonctionnement du site. Ils ne peuvent pas être désactivés.</p>
              <table className="w-full text-xs mt-3 border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-2 border border-slate-100 font-semibold">Nom</th>
                    <th className="text-left p-2 border border-slate-100 font-semibold">Finalité</th>
                    <th className="text-left p-2 border border-slate-100 font-semibold">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-100 font-mono">access_token</td>
                    <td className="p-2 border border-slate-100">Authentification JWT (localStorage)</td>
                    <td className="p-2 border border-slate-100">1 heure</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-100 font-mono">refresh_token</td>
                    <td className="p-2 border border-slate-100">Renouvellement de session</td>
                    <td className="p-2 border border-slate-100">30 jours</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="glass rounded-xl p-5 border border-blue-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">Fonctionnels</span>
                <span className="text-xs text-slate-400">Toujours actifs</span>
              </div>
              <p className="text-sm">Ces cookies mémorisent vos préférences pour améliorer votre expérience.</p>
              <table className="w-full text-xs mt-3 border-collapse">
                <thead>
                  <tr className="bg-slate-50">
                    <th className="text-left p-2 border border-slate-100 font-semibold">Nom</th>
                    <th className="text-left p-2 border border-slate-100 font-semibold">Finalité</th>
                    <th className="text-left p-2 border border-slate-100 font-semibold">Durée</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td className="p-2 border border-slate-100 font-mono">theme</td>
                    <td className="p-2 border border-slate-100">Préférence thème (clair/sombre)</td>
                    <td className="p-2 border border-slate-100">1 an</td>
                  </tr>
                  <tr>
                    <td className="p-2 border border-slate-100 font-mono">editor_lang</td>
                    <td className="p-2 border border-slate-100">Langage préféré dans l&apos;éditeur</td>
                    <td className="p-2 border border-slate-100">1 an</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="glass rounded-xl p-5 border border-amber-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-amber-100 text-amber-700">Analytiques</span>
                <span className="text-xs text-slate-400">Avec consentement</span>
              </div>
              <p className="text-sm">Ces cookies nous aident à comprendre comment les visiteurs utilisent le site (pages vues, sessions, etc.). Aucune donnée personnelle identifiable n&apos;est partagée.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">3. Gestion de vos préférences</h2>
          <p>
            Vous pouvez à tout moment modifier vos préférences cookies depuis les paramètres de votre navigateur :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1 text-sm">
            <li><a href="https://support.google.com/chrome/answer/95647" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Google Chrome</a></li>
            <li><a href="https://support.mozilla.org/fr/kb/protection-renforcee-contre-le-pistage-firefox" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Mozilla Firefox</a></li>
            <li><a href="https://support.apple.com/fr-fr/guide/safari/sfri11471/mac" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Safari</a></li>
          </ul>
          <p className="mt-3 text-sm bg-amber-50 border border-amber-100 rounded-xl p-4 text-amber-800">
            ⚠️ La désactivation des cookies strictement nécessaires peut altérer le fonctionnement de la plateforme (déconnexion automatique, perte de session).
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">4. Contact</h2>
          <p>
            Pour toute question concernant notre utilisation des cookies :{" "}
            <a href="mailto:privacy@coachai.dev" className="text-blue-600 hover:underline">privacy@coachai.dev</a>
          </p>
        </section>
      </div>
    </div>
  );
}
