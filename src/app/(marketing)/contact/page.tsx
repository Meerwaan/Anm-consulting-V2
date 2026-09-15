import type { Metadata } from "next";
import { FormulaireContact } from "@/components/vitrine/FormulaireContact";
import { Cascade, Element, Reveal } from "@/components/vitrine/Reveal";
import { Conteneur, Filet, SectionHead } from "@/components/vitrine/SectionHead";
import { EDITEUR } from "@/content/legal";
import { APRES_CONTACT } from "@/content/vitrine";

export const metadata: Metadata = {
  title: "Contact — demander un premier échange",
  description:
    "Trente minutes, sans engagement, pour identifier vos trois principaux risques et décider de la suite. Proposition écrite sous 48 h.",
  alternates: { canonical: "/contact" },
};

type Params = Record<string, string | string[] | undefined>;
const un = (v: string | string[] | undefined) => (Array.isArray(v) ? v[0] : v);

export default async function ContactPage({ searchParams }: { searchParams: Promise<Params> }) {
  const p = await searchParams;
  const prefill = {
    offre: un(p.offre),
    effectif: un(p.effectif),
    sites: un(p.sites),
    urgence: un(p.urgence),
    situation: un(p.situation),
  };

  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-32 size-[560px] rounded-full bg-menthe/50 blur-3xl" aria-hidden />
        <Conteneur large className="relative grid gap-14 pb-24 pt-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20 lg:pb-32 lg:pt-20">
          <div className="space-y-8">
            <Reveal y={16}>
              <p className="etiquette">Premier échange</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display text-[2.8rem] leading-[1.02] text-encre md:text-[3.8rem]">
                Parlons de <em className="text-vert">votre situation.</em>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-lg text-[16px] leading-relaxed text-encre-2">
                Trente minutes, sans engagement, pour identifier vos trois principaux risques et décider de la suite.
                Aucune promesse de garantie contre un redressement ou une sanction : des faits, une méthode, un plan.
              </p>
            </Reveal>

            <Reveal delay={0.15}>
              <div className="space-y-4">
                <p className="etiquette">Ce qui se passe ensuite</p>
                <Filet epais />
                <ol>
                  {APRES_CONTACT.map((a) => (
                    <li key={a.etape} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-filet py-4">
                      <span className="font-mono text-[12px] text-gris">{a.etape}</span>
                      <div className="space-y-1">
                        <h2 className="font-display text-[1.25rem] leading-snug text-encre">{a.titre}</h2>
                        <p className="text-[13.5px] leading-relaxed text-encre-2">{a.texte}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            </Reveal>

            <Reveal delay={0.2}>
              <Cascade className="grid gap-px overflow-hidden rounded-[5px] border border-filet bg-filet sm:grid-cols-2" pas={0.08}>
                <Element className="space-y-1.5 bg-papier p-5">
                  <p className="etiquette">Email</p>
                  <p className="text-[14px] text-encre">{EDITEUR.email}</p>
                </Element>
                <Element className="space-y-1.5 bg-papier p-5">
                  <p className="etiquette">Téléphone</p>
                  <p className="text-[14px] text-encre">{EDITEUR.telephone}</p>
                </Element>
                <Element className="space-y-1.5 bg-papier p-5">
                  <p className="etiquette">Interventions</p>
                  <p className="text-[14px] text-encre">France entière, sur site et à distance</p>
                </Element>
                <Element className="space-y-1.5 bg-papier p-5">
                  <p className="etiquette">Délai de réponse</p>
                  <p className="text-[14px] text-encre">48 h ouvrées, plus vite si un contrôle est annoncé</p>
                </Element>
              </Cascade>
            </Reveal>
          </div>

          <Reveal delay={0.1} y={32}>
            <div className="relative rounded-[5px] border border-encre bg-papier p-6 shadow-flottant md:p-10">
              <div className="absolute -inset-2 -z-10 rounded-[8px] bg-encre/[0.035]" aria-hidden />
              <FormulaireContact prefill={prefill} />
            </div>
          </Reveal>
        </Conteneur>
      </section>

      <section className="bg-papier">
        <Conteneur className="py-20 md:py-28">
          <div className="grid gap-10 md:grid-cols-[1fr_1fr] md:gap-20">
            <SectionHead
              eyebrow="Avocats, experts-comptables, prescripteurs"
              titre={<>Vous avez un client à orienter ? <em className="text-vert">Travaillons ensemble.</em></>}
              sous="Reconstitution des faits, structuration du dossier, rapprochements planning-paie-facturation : le travail de terrain qui rend vos consultations plus rapides et mieux fondées. Les questions réglementées, le contentieux et les travaux comptables restent les vôtres."
            />
            <Reveal delay={0.1}>
              <ul className="space-y-3 pt-2 md:pt-12">
                {[
                  "Un dossier indexé et daté avant votre analyse",
                  "Des constats formulés en faits, preuves et écarts, sans qualification juridique",
                  "Une restitution à laquelle vous êtes conviés si le client le souhaite",
                  "Aucune rétrocession, aucune exclusivité",
                ].map((t) => (
                  <li key={t} className="flex gap-3 text-[15px] leading-relaxed text-encre-2">
                    <span className="mt-[11px] h-px w-4 shrink-0 bg-vert" aria-hidden />
                    {t}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
        </Conteneur>
      </section>
    </>
  );
}
