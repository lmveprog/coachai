import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Mentions légales",
  robots: { index: false, follow: false },
};

export default function LegalPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <h1 className="text-3xl font-black text-slate-900 mb-2">Mentions légales</h1>
      <p className="text-slate-500 text-sm mb-10">Dernière mise à jour : 12 mars 2026</p>

      <div className="prose prose-slate max-w-none space-y-10">
        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">1. Éditeur du site</h2>
          <p className="text-slate-600 leading-relaxed">
            Le site <strong>CoachAI</strong> (accessible à l&apos;adresse https://coachai.dev) est édité par :<br /><br />
            <strong>CoachAI SAS</strong><br />
            Société par actions simplifiée au capital de 1 000 €<br />
            RCS Paris — SIRET : en cours d&apos;immatriculation<br />
            Siège social : Paris, France<br />
            Contact : <a href="mailto:contact@coachai.dev" className="text-blue-600 hover:underline">contact@coachai.dev</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">2. Directeur de la publication</h2>
          <p className="text-slate-600 leading-relaxed">
            Le directeur de la publication est le représentant légal de CoachAI SAS.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">3. Hébergement</h2>
          <p className="text-slate-600 leading-relaxed">
            Le site est hébergé par :<br /><br />
            <strong>Vercel Inc.</strong><br />
            340 Pine Street, Suite 700, San Francisco, CA 94104, USA<br />
            <a href="https://vercel.com" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">https://vercel.com</a>
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">4. Propriété intellectuelle</h2>
          <p className="text-slate-600 leading-relaxed">
            L&apos;ensemble du contenu du site CoachAI (textes, images, logos, challenges, formations, code source) est protégé par le droit d&apos;auteur et appartient à CoachAI SAS ou à ses partenaires.
            Toute reproduction, représentation, modification ou exploitation, même partielle, sans autorisation écrite préalable est strictement interdite.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">5. Données personnelles</h2>
          <p className="text-slate-600 leading-relaxed">
            Conformément au Règlement Général sur la Protection des Données (RGPD) et à la loi Informatique et Libertés, vous disposez d&apos;un droit d&apos;accès, de rectification et de suppression de vos données personnelles.
            Pour exercer ces droits, contactez-nous à <a href="mailto:privacy@coachai.dev" className="text-blue-600 hover:underline">privacy@coachai.dev</a>.
            Pour plus d&apos;informations, consultez notre <a href="/privacy" className="text-blue-600 hover:underline">Politique de confidentialité</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">6. Cookies</h2>
          <p className="text-slate-600 leading-relaxed">
            Le site utilise des cookies techniques nécessaires à son fonctionnement et des cookies analytiques avec votre consentement.
            Pour plus d&apos;informations, consultez notre <a href="/cookies" className="text-blue-600 hover:underline">Politique cookies</a>.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">7. Limitation de responsabilité</h2>
          <p className="text-slate-600 leading-relaxed">
            CoachAI SAS s&apos;efforce de fournir des informations exactes et à jour sur son site. Toutefois, CoachAI SAS ne peut garantir l&apos;exactitude, la complétude ou l&apos;actualité des informations diffusées.
            CoachAI SAS décline toute responsabilité pour les interruptions ou indisponibilités du service.
          </p>
        </section>

        <section>
          <h2 className="text-xl font-bold text-slate-900 mb-3">8. Droit applicable</h2>
          <p className="text-slate-600 leading-relaxed">
            Les présentes mentions légales sont soumises au droit français. En cas de litige, les tribunaux français sont seuls compétents.
          </p>
        </section>
      </div>
    </div>
  );
}
