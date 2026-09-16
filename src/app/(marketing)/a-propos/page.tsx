import type { Metadata } from "next";
import { Bouton } from "@/components/vitrine/Bouton";
import { Cascade, Element, Reveal } from "@/components/vitrine/Reveal";
import { Conteneur, Filet, SectionHead } from "@/components/vitrine/SectionHead";
import { Citation, ControlesVecus, CtaFinal, PourQui, RegleOr } from "@/components/vitrine/Sections";
import { POSITIONNEMENT } from "@/content/piliers";
import { OBJECTIFS } from "@/content/vision";
import { CONSULTANTE, CONTROLES_VECUS } from "@/content/vitrine";

export const metadata: Metadata = {
  title: `À propos — ${CONSULTANTE.prenomNom}`,
  description:
    "Vingt et un ans à la tête d’une PME de sécurité privée, une quarantaine de contrôles vécus, une méthode, une ligne de crête : ce que je fais, ce que je ne fais pas, et pourquoi.",
  alternates: { canonical: "/a-propos" },
};

const ENGAGEMENTS = [
  { titre: "Des faits, pas des impressions", texte: "Chaque constat cite la pièce, la date, le salarié ou le site. Ce qui n’est pas prouvé n’est pas écrit." },
  { titre: "Une référence vérifiée, datée", texte: "Le texte applicable est cité et vérifié le jour de la mission. Pas de « il me semble que »." },
  { titre: "Jamais de promesse impossible", texte: "Personne ne garantit l’absence de redressement. Je garantis que vous saurez où vous en êtes, et quoi faire d’abord." },
  { titre: "Le renvoi au bon professionnel", texte: "Une question juridique ou fiscale réglementée va à l’avocat ou à l’expert-comptable. Je prépare le dossier, ils tranchent." },
  { titre: "Vos données restent les vôtres", texte: "Travail sur copies, hébergement en France, avenant RGPD à la lettre de mission, restitution ou suppression à la fin." },
  { titre: "Le code de déontologie de la profession", texte: "Celui de la sécurité privée, que j’ai appliqué comme dirigeante, et que j’applique comme consultante." },
] as const;

export default function AProposPage() {
  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <Conteneur large className="relative grid gap-12 pb-20 pt-12 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-20 md:pb-28 md:pt-20">
          <Reveal y={40}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[5px] border border-filet bg-papier shadow-flottant">
              <div className="absolute inset-x-0 bottom-0 flex items-end justify-between p-6">
                <div>
                  <p className="etiquette">Portrait</p>
                  <p className="mt-1 font-display text-t4 text-encre">{CONSULTANTE.prenomNom}</p>
                </div>
                <p className="font-mono text-etiquette text-gris">[Photo à insérer]</p>
              </div>
            </div>
          </Reveal>
          <div className="space-y-8">
            <Reveal y={16}>
              <p className="etiquette">{CONSULTANTE.titre}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display text-t1 text-encre md:text-t1-lg">
                {CONSULTANTE.prenomNom}. <em className="text-vert">J’ai été dirigeante. Aujourd’hui, je mets cette expérience au service des PME.</em>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <div className="max-w-xl space-y-4 text-chapo text-encre-2">
                {CONSULTANTE.bio.slice(0, 2).map((paragraphe) => (
                  <p key={paragraphe}>{paragraphe}</p>
                ))}
              </div>
            </Reveal>
            <Reveal delay={0.15}>
              <Citation texte={CONSULTANTE.citation} />
            </Reveal>
          </div>
        </Conteneur>
      </section>

      {/* CONTRÔLES VÉCUS */}
      <section className="bg-papier">
        <Conteneur className="py-24 md:py-32">
          <SectionHead index="01" eyebrow="Le vécu" titre={CONTROLES_VECUS.titre} sous={CONTROLES_VECUS.intro} aligne="deux" />
          <div className="mt-14">
            <ControlesVecus />
          </div>
        </Conteneur>
      </section>

      {/* PARCOURS + SUITE DE LA BIO */}
      <section>
        <Conteneur className="py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <div className="space-y-8">
              <SectionHead index="02" eyebrow="Parcours" titre={<>Ce que j’ai dirigé, <em className="text-vert">avant de l’auditer.</em></>} />
              <Reveal delay={0.05}>
                <div className="space-y-4 text-corps text-encre-2">
                  {CONSULTANTE.bio.slice(2).map((paragraphe, i) => (
                    <p key={paragraphe} className={i === CONSULTANTE.bio.length - 3 ? "font-medium text-encre" : ""}>
                      {paragraphe}
                    </p>
                  ))}
                </div>
              </Reveal>
            </div>
            <div>
              <Filet epais />
              <ol>
                {CONSULTANTE.parcours.map((p, i) => (
                  <Reveal key={p.periode} delay={i * 0.06}>
                    <li className="grid gap-2 border-b border-filet py-6 md:grid-cols-[9rem_1fr] md:gap-8">
                      <span className="font-mono text-note uppercase tracking-[0.12em] text-gris md:pt-1.5">{p.periode}</span>
                      <div className="space-y-1.5">
                        <h3 className="font-display text-t3 text-encre">{p.poste}</h3>
                        <p className="text-corps text-encre-2">{p.detail}</p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </Conteneur>
      </section>

      {/* OBJECTIFS */}
      <section className="bg-papier">
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="03"
            eyebrow="Pourquoi ce métier"
            titre={<>Cinq objectifs, <em className="text-vert">dans cet ordre.</em></>}
            aligne="deux"
            sous="Ce que j’ai vu manquer aux dirigeants pendant vingt et un ans, et ce que je veux leur apporter maintenant."
          />
          <div className="mt-14">
            <Filet epais />
            {OBJECTIFS.map((o, i) => (
              <Reveal key={o.n} delay={i * 0.04}>
                <div className="grid gap-2 border-b border-filet py-6 md:grid-cols-[4rem_1fr_1.4fr] md:gap-8">
                  <span className="font-display text-chiffre leading-none text-vert">0{o.n}</span>
                  <h3 className="font-display text-t3 text-encre">{o.titre}</h3>
                  <p className="text-corps text-encre-2">{o.texte}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Conteneur>
      </section>

      {/* ENGAGEMENTS */}
      <section className="bg-encre text-papier">
        <Conteneur className="py-24 md:py-32">
          <SectionHead index="04" eyebrow="Engagements" titre={<>Ce que vous pouvez <em className="text-menthe">exiger de moi.</em></>} sombre aligne="deux" sous="Six règles, écrites dans la lettre de mission et rappelées dans chaque rapport." />
          <Cascade className="mt-14 grid gap-px overflow-hidden rounded-[5px] border border-nuit bg-nuit sm:grid-cols-2 lg:grid-cols-3" pas={0.08}>
            {ENGAGEMENTS.map((e, i) => (
              <Element key={e.titre} className="space-y-3 bg-encre p-6 md:p-7">
                <span className="font-mono text-etiquette text-brume">0{i + 1}</span>
                <h3 className="font-display text-t4">{e.titre}</h3>
                <p className="text-corps text-brume-2">{e.texte}</p>
              </Element>
            ))}
          </Cascade>
          <div className="mt-14 space-y-5 border-t border-nuit pt-10">
            <p className="etiquette text-brume">La chaîne que suit chaque constat</p>
            <RegleOr />
          </div>
        </Conteneur>
      </section>

      {/* LIGNE DE CRÊTE */}
      <section>
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="05"
            eyebrow="Pour qui, et jusqu’où"
            titre={<>Ma ligne de crête, <em className="text-vert">noir sur blanc.</em></>}
            aligne="deux"
            sous={POSITIONNEMENT.limite}
          />
          <div className="mt-14">
            <PourQui />
          </div>
          <Reveal delay={0.1}>
            <div className="mt-12 flex flex-wrap items-center gap-6">
              <Bouton href="/audit" taille="lg">
                Découvrir l’audit 360°
              </Bouton>
              <Bouton href="/contact" variante="lien">
                Me contacter directement
              </Bouton>
            </div>
          </Reveal>
        </Conteneur>
      </section>

      <CtaFinal titre={CONSULTANTE.invitation} texte="Trente minutes pour comprendre votre situation. Je vous dis honnêtement si je peux vous aider, et par quoi commencer." />
    </>
  );
}
