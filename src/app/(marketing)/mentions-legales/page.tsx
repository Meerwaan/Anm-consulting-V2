import type { Metadata } from "next";
import { LegalPage, Section, Definitions } from "@/components/legal/LegalPage";
import { EDITEUR, HEBERGEUR, ACTIVITE_REGLEMENTEE } from "@/content/legal";

export const metadata: Metadata = {
  title: "Mentions légales — ANM Consulting",
  description: "Éditeur, hébergeur et responsabilité du site ANM Consulting.",
  robots: { index: false },
};

export default function MentionsLegalesPage() {
  return (
    <LegalPage
      titre="Mentions légales"
      chapeau="Informations exigées par l'article 6-III de la loi pour la confiance dans l'économie numérique."
    >
      <Section titre="Éditeur du site">
        <Definitions
          items={[
            { label: "Dénomination", value: EDITEUR.denomination },
            { label: "Forme juridique", value: EDITEUR.formeJuridique },
            { label: "Capital social", value: EDITEUR.capitalSocial },
            { label: "Siège social", value: EDITEUR.siege },
            { label: "RCS", value: EDITEUR.rcs },
            { label: "SIREN", value: EDITEUR.siren },
            { label: "TVA intracom.", value: EDITEUR.tvaIntracommunautaire },
            { label: "Directeur de la publication", value: EDITEUR.directeurPublication },
            { label: "Email", value: EDITEUR.email },
            { label: "Téléphone", value: EDITEUR.telephone },
          ]}
        />
      </Section>

      <Section titre="Hébergeur">
        <Definitions
          items={[
            { label: "Société", value: HEBERGEUR.nom },
            { label: "Adresse", value: HEBERGEUR.adresse },
            { label: "Contact", value: HEBERGEUR.contact },
          ]}
        />
      </Section>

      {ACTIVITE_REGLEMENTEE.numeroDeclarationActivite ? (
        <Section titre="Activité de formation">
          <p>
            Déclaration d&apos;activité de formation enregistrée sous le numéro{" "}
            {ACTIVITE_REGLEMENTEE.numeroDeclarationActivite} auprès du préfet de région. Cet
            enregistrement ne vaut pas agrément de l&apos;État.
          </p>
        </Section>
      ) : null}

      <Section titre="Nature des prestations">
        <p>
          ANM Consulting réalise des missions d&apos;audit documentaire et opérationnel, de
          diagnostic, de prévention et d&apos;accompagnement organisationnel auprès des entreprises
          de sécurité privée.
        </p>
        <p>
          Ces prestations ne constituent ni une consultation juridique ou fiscale réglementée, ni
          une mission comptable, ni une représentation devant une administration ou une
          juridiction. Les rapports remis exposent des constats, des niveaux de risque et des
          recommandations au regard des pièces examinées et des références vérifiées à la date de
          la mission. Ils ne constituent ni une décision d&apos;une administration, ni une garantie
          d&apos;absence de contrôle, de redressement ou de sanction. Les questions relevant du
          conseil juridique ou fiscal réglementé sont orientées vers un avocat ou un
          expert-comptable.
        </p>
      </Section>

      <Section titre="Propriété intellectuelle">
        <p>
          Les contenus de ce site — textes, méthodes d&apos;audit, référentiels de points de
          contrôle, modèles de rapport, supports de formation — sont protégés. Toute reproduction ou
          réutilisation, même partielle, sans autorisation écrite préalable est interdite.
        </p>
      </Section>

      <Section titre="Données personnelles et cookies">
        <p>
          Le traitement des données personnelles est décrit dans la{" "}
          <a className="underline" href="/confidentialite">
            politique de confidentialité
          </a>
          . L&apos;usage des traceurs est détaillé sur la page{" "}
          <a className="underline" href="/cookies">
            cookies
          </a>
          .
        </p>
      </Section>
    </LegalPage>
  );
}
