import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Conditions Générales d'Utilisation",
  robots: { index: false, follow: false },
};

export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black text-slate-900 mb-2">Conditions Générales d&apos;Utilisation</h1>
      <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : 12 mars 2026 — Version 1.0</p>

      <div className="space-y-10 text-slate-600 leading-relaxed">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">1. Objet et acceptation</h2>
          <p>
            Les présentes Conditions Générales d&apos;Utilisation (CGU) régissent l&apos;accès et l&apos;utilisation de la plateforme CoachAI
            accessible à l&apos;adresse <strong>https://coachai.dev</strong>, éditée par CoachAI SAS.
          </p>
          <p className="mt-2">
            En créant un compte ou en utilisant le service, vous acceptez sans réserve les présentes CGU.
            Si vous n&apos;acceptez pas ces conditions, vous ne devez pas utiliser la plateforme.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">2. Description du service</h2>
          <p>
            CoachAI est une plateforme d&apos;apprentissage en ligne de la data science et de l&apos;intelligence artificielle, proposant :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Des challenges de programmation (SQL, Python, Machine Learning, etc.) avec évaluation automatisée</li>
            <li>Un système de classement ELO compétitif</li>
            <li>Des formations structurées avec cours et exercices pratiques</li>
            <li>Des badges et certifications vérifiables</li>
            <li>Un assistant IA pour l&apos;aide à l&apos;apprentissage</li>
          </ul>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">3. Inscription et compte</h2>
          <p>
            L&apos;accès à la plateforme nécessite la création d&apos;un compte. Vous vous engagez à :
          </p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Fournir des informations exactes et à jour lors de l&apos;inscription</li>
            <li>Maintenir la confidentialité de vos identifiants de connexion</li>
            <li>Être âgé(e) d&apos;au moins 16 ans</li>
            <li>Ne créer qu&apos;un seul compte par personne</li>
          </ul>
          <p className="mt-2">
            Vous êtes seul(e) responsable des activités réalisées depuis votre compte.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">4. Plans et abonnements</h2>
          <p><strong>Plan Gratuit :</strong> Accès limité à 3 challenges par jour, à des formations de base et au classement global. Gratuit sans limitation de durée.</p>
          <p className="mt-2"><strong>Plan Pro (15€/mois) :</strong> Accès illimité à tous les challenges, toutes les formations, aux certifications et aux bonus ELO. Facturation mensuelle via Stripe. Résiliable à tout moment depuis l&apos;espace client, sans frais.</p>
          <p className="mt-2">
            Les prix sont indiqués en euros TTC. CoachAI se réserve le droit de modifier ses tarifs avec un préavis de 30 jours.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">5. Droit de rétractation</h2>
          <p>
            Conformément à l&apos;article L221-28 du Code de la consommation, le droit de rétractation ne s&apos;applique pas aux contenus numériques dont l&apos;exécution a commencé avec votre accord exprès avant la fin du délai de rétractation.
          </p>
          <p className="mt-2">
            Toutefois, si l&apos;accès au contenu n&apos;a pas encore commencé, vous bénéficiez d&apos;un délai de 14 jours pour vous rétracter. Pour exercer ce droit, contactez <a href="mailto:billing@coachai.dev" className="text-blue-600 hover:underline">billing@coachai.dev</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">6. Règles de conduite</h2>
          <p>Il est strictement interdit de :</p>
          <ul className="list-disc list-inside mt-2 space-y-1">
            <li>Tricher ou utiliser des outils automatisés pour soumettre des solutions (bots, scripts)</li>
            <li>Partager les solutions complètes des challenges payants publiquement</li>
            <li>Utiliser la plateforme à des fins illégales ou contraires à l&apos;ordre public</li>
            <li>Tenter d&apos;accéder à des données d&apos;autres utilisateurs</li>
            <li>Surcharger délibérément les serveurs d&apos;évaluation</li>
          </ul>
          <p className="mt-2">
            Tout manquement peut entraîner la suspension immédiate du compte sans remboursement.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">7. Contenu utilisateur</h2>
          <p>
            En soumettant du code ou tout autre contenu sur la plateforme, vous accordez à CoachAI SAS une licence non-exclusive, gratuite et mondiale pour utiliser ce contenu dans le seul but d&apos;évaluer vos solutions et d&apos;améliorer le service.
            Vous conservez l&apos;intégralité de vos droits sur votre code.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">8. Disponibilité du service</h2>
          <p>
            CoachAI s&apos;efforce d&apos;assurer la disponibilité de la plateforme 24h/24 et 7j/7, mais ne garantit pas une disponibilité sans interruption.
            Des maintenances ponctuelles peuvent être nécessaires et seront annoncées au préalable dans la mesure du possible.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">9. Résiliation</h2>
          <p>
            Vous pouvez supprimer votre compte à tout moment depuis les paramètres de votre profil.
            CoachAI se réserve le droit de suspendre ou de résilier un compte en cas de violation des présentes CGU.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">10. Modification des CGU</h2>
          <p>
            CoachAI SAS se réserve le droit de modifier les présentes CGU à tout moment. Les modifications entrent en vigueur dès leur publication sur le site.
            Vous serez notifié par email en cas de modifications substantielles. La poursuite de l&apos;utilisation du service après modification vaut acceptation des nouvelles CGU.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">11. Droit applicable et juridiction</h2>
          <p>
            Les présentes CGU sont soumises au droit français. En cas de litige, et à défaut de résolution amiable, les tribunaux de Paris sont seuls compétents.
          </p>
          <p className="mt-2">
            Pour toute réclamation : <a href="mailto:contact@coachai.dev" className="text-blue-600 hover:underline">contact@coachai.dev</a>
          </p>
        </section>
      </div>
    </div>
  );
}
