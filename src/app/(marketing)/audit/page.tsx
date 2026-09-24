import type { Metadata } from "next";
import { Bouton } from "@/components/vitrine/Bouton";
import { Estimateur } from "@/components/vitrine/Estimateur";
import { Etapes } from "@/components/vitrine/Etapes";
import { FAQ } from "@/components/vitrine/FAQ";
import { FicheConstat } from "@/components/vitrine/FicheConstat";
import { Cascade, Element, Reveal } from "@/components/vitrine/Reveal";
import { Conteneur, SectionHead } from "@/components/vitrine/SectionHead";
import { CtaFinal, EchelleCriticite, Livrables, Piliers, RegleOr, Tarifs } from "@/components/vitrine/Sections";
import { AXES_RAPPORT } from "@/content/vision";
import { FAQ as FAQ_ITEMS } from "@/content/vitrine";

export const metadata: Metadata = {
  title: "Audit & diagnostic 360° sécurité privée",
  description:
    "Cinq piliers, 208 points de contrôle, 15 étapes du cadrage à la restitution. Audits CNAPS, social / URSSAF, Inspection du travail, préparation contrôle fiscal, audit 360°. Grille tarifaire publique.",
  alternates: { canonical: "/audit" },
};

const ECHANTILLON = [
  { titre: "Calibré sur votre effectif", texte: "Assez de dossiers pour que le résultat soit représentatif, pas plus. La taille suit l’entreprise, pas un forfait." },
  { titre: "Les profils qu’un contrôleur cible", texte: "Nouvel embauché, temps partiel, travailleur de nuit, gros volume d’heures supplémentaires, salarié d’un sous-traitant : ceux qui portent le risque passent en premier." },
  { titre: "Sur copies, jamais sur originaux", texte: "Vos pièces restent chez vous. On travaille sur des copies datées, indexées, restituées ou détruites à la fin de la mission." },
] as const;

const RESTITUTION = [
  { titre: "Ce qui vous expose vraiment", texte: "Les écarts critiques et majeurs, avec la preuve et la référence. Le reste est dans le rapport, pas dans la réunion." },
  { titre: "Qui fait quoi, pour quand", texte: "Chaque action du plan a un responsable et une échéance validés avec vous, séance tenante." },
  { titre: "Ce qui part chez vos conseils", texte: "Les sujets qui relèvent de l’avocat ou de l’expert-comptable sont identifiés et leur sont transmis avec le dossier." },
] as const;

export default function AuditPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <Conteneur large className="relative grid gap-12 pb-20 pt-12 md:grid-cols-[1.1fr_0.9fr] md:items-center md:pb-28 md:pt-20">
          <div className="space-y-7">
            <Reveal y={16}>
              <p className="etiquette">Audit & diagnostic 360°</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display text-t1 text-encre md:text-t1-lg">
                Une photographie factuelle, <em className="text-vert">un plan daté.</em>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-xl text-chapo text-encre-2">
                L’audit 360° croise ce que cinq contrôleurs regarderaient séparément : planning, présence réelle, paie,
                facturation, situation réglementaire. Vous repartez avec des constats qui tiennent devant un contrôleur, et
                un plan d’actions avec un responsable et une échéance par ligne.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <Bouton href="/contact?offre=audit_360" taille="lg">
                  Demander un audit 360°
                </Bouton>
                <Bouton href="#tarifs" variante="lien">
                  Voir la grille tarifaire
                </Bouton>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2} y={40} className="md:w-full md:max-w-[460px] md:justify-self-end">
            <FicheConstat statique />
          </Reveal>
        </Conteneur>
      </section>

      {/* PILIERS */}
      <section className="bg-papier">
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="01"
            eyebrow="Le périmètre"
            titre={<>Cinq piliers, <em className="text-vert">208 points de contrôle.</em></>}
            sous="Chaque point de contrôle renvoie à un texte officiel vérifié et daté, et se croise avec les autres : planning, présence réelle, paie, facturation, situation réglementaire. Rien n’est improvisé sur place."
            aligne="deux"
          />
          <div className="mt-14">
            <Piliers />
          </div>
        </Conteneur>
      </section>

      {/* MÉTHODE 15 ÉTAPES */}
      <section id="methode" className="scroll-mt-20 bg-encre text-papier">
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="02"
            eyebrow="La méthode"
            titre={<>Quinze étapes, <em className="text-menthe">du premier entretien à la restitution.</em></>}
            sous="Le portail suit ces quinze étapes une à une. À chacune, ses points de contrôle, ses pièces et son indicateur « rien ne manque »."
            sombre
            aligne="deux"
          />
          <div className="mt-16 md:mt-20">
            <Etapes />
          </div>
          <div className="mt-20 space-y-5 border-t border-nuit pt-10">
            <p className="etiquette text-brume">La règle d’or, à chaque constat</p>
            <RegleOr />
          </div>
        </Conteneur>
      </section>

      {/* ÉCHANTILLON */}
      <section>
        <Conteneur className="py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <SectionHead
              index="03"
              eyebrow="L’échantillon"
              titre={<>On ne regarde pas tout. <em className="text-vert">On regarde ce qui porte le risque.</em></>}
              sous="Un contrôleur ne lit pas cent dossiers : il en choisit quelques-uns, et il sait lesquels. L’audit fait la même chose, avant lui."
            />
            <Cascade className="border-t-[1.5px] border-encre" pas={0.1}>
              {ECHANTILLON.map((e, i) => (
                <Element key={e.titre} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-filet py-6 md:gap-6" y={10}>
                  <span className="font-mono text-note text-gris md:pt-1.5">0{i + 1}</span>
                  <div className="space-y-2">
                    <h3 className="font-display text-t4 text-encre">{e.titre}</h3>
                    <p className="max-w-xl text-corps text-encre-2">{e.texte}</p>
                  </div>
                </Element>
              ))}
            </Cascade>
          </div>
        </Conteneur>
      </section>

      {/* CRITICITÉ */}
      <section className="bg-papier">
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="04"
            eyebrow="Classement des risques"
            titre={<>Quatre niveaux, <em className="text-vert">quatre délais.</em></>}
            sous="Un écart critique ne se traite pas comme une amélioration de forme. Le plan d’actions suit cette échelle : P1 immédiat, P2 sous 30 jours, P3 sous 90 jours, P4 en continu."
            aligne="deux"
          />
          <div className="mt-14">
            <EchelleCriticite />
          </div>
        </Conteneur>
      </section>

      {/* LIVRABLES */}
      <section>
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="05"
            eyebrow="Ce que vous recevez"
            titre={<>Un rapport qui se lit en dix minutes, <em className="text-vert">et qui tient devant un contrôleur.</em></>}
            aligne="deux"
            sous="Synthèse en deux axes pour le dirigeant, puis le détail classé par criticité pour votre avocat et votre expert-comptable."
          />
          <div className="mt-14">
            <Livrables />
          </div>
          <Reveal>
            <div className="mt-16">
              <p className="etiquette mb-4">Les deux axes de la synthèse dirigeant</p>
              <div className="grid gap-px overflow-hidden rounded-[5px] border border-filet bg-filet sm:grid-cols-2">
                {AXES_RAPPORT.map((a) => (
                  <div key={a.nature} className={`space-y-2 p-6 md:p-8 ${a.nature === "risque_controle" ? "bg-critique-l/50" : "bg-menthe-2"}`}>
                    <h3 className={`font-display text-t3 ${a.nature === "risque_controle" ? "text-critique" : "text-vert"}`}>{a.titre}</h3>
                    <p className="text-corps text-encre-2">{a.definition}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        </Conteneur>
      </section>

      {/* RESTITUTION */}
      <section className="bg-menthe-2">
        <Conteneur className="py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:gap-20">
            <SectionHead
              index="06"
              eyebrow="La restitution"
              titre={<>Une heure, <em className="text-vert">et vous savez quoi faire lundi.</em></>}
              sous="Pas de présentation de 80 slides. On traite ce qui compte, on décide qui fait quoi pour quand, et on repart avec une liste courte."
            />
            <Cascade className="rounded-[5px] border border-encre bg-papier" pas={0.08}>
              {RESTITUTION.map((r, i) => (
                <Element key={r.titre} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-filet px-6 py-5 last:border-0" y={10}>
                  <span className="font-mono text-note text-gris">0{i + 1}</span>
                  <div className="space-y-1">
                    <h3 className="font-display text-t4 text-encre">{r.titre}</h3>
                    <p className="text-corps text-encre-2">{r.texte}</p>
                  </div>
                </Element>
              ))}
            </Cascade>
          </div>
        </Conteneur>
      </section>

      {/* TARIFS + ESTIMATEUR */}
      <section id="tarifs" className="scroll-mt-20 bg-papier">
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="07"
            eyebrow="Grille tarifaire"
            titre={<>Des prix publics, <em className="text-vert">et une proposition ferme sous 48 h.</em></>}
            aligne="deux"
            sous="Six formats, du diagnostic flash d’une demi-journée à l’audit 360° sur cinq jours. La préparation au contrôle fiscal est sur devis : la charge dépend trop de votre comptabilité."
          />
          <div className="mt-14">
            <Tarifs avecLien={false} />
          </div>
          <div id="estimateur" className="mt-20 scroll-mt-28 grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-start">
            <Reveal>
              <div className="space-y-4 md:sticky md:top-28">
                <p className="etiquette">Estimateur</p>
                <h3 className="font-display text-t2 text-encre">Estimez votre mission.</h3>
                <p className="text-corps text-encre-2">
                  Majoration selon l’effectif (jusqu’à 1 800 € au-delà de 200 salariés), 180 € par site au-delà de deux,
                  20 % en cas d’urgence. Le fiscal n’est pas chiffrable ici : contactez-nous.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1} y={32}>
              <Estimateur />
            </Reveal>
          </div>
        </Conteneur>
      </section>

      {/* FAQ */}
      <section>
        <Conteneur className="py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHead index="08" eyebrow="Vos questions" titre={<>Ce qu’on nous demande <em className="text-vert">avant de signer.</em></>} />
            <Reveal delay={0.1}>
              <FAQ items={FAQ_ITEMS} />
            </Reveal>
          </div>
        </Conteneur>
      </section>

      <CtaFinal titre="Un contrôle se prépare. Commençons." cta="Demander un premier échange" />
    </>
  );
}
