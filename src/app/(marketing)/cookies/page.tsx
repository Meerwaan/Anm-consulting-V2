import type { Metadata } from "next";
import { LegalPage, Section } from "@/components/legal/LegalPage";
import { COOKIES, EDITEUR } from "@/content/legal";

export const metadata: Metadata = {
  title: "Cookies — ANM Consulting",
  description: "Les traceurs utilisés par le site ANM Consulting, et pourquoi il n'y a pas de bandeau.",
  robots: { index: false },
};

const soumisAConsentement = COOKIES.filter((c) => c.consentementRequis);

export default function CookiesPage() {
  return (
    <LegalPage
      titre="Cookies"
      chapeau="La liste complète des traceurs déposés par ce site."
    >
      {soumisAConsentement.length === 0 ? (
        <Section titre="Pourquoi vous n'avez pas vu de bandeau">
          <p>
            Ce site ne dépose aucun traceur publicitaire, aucun bouton de réseau social et aucun
            outil de mesure d&apos;audience tiers. Le seul cookie utilisé sert à vous maintenir
            connecté à votre espace client.
          </p>
          <p>
            La réglementation n&apos;impose le recueil du consentement que pour les traceurs qui ne
            sont pas strictement nécessaires au service demandé. Les mécanismes
            d&apos;authentification en sont expressément exemptés. Un bandeau qui demanderait votre
            accord pour un cookie de session serait donc inutile — et trompeur, puisque vous ne
            pourriez pas le refuser sans perdre l&apos;accès à votre dossier.
          </p>
        </Section>
      ) : null}

      <Section titre="Traceurs utilisés">
        <ul className="space-y-4">
          {COOKIES.map((c) => (
            <li key={c.nom} className="border-t border-[var(--anm-hairline)] pt-3">
              <strong className="text-[var(--anm-ink)]">{c.nom}</strong>
              <p className="text-[var(--anm-muted)]">{c.finalite}</p>
              <p className="font-mono text-xs text-[var(--anm-muted)]">
                Durée : {c.duree} ·{" "}
                {c.consentementRequis ? "Consentement requis" : `Exempté — ${c.motifExemption}`}
              </p>
            </li>
          ))}
        </ul>
      </Section>

      <Section titre="Si cela change">
        <p>
          L&apos;ajout d&apos;un outil de mesure d&apos;audience, de publicité ou de remarketing
          rendrait le recueil du consentement obligatoire, avec un refus aussi simple que
          l&apos;acceptation. Cette page serait alors mise à jour avant l&apos;activation de
          l&apos;outil, pas après. Pour toute question : {EDITEUR.email}.
        </p>
      </Section>
    </LegalPage>
  );
}
