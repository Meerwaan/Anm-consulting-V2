import type { Metadata } from "next";
import { Bouton } from "@/components/vitrine/Bouton";
import { LeadMagnet } from "@/components/vitrine/LeadMagnet";
import { Cascade, Element, Reveal } from "@/components/vitrine/Reveal";
import { Conteneur, Filet, SectionHead } from "@/components/vitrine/SectionHead";
import { CtaFinal } from "@/components/vitrine/Sections";
import { LIBELLE_OFFRE, NB_MODULES, PARCOURS, PROGRAMME_30_JOURS } from "@/content/formation";

export const metadata: Metadata = {
  title: "Centre de formation sécurité privée",
  description:
    "26 modules, 9 parcours : CNAPS, social et URSSAF, temps de travail, Inspection du travail, sous-traitance, fiscal. Vidéos, fiches, quiz, outils interactifs. Premier module gratuit.",
  alternates: { canonical: "/formation" },
};

const FORMATS = [
  { nom: "Vidéo", texte: "Quinze à trente minutes, une seule idée par module, des exemples de terrain." },
  { nom: "Fiche", texte: "La règle, la référence officielle datée, la formulation de constat recommandée." },
  { nom: "Checklist", texte: "À télécharger, à imprimer, à cocher avant un contrôle ou une embauche." },
  { nom: "Outil interactif", texte: "Auto-diagnostic, rapprochement heures, suivi des cartes : vous saisissez, l'outil montre l'écart." },
  { nom: "Quiz", texte: "Pour vérifier qu'on a compris, pas pour noter." },
] as const;

const COULEUR_OFFRE = {
  gratuit: "bg-menthe text-mineur",
  payant: "bg-sable text-majeur",
  abonnement: "bg-filet-2 text-encre-2",
} as const;

export default function FormationPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -left-32 top-10 size-[520px] rounded-full bg-sable/70 blur-3xl" aria-hidden />
        <Conteneur className="relative space-y-8 pb-20 pt-12 md:pb-28 md:pt-20">
          <Reveal y={16}>
            <p className="etiquette">Centre de formation</p>
          </Reveal>
          <Reveal delay={0.05}>
            <h1 className="max-w-4xl font-display text-[2.8rem] leading-[1.02] text-encre md:text-[4.2rem]">
              Apprenez à vous auditer <em className="text-vert">avec la rigueur d&apos;un contrôleur.</em>
            </h1>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="max-w-2xl text-[17px] leading-relaxed text-encre-2">
              Pour le dirigeant, le responsable d&apos;exploitation, la personne qui fait la paie : {NB_MODULES} modules courts,
              organisés en {PARCOURS.length} parcours, tirés des mêmes outils que l&apos;audit. Le premier module est gratuit.
            </p>
          </Reveal>
          <Reveal delay={0.15}>
            <div className="rounded-[5px] border border-majeur/40 bg-sable/60 px-5 py-4 text-[14px] leading-relaxed text-encre">
              <span className="etiquette mr-3 !text-majeur">Ouverture</span>
              Le catalogue est en préparation. Les contenus, formats et tarifs ci-dessous sont indicatifs et seront précisés
              avec l&apos;ouverture des premiers parcours. [Date d&apos;ouverture à définir]
            </div>
          </Reveal>
          <Reveal delay={0.2}>
            <div className="max-w-lg">
              <LeadMagnet source="formation" cta="Être prévenu à l'ouverture" />
            </div>
          </Reveal>
        </Conteneur>
      </section>

      <section className="bg-papier">
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="01"
            eyebrow="Les parcours"
            titre={<>Neuf parcours, <em className="text-vert">un par sujet de contrôle.</em></>}
            aligne="deux"
            sous="Commencez par le socle. Ensuite, le parcours qui correspond au contrôleur que vous redoutez le plus."
          />
          <div className="mt-14 space-y-16">
            {PARCOURS.map((p, pi) => (
              <Reveal key={p.id}>
                <div className="grid gap-6 lg:grid-cols-[0.75fr_1.25fr] lg:gap-14">
                  <div className="space-y-3 lg:sticky lg:top-28 lg:self-start">
                    <span className="font-mono text-[11px] text-gris">{String(pi + 1).padStart(2, "0")}</span>
                    <h3 className="font-display text-[1.9rem] leading-tight text-encre">{p.nom}</h3>
                    <p className="text-[14.5px] leading-relaxed text-encre-2">{p.accroche}</p>
                    <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-gris">
                      {p.modules.length} module{p.modules.length > 1 ? "s" : ""}
                    </p>
                  </div>
                  <div>
                    <Filet epais />
                    <ol>
                      {p.modules.map((m) => (
                        <li key={m.code} className="grid gap-2 border-b border-filet py-4 md:grid-cols-[5.5rem_1fr_auto] md:items-baseline md:gap-6">
                          <span className="font-mono text-[11px] text-gris">{m.code}</span>
                          <div className="space-y-1.5">
                            <p className="font-display text-[1.2rem] leading-snug text-encre">{m.titre}</p>
                            <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gris">
                              {m.niveau}
                              {m.dureeMin ? ` · ${m.dureeMin} min` : ""}
                              {m.nbPoints ? ` · ${m.nbPoints} points` : ""}
                              {" · "}
                              {m.formats.join(" · ")}
                            </p>
                          </div>
                          <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-[11px] font-medium ${COULEUR_OFFRE[m.offre]}`}>
                            {LIBELLE_OFFRE[m.offre]}
                          </span>
                        </li>
                      ))}
                    </ol>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </Conteneur>
      </section>

      <section>
        <Conteneur className="py-24 md:py-32">
          <SectionHead index="02" eyebrow="Les formats" titre={<>Court, concret, <em className="text-vert">réutilisable le lendemain.</em></>} aligne="deux" sous="Pas de cours magistral. Chaque module se termine par quelque chose qu'on peut faire dans l'entreprise." />
          <Cascade className="mt-14 grid gap-px overflow-hidden rounded-[5px] border border-filet bg-filet sm:grid-cols-2 lg:grid-cols-5" pas={0.08}>
            {FORMATS.map((f) => (
              <Element key={f.nom} className="space-y-3 bg-papier p-6">
                <h3 className="font-display text-[1.35rem] leading-tight text-encre">{f.nom}</h3>
                <p className="text-[13.5px] leading-relaxed text-encre-2">{f.texte}</p>
              </Element>
            ))}
          </Cascade>
        </Conteneur>
      </section>

      <section className="bg-encre text-papier">
        <Conteneur className="py-24 md:py-32">
          <div className="grid gap-12 md:grid-cols-[1.2fr_0.8fr] md:items-end md:gap-20">
            <div className="space-y-6">
              <SectionHead index="03" eyebrow="Pour aller plus loin" titre={PROGRAMME_30_JOURS.titre} sous={PROGRAMME_30_JOURS.texte} sombre />
              <Reveal delay={0.1}>
                <p className="font-mono text-[12px] text-brume">{PROGRAMME_30_JOURS.format}</p>
              </Reveal>
            </div>
            <Reveal delay={0.15}>
              <div className="space-y-4 rounded-[5px] border border-nuit p-6 md:p-8">
                <p className="etiquette text-brume">Trois formules d&apos;accès</p>
                <ul className="space-y-3 text-[14.5px] text-brume-2">
                  <li className="flex justify-between gap-4 border-b border-nuit pb-3">
                    <span>Module gratuit</span>
                    <span className="font-mono text-[12px] text-papier">0 €</span>
                  </li>
                  <li className="flex justify-between gap-4 border-b border-nuit pb-3">
                    <span>Module à l&apos;unité</span>
                    <span className="font-mono text-[12px] text-papier">[à définir]</span>
                  </li>
                  <li className="flex justify-between gap-4">
                    <span>Inclus dans l&apos;abonnement conformité</span>
                    <span className="font-mono text-[12px] text-papier">dès 390 € HT / mois</span>
                  </li>
                </ul>
                <Bouton href="/abonnement" variante="clair" taille="sm">
                  Voir l&apos;abonnement
                </Bouton>
              </div>
            </Reveal>
          </div>
        </Conteneur>
      </section>

      <CtaFinal titre="Une formation sur mesure pour votre équipe ?" texte="Session intra-entreprise, sur vos plannings et vos bulletins : on part de vos écarts, pas d'un cas d'école." cta="En parler" href="/contact?situation=formation" />
    </>
  );
}
