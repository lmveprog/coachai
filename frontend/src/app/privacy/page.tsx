import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Politique de confidentialité",
  robots: { index: false, follow: false },
};

export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black text-slate-900 mb-2">Politique de confidentialité</h1>
      <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : 12 mars 2026 — Conforme au RGPD (Règlement UE 2016/679)</p>

      <div className="space-y-10 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">1. Responsable du traitement</h2>
          <p>
            Le responsable du traitement des données personnelles collectées via CoachAI est :<br /><br />
            <strong>CoachAI SAS</strong><br />
            Paris, France<br />
            Email : <a href="mailto:privacy@coachai.dev" className="text-blue-600 hover:underline">privacy@coachai.dev</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">2. Données collectées</h2>
          <p>Nous collectons les données suivantes :</p>
          <div className="mt-3 space-y-3">
            <div className="glass rounded-xl p-4 border border-blue-100">
              <p className="font-semibold text-slate-800 mb-1">Données d&apos;inscription</p>
              <p className="text-sm">Adresse email, nom d&apos;utilisateur, mot de passe (haché bcrypt). Obligatoires pour créer un compte.</p>
            </div>
            <div className="glass rounded-xl p-4 border border-blue-100">
              <p className="font-semibold text-slate-800 mb-1">Données d&apos;utilisation</p>
              <p className="text-sm">Score ELO, soumissions de code, progression dans les formations, badges obtenus, dates de connexion.</p>
            </div>
            <div className="glass rounded-xl p-4 border border-blue-100">
              <p className="font-semibold text-slate-800 mb-1">Données de paiement</p>
              <p className="text-sm">Gérées exclusivement par Stripe (PCI-DSS). Nous ne stockons que l&apos;identifiant client Stripe et le statut d&apos;abonnement.</p>
            </div>
            <div className="glass rounded-xl p-4 border border-blue-100">
              <p className="font-semibold text-slate-800 mb-1">Données techniques</p>
              <p className="text-sm">Adresse IP (anonymisée après 30 jours), navigateur, logs serveur pour la sécurité et le diagnostic.</p>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">3. Finalités et bases légales</h2>
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-blue-50">
                <th className="text-left p-3 font-semibold text-slate-700 border border-blue-100">Finalité</th>
                <th className="text-left p-3 font-semibold text-slate-700 border border-blue-100">Base légale</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-blue-50">
              {[
                ["Gestion du compte utilisateur", "Exécution du contrat"],
                ["Évaluation des soumissions de code", "Exécution du contrat"],
                ["Envoi d'emails transactionnels", "Exécution du contrat"],
                ["Gestion des paiements et abonnements", "Exécution du contrat"],
                ["Amélioration du service (analytics)", "Intérêt légitime"],
                ["Sécurité et prévention de la fraude", "Intérêt légitime / Obligation légale"],
                ["Emails marketing (newsletter)", "Consentement"],
              ].map(([fin, base]) => (
                <tr key={fin} className="hover:bg-slate-50">
                  <td className="p-3 border border-blue-50 text-slate-600">{fin}</td>
                  <td className="p-3 border border-blue-50 text-slate-500">{base}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">4. Durée de conservation</h2>
          <ul className="list-disc list-inside space-y-1">
            <li>Données de compte : durée de la relation contractuelle + 3 ans</li>
            <li>Données de paiement : 10 ans (obligation légale comptable)</li>
            <li>Logs techniques : 12 mois maximum</li>
            <li>Données d&apos;un compte supprimé : suppression sous 30 jours (sauf obligation légale)</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">5. Partage des données</h2>
          <p>Vos données ne sont jamais vendues. Elles peuvent être partagées avec :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Stripe</strong> — traitement des paiements (USA, Privacy Shield)</li>
            <li><strong>Vercel</strong> — hébergement (USA, clauses contractuelles types)</li>
            <li><strong>Resend</strong> — envoi d&apos;emails transactionnels (USA, clauses contractuelles types)</li>
            <li><strong>Groq</strong> — traitement IA pour le chatbot (USA, données anonymisées)</li>
          </ul>
          <p className="mt-2">
            Ces sous-traitants sont contractuellement tenus de respecter la confidentialité de vos données.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">6. Vos droits (RGPD)</h2>
          <p>Conformément au RGPD, vous disposez des droits suivants :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li><strong>Droit d&apos;accès</strong> : obtenir une copie de vos données</li>
            <li><strong>Droit de rectification</strong> : corriger des données inexactes</li>
            <li><strong>Droit à l&apos;effacement</strong> (&laquo;droit à l&apos;oubli&raquo;)</li>
            <li><strong>Droit à la portabilité</strong> : recevoir vos données dans un format standard</li>
            <li><strong>Droit d&apos;opposition</strong> : s&apos;opposer à certains traitements</li>
            <li><strong>Droit à la limitation</strong> : restreindre le traitement de vos données</li>
          </ul>
          <p className="mt-3">
            Pour exercer ces droits : <a href="mailto:privacy@coachai.dev" className="text-blue-600 hover:underline">privacy@coachai.dev</a>
            <br />Réponse sous 30 jours. Vous pouvez également contacter la CNIL (<a href="https://www.cnil.fr" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">www.cnil.fr</a>) en cas de litige.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">7. Sécurité</h2>
          <p>
            CoachAI met en œuvre des mesures techniques et organisationnelles pour protéger vos données :
            chiffrement HTTPS, mots de passe hachés (bcrypt), tokens JWT à durée limitée, accès restreint aux données en production, audits de sécurité réguliers.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">8. Cookies</h2>
          <p>
            Pour les informations sur les cookies utilisés, consultez notre <a href="/cookies" className="text-blue-600 hover:underline">Politique cookies</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
