import type { Metadata } from "next";
import { LegalPage, Section } from "@/components/legal/LegalPage";
import { EDITEUR, SOUS_TRAITANTS, TRAITEMENTS } from "@/content/legal";

export const metadata: Metadata = {
  title: "Politique de confidentialité — ANM Consulting",
  description:
    "Quelles données ANM Consulting collecte, pourquoi, combien de temps, et comment exercer vos droits.",
  robots: { index: false },
};

export default function ConfidentialitePage() {
  return (
    <LegalPage
      titre="Politique de confidentialité"
      chapeau="Ce que nous collectons, pourquoi, combien de temps nous le gardons, et comment vous gardez la main."
    >
      <Section titre="Qui est responsable">
        <p>
          {EDITEUR.denomination} est responsable des traitements décrits ci-dessous. Pour toute
          question ou pour exercer vos droits : {EDITEUR.email}.
        </p>
        <p className="rounded border-l-2 border-[var(--anm-green)] bg-[var(--anm-mint)] px-4 py-3">
          <strong>Une exception importante.</strong> Pendant une mission d&apos;audit, les pièces
          que vous nous transmettez contiennent des données concernant <em>vos</em> salariés :
          cartes professionnelles, plannings, bulletins de paie, suivi de santé. Sur ces données,
          vous restez responsable de traitement et ANM Consulting agit comme sous-traitant, au sens
          de l&apos;article 28 du RGPD. Cette répartition est formalisée dans un avenant à la lettre
          de mission, qui précise nos obligations, la durée de conservation et les conditions de
          restitution ou de suppression.
        </p>
      </Section>

      <Section titre="Ce que nous traitons">
        <div className="space-y-6">
          {TRAITEMENTS.map((t) => (
            <div key={t.id} className="border-t border-[var(--anm-hairline)] pt-4">
              <h3 className="font-medium text-[var(--anm-ink)]">{t.nom}</h3>
              <dl className="mt-2 space-y-1 text-[var(--anm-muted)]">
                <div>
                  <dt className="inline font-mono text-xs uppercase">Finalité — </dt>
                  <dd className="inline">{t.finalite}</dd>
                </div>
                <div>
                  <dt className="inline font-mono text-xs uppercase">Données — </dt>
                  <dd className="inline">{t.donnees}</dd>
                </div>
                <div>
                  <dt className="inline font-mono text-xs uppercase">Base légale — </dt>
                  <dd className="inline">{t.baseLegale}</dd>
                </div>
                <div>
                  <dt className="inline font-mono text-xs uppercase">Conservation — </dt>
                  <dd className="inline">{t.conservation}</dd>
                </div>
              </dl>
            </div>
          ))}
        </div>
      </Section>

      <Section titre="Qui d'autre y a accès">
        <p>
          Nous ne vendons ni ne louons aucune donnée. Nous faisons appel aux prestataires suivants,
          strictement pour faire fonctionner le service :
        </p>
        <ul className="space-y-2">
          {SOUS_TRAITANTS.map((s) => (
            <li key={s.nom} className="border-l-2 border-[var(--anm-hairline)] pl-4">
              <strong>{s.nom}</strong> — {s.role}.{" "}
              <span className="text-[var(--anm-muted)]">
                {s.pays} · {s.garantie}
              </span>
            </li>
          ))}
        </ul>
        <p>
          La base de données et les pièces déposées sont hébergées dans l&apos;Union européenne
          (région de Paris). Chaque client ne peut accéder qu&apos;à son propre dossier :
          le cloisonnement est appliqué au niveau de la base elle-même, pas seulement de
          l&apos;interface.
        </p>
      </Section>

      <Section titre="Vos droits">
        <p>
          Vous disposez d&apos;un droit d&apos;accès, de rectification, d&apos;effacement, de
          limitation, d&apos;opposition et de portabilité. Écrivez à {EDITEUR.email} : nous répondons
          sous un mois.
        </p>
        <p>
          Si la réponse ne vous satisfait pas, vous pouvez saisir la CNIL —{" "}
          <a className="underline" href="https://www.cnil.fr/fr/plaintes">
            cnil.fr/fr/plaintes
          </a>{" "}
          — 3 place de Fontenoy, TSA 80715, 75334 Paris Cedex 07.
        </p>
      </Section>

      <Section titre="Sécurité">
        <p>
          Connexion par lien à usage unique (pas de mot de passe à retenir ni à fuiter), chiffrement
          des échanges, cloisonnement des données par organisation au niveau de la base, et accès
          aux pièces limité aux personnes concernées par la mission. Les notes de travail internes
          ne sont visibles par un client que lorsqu&apos;elles ont été explicitement publiées.
        </p>
      </Section>
    </LegalPage>
  );
}
