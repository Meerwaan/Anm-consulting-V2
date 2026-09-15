import type { Metadata } from "next";
import { Bouton } from "@/components/vitrine/Bouton";
import { Cascade, Element, Reveal } from "@/components/vitrine/Reveal";
import { Conteneur, Filet, SectionHead } from "@/components/vitrine/SectionHead";
import { CtaFinal, PourQui, RegleOr } from "@/components/vitrine/Sections";
import { POSITIONNEMENT } from "@/content/piliers";
import { OBJECTIFS } from "@/content/vision";
import { CONSULTANTE } from "@/content/vitrine";

export const metadata: Metadata = {
  title: "À propos",
  description:
    "Vingt ans de direction d'entreprise de sécurité privée, une méthode, une ligne de crête : ce que je fais, ce que je ne fais pas, et pourquoi.",
  alternates: { canonical: "/a-propos" },
};

const ENGAGEMENTS = [
  { titre: "Des faits, pas des impressions", texte: "Chaque constat cite la pièce, la date, le salarié ou le site. Ce qui n'est pas prouvé n'est pas écrit." },
  { titre: "Une référence vérifiée, datée", texte: "Le texte applicable est cité et vérifié le jour de la mission. Pas de « il me semble que »." },
  { titre: "Jamais de promesse impossible", texte: "Personne ne garantit l'absence de redressement. Je garantis que vous saurez où vous en êtes, et quoi faire d'abord." },
  { titre: "Le renvoi au bon professionnel", texte: "Une question juridique ou fiscale réglementée va à l'avocat ou à l'expert-comptable. Je prépare le dossier, ils tranchent." },
  { titre: "Vos données restent les vôtres", texte: "Travail sur copies, hébergement en France, avenant RGPD à la lettre de mission, restitution ou suppression à la fin." },
  { titre: "Le code de déontologie de la profession", texte: "Celui de la sécurité privée, que j'ai appliqué comme dirigeante, et que j'applique comme consultante." },
] as const;

export default function AProposPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <Conteneur large className="relative grid gap-12 pb-20 pt-12 md:grid-cols-[0.8fr_1.2fr] md:items-center md:gap-20 md:pb-28 md:pt-20">
          <Reveal y={40}>
            <div className="relative aspect-[4/5] overflow-hidden rounded-[5px] border border-filet bg-papier shadow-flottant">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(220,239,229,0.9),transparent_60%)]" aria-hidden />
              <div className="absolute inset-x-0 bottom-0 p-6">
                <p className="etiquette">Portrait</p>
                <p className="mt-1 font-mono text-[12px] text-gris">[Photo de la dirigeante à insérer]</p>
              </div>
            </div>
          </Reveal>
          <div className="space-y-8">
            <Reveal y={16}>
              <p className="etiquette">{CONSULTANTE.titre}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display text-[2.8rem] leading-[1.02] text-encre md:text-[4rem]">
                {CONSULTANTE.prenomNom}. <em className="text-vert">Vingt ans de l&apos;autre côté de la table.</em>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-xl text-[17px] leading-relaxed text-encre-2">{CONSULTANTE.accroche}</p>
            </Reveal>
            <Reveal delay={0.15}>
              <p className="max-w-xl border-l-2 border-vert pl-5 font-display text-[1.4rem] italic leading-snug text-encre">{CONSULTANTE.citation}</p>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="max-w-xl text-[15px] leading-relaxed text-gris">{POSITIONNEMENT.phraseCle}</p>
            </Reveal>
          </div>
        </Conteneur>
      </section>

      <section className="bg-papier">
        <Conteneur className="py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHead index="01" eyebrow="Parcours" titre={<>Ce que j&apos;ai dirigé, <em className="text-vert">avant de l&apos;auditer.</em></>} sous="[Bio à recevoir de la dirigeante : parcours, dates, ce qu'elle veut dire d'elle.]" />
            <div>
              <Filet epais />
              <ol>
                {CONSULTANTE.parcours.map((p, i) => (
                  <Reveal key={`${p.periode}-${i}`} delay={i * 0.06}>
                    <li className="grid gap-2 border-b border-filet py-6 md:grid-cols-[9rem_1fr] md:gap-8">
                      <span className="font-mono text-[12px] uppercase tracking-[0.12em] text-gris md:pt-1.5">{p.periode}</span>
                      <div className="space-y-1.5">
                        <h3 className="font-display text-[1.5rem] leading-tight text-encre">{p.poste}</h3>
                        <p className="text-[14.5px] leading-relaxed text-encre-2">{p.detail}</p>
                      </div>
                    </li>
                  </Reveal>
                ))}
              </ol>
            </div>
          </div>
        </Conteneur>
      </section>

      <section>
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="02"
            eyebrow="Pourquoi ce métier"
            titre={<>Cinq objectifs, <em className="text-vert">dans cet ordre.</em></>}
            aligne="deux"
            sous="Ce que j'ai vu manquer aux dirigeants pendant vingt ans, et ce que je veux leur apporter maintenant."
          />
          <div className="mt-14">
            <Filet epais />
            {OBJECTIFS.map((o, i) => (
              <Reveal key={o.n} delay={i * 0.04}>
                <div className="grid gap-2 border-b border-filet py-6 md:grid-cols-[4rem_1fr_1.4fr] md:gap-8">
                  <span className="font-display text-[2rem] leading-none text-vert">0{o.n}</span>
                  <h3 className="font-display text-[1.5rem] leading-tight text-encre">{o.titre}</h3>
                  <p className="text-[15px] leading-relaxed text-encre-2">{o.texte}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </Conteneur>
      </section>

      <section className="bg-encre text-papier">
        <Conteneur className="py-24 md:py-32">
          <SectionHead index="03" eyebrow="Engagements" titre={<>Ce que vous pouvez <em className="text-menthe">exiger de moi.</em></>} sombre aligne="deux" sous="Six règles, écrites dans la lettre de mission et rappelées dans chaque rapport." />
          <Cascade className="mt-14 grid gap-px overflow-hidden rounded-[5px] border border-nuit bg-nuit sm:grid-cols-2 lg:grid-cols-3" pas={0.08}>
            {ENGAGEMENTS.map((e, i) => (
              <Element key={e.titre} className="space-y-3 bg-encre p-6 md:p-7">
                <span className="font-mono text-[11px] text-brume">0{i + 1}</span>
                <h3 className="font-display text-[1.35rem] leading-snug">{e.titre}</h3>
                <p className="text-[14px] leading-relaxed text-brume-2">{e.texte}</p>
              </Element>
            ))}
          </Cascade>
          <div className="mt-14 space-y-5 border-t border-nuit pt-10">
            <p className="etiquette text-brume">La chaîne que suit chaque constat</p>
            <RegleOr />
          </div>
        </Conteneur>
      </section>

      <section>
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="04"
            eyebrow="Pour qui, et jusqu'où"
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
                Découvrir l&apos;audit 360°
              </Bouton>
              <Bouton href="/contact" variante="lien">
                Me contacter directement
              </Bouton>
            </div>
          </Reveal>
        </Conteneur>
      </section>

      <CtaFinal titre="On se parle ?" texte="Trente minutes pour comprendre votre situation. Je vous dis honnêtement si je peux vous aider, et par quoi commencer." />
    </>
  );
}
