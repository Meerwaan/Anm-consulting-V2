import type { Metadata } from "next";
import Link from "next/link";
import { Bouton } from "@/components/vitrine/Bouton";
import { Compteur } from "@/components/vitrine/Compteur";
import { Estimateur } from "@/components/vitrine/Estimateur";
import { FAQ } from "@/components/vitrine/FAQ";
import { Criticite, FicheConstat } from "@/components/vitrine/FicheConstat";
import { LeadMagnet } from "@/components/vitrine/LeadMagnet";
import { Marquee } from "@/components/vitrine/Marquee";
import { PortailApercu } from "@/components/vitrine/PortailApercu";
import { Cascade, Element, Reveal } from "@/components/vitrine/Reveal";
import { Conteneur, Filet, SectionHead } from "@/components/vitrine/SectionHead";
import { Abonnements, CtaFinal, Piliers, PourQui, RegleOr, Tarifs } from "@/components/vitrine/Sections";
import { METHODE_4_TEMPS, PHASES_MISSION } from "@/content/methode";
import { CE_QUE_VOIT_LE_CONTROLEUR, CHECKLIST_CNAPS, CONSULTANTE, FAQ as FAQ_ITEMS, HERO, RESSOURCES } from "@/content/vitrine";
import { PORTAIL_CLIENT } from "@/content/vision";

export const metadata: Metadata = {
  title: "ANM Consulting — Audit et préparation aux contrôles en sécurité privée",
  description:
    "CNAPS, URSSAF, DGFiP, Inspection du travail, sous-traitance : repérez les écarts avant qu'un contrôleur ne les trouve. 208 points de contrôle, 15 étapes, un plan d'actions daté.",
  alternates: { canonical: "/" },
};

const TEXTES_TEMPS: Record<string, string> = {
  Cadrage: "Entretien dirigeant, périmètre, liste des pièces. Vous savez ce qui sera regardé avant qu'on commence.",
  Collecte: "Analyse documentaire, échantillon de salariés, de sites et de sous-traitants. Travail sur copies, jamais sur originaux.",
  Tests: "CNAPS, social, URSSAF, temps de travail, inspection, fiscal. Rapprochement planning → pointage → paie → facturation.",
  Restitution: "Constats qualifiés, risques classés, plan d'actions P1 → P4, rapport, réunion d'une heure.",
};

export default function HomePage() {
  return (
    <>
      {/* ------------------------------------------------ HERO */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute -right-40 -top-40 size-[640px] rounded-full bg-menthe/50 blur-3xl" aria-hidden />
        <Conteneur large className="relative grid gap-14 pb-20 pt-12 md:grid-cols-[1.1fr_0.9fr] md:items-center md:gap-16 md:pb-28 md:pt-20">
          <div className="space-y-8">
            <Reveal y={16}>
              <p className="etiquette">{HERO.eyebrow}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="font-display text-[2.9rem] leading-[1.02] text-encre sm:text-[3.6rem] md:text-[4.3rem] lg:text-[4.8rem]">
                {HERO.titre} <em className="text-vert">{HERO.titreItalique}</em>
              </h1>
            </Reveal>
            <Reveal delay={0.12}>
              <p className="max-w-xl text-[17px] leading-relaxed text-encre-2 md:text-[18px]">{HERO.texte}</p>
            </Reveal>
            <Reveal delay={0.18}>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <Bouton href={HERO.ctaPrincipal.href} taille="lg">
                  {HERO.ctaPrincipal.label}
                </Bouton>
                <Bouton href={HERO.ctaSecondaire.href} variante="lien">
                  {HERO.ctaSecondaire.label}
                </Bouton>
              </div>
            </Reveal>
            <Reveal delay={0.26}>
              <div>
                <Filet epais />
                <ul className="grid grid-cols-2 gap-x-6 gap-y-5 pt-5 sm:grid-cols-4">
                  {HERO.chiffres.map((c) => (
                    <li key={c.label} className="space-y-1">
                      <p className="font-display text-[2rem] leading-none text-vert">
                        <Compteur valeur={c.valeur} suffixe={c.suffixe} />
                      </p>
                      <p className="text-[12.5px] leading-snug text-gris">{c.label}</p>
                    </li>
                  ))}
                </ul>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.2} y={40} className="md:justify-self-end md:w-full md:max-w-[460px]">
            <FicheConstat />
          </Reveal>
        </Conteneur>
        <Marquee />
      </section>

      {/* ------------------------------------------------ CE QUE VOIT LE CONTRÔLEUR */}
      <section className="bg-papier">
        <Conteneur className="py-24 md:py-32">
          <SectionHead index="01" eyebrow="Le problème" titre={CE_QUE_VOIT_LE_CONTROLEUR.titre} sous={CE_QUE_VOIT_LE_CONTROLEUR.intro} aligne="deux" />
          <Cascade className="mt-14 grid gap-px overflow-hidden rounded-[5px] border border-filet bg-filet sm:grid-cols-2 lg:grid-cols-4" pas={0.1}>
            {CE_QUE_VOIT_LE_CONTROLEUR.cas.map((c) => (
              <Element key={c.fait} className="group flex flex-col gap-5 bg-fond p-6 transition-colors duration-500 ease-expo hover:bg-papier md:p-7">
                <div className="flex items-center justify-between">
                  <span className="etiquette !text-encre">{c.organisme}</span>
                  <Criticite niveau={c.criticite} petit />
                </div>
                <p className="font-display text-[1.35rem] leading-snug text-encre">{c.fait}</p>
                <div className="mt-auto space-y-1.5 border-t border-filet pt-4">
                  <p className="etiquette">Ce que ça coûte</p>
                  <p className="text-[13.5px] leading-relaxed text-encre-2">{c.consequence}</p>
                </div>
              </Element>
            ))}
          </Cascade>
          <Reveal delay={0.1}>
            <p className="mt-10 max-w-2xl font-display text-[1.5rem] leading-snug text-encre md:text-[1.7rem]">{CE_QUE_VOIT_LE_CONTROLEUR.conclusion}</p>
          </Reveal>
        </Conteneur>
      </section>

      {/* ------------------------------------------------ PILIERS */}
      <section>
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="02"
            eyebrow="Cinq piliers"
            titre={
              <>
                Tout ce qu&apos;un contrôleur peut regarder, <em className="text-vert">et dans quel ordre.</em>
              </>
            }
            sous="Cinq organismes, cinq lectures différentes de la même entreprise. L'audit les croise : planning, présence réelle, paie, facturation, situation réglementaire."
            aligne="deux"
          />
          <div className="mt-14">
            <Piliers />
          </div>
        </Conteneur>
      </section>

      {/* ------------------------------------------------ POUR QUI */}
      <section className="bg-papier">
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="03"
            eyebrow="Pour qui, et jusqu'où"
            titre={
              <>
                Un regard que ni l&apos;avocat ni l&apos;expert-comptable ne peuvent avoir : <em className="text-vert">celui du terrain.</em>
              </>
            }
            sous="Vingt ans à diriger une entreprise du secteur : ce qui est tenable sur un site, ce qui ne l'est pas, ce qu'un contrôleur regarde en premier. Les questions juridiques et fiscales réglementées restent à vos conseils, qui partent d'un dossier propre au lieu de reconstituer les faits."
            aligne="deux"
          />
          <div className="mt-14">
            <PourQui />
          </div>
        </Conteneur>
      </section>

      {/* ------------------------------------------------ MÉTHODE */}
      <section className="bg-encre text-papier">
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="04"
            eyebrow="La méthode"
            titre={
              <>
                Pas de théorie inutile : <em className="text-menthe">des preuves et des décisions.</em>
              </>
            }
            sous="Quinze étapes, du premier entretien à la réunion de restitution. Vous savez à tout moment où en est la mission, et ce qui manque."
            sombre
            aligne="deux"
          />
          <Cascade className="mt-14 grid gap-px overflow-hidden rounded-[5px] border border-nuit bg-nuit md:grid-cols-4" pas={0.1}>
            {METHODE_4_TEMPS.map((t, i) => {
              const phases = t.phases.map((p) => PHASES_MISSION[p - 1]);
              return (
                <Element key={t.nom} className="space-y-4 bg-encre p-6 md:p-7">
                  <p className="font-display text-[2.4rem] leading-none text-brume">{["I", "II", "III", "IV"][i]}</p>
                  <h3 className="font-display text-[1.6rem] leading-tight">{t.nom}</h3>
                  <p className="font-mono text-[11px] uppercase tracking-[0.14em] text-brume">
                    {phases[0].moment}
                    {phases.length > 1 ? ` → ${phases[phases.length - 1].moment}` : ""}
                  </p>
                  <p className="text-[14px] leading-relaxed text-brume-2">{TEXTES_TEMPS[t.nom]}</p>
                </Element>
              );
            })}
          </Cascade>
          <div className="mt-14 grid gap-10 md:grid-cols-[1fr_auto] md:items-center">
            <div className="space-y-5">
              <p className="etiquette text-brume">Chaque constat suit la même chaîne</p>
              <RegleOr />
              <p className="max-w-2xl font-display text-[1.35rem] italic leading-snug text-brume-2 md:text-[1.5rem]">
                « Jamais une hypothèse présentée comme une non-conformité certaine. Chaque écart cite une référence officielle,
                vérifiée et datée. »
              </p>
            </div>
            <Bouton href="/audit#methode" variante="clair" taille="lg">
              Les 15 étapes en détail
            </Bouton>
          </div>
        </Conteneur>
      </section>

      {/* ------------------------------------------------ PORTAIL */}
      <section className="overflow-hidden">
        <Conteneur large className="grid gap-12 py-24 md:grid-cols-[0.85fr_1.15fr] md:items-center md:gap-16 md:py-32">
          <div className="space-y-7">
            <SectionHead
              index="05"
              eyebrow="Votre espace"
              titre={
                <>
                  Votre mission, suivie <em className="text-vert">en temps réel.</em>
                </>
              }
            />
            <Reveal delay={0.05}>
              <ul className="space-y-3">
                {PORTAIL_CLIENT.pendantAudit.map((p) => (
                  <li key={p} className="flex gap-3 text-[15px] leading-relaxed text-encre-2">
                    <span className="mt-[11px] h-px w-4 shrink-0 bg-vert" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="text-[14px] leading-relaxed text-gris">
                Rien du contenu de l&apos;audit ne sort avant d&apos;être qualifié : le compte rendu arrive quand il est
                vérifié, en deux axes, avec un plan d&apos;actions que vous cochez vous-même. Après la mission, le portail devient
                votre tableau de bord de conformité.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <Bouton href="/abonnement" variante="lien">
                Découvrir le suivi conformité
              </Bouton>
            </Reveal>
          </div>
          <Reveal y={40}>
            <PortailApercu />
          </Reveal>
        </Conteneur>
      </section>

      {/* ------------------------------------------------ OFFRES + ESTIMATEUR */}
      <section className="bg-papier">
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="06"
            eyebrow="Prestations et tarifs"
            titre={
              <>
                Des audits ciblés, <em className="text-vert">ou un diagnostic complet.</em>
              </>
            }
            sous="La grille est publique. Vous savez ce que ça coûte avant de nous appeler, et le montant ferme figure dans la proposition écrite."
            aligne="deux"
          />
          <div className="mt-14">
            <Tarifs />
          </div>
          <div className="mt-20 grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-start" id="estimateur-accueil">
            <Reveal>
              <div className="space-y-4 md:sticky md:top-28">
                <p className="etiquette">Estimateur</p>
                <h3 className="font-display text-[2rem] leading-[1.08] text-encre md:text-[2.4rem]">Estimez votre mission en trente secondes.</h3>
                <p className="text-[15px] leading-relaxed text-encre-2">
                  Les règles de chiffrage sont celles de la grille : majoration selon l&apos;effectif, les sites au-delà de deux,
                  et 20 % en cas d&apos;urgence. Pas de devis caché.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.1} y={32}>
              <Estimateur />
            </Reveal>
          </div>
        </Conteneur>
      </section>

      {/* ------------------------------------------------ ABONNEMENTS */}
      <section className="bg-menthe-2">
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="07"
            eyebrow="Suivi conformité"
            titre={
              <>
                Et après l&apos;audit, <em className="text-vert">on ne vous laisse pas seul.</em>
              </>
            }
            sous="Un abonnement mensuel pour que les échéances ne repassent plus entre les mailles : revues périodiques, alertes cartes et attestations, plan d'actions suivi."
            aligne="deux"
          />
          <div className="mt-14">
            <Abonnements />
          </div>
        </Conteneur>
      </section>

      {/* ------------------------------------------------ À PROPOS (teaser) */}
      <section className="bg-papier">
        <Conteneur className="py-24 md:py-32">
          <div className="grid gap-12 md:grid-cols-[0.9fr_1.1fr] md:items-center md:gap-20">
            <Reveal>
              <div className="relative aspect-[4/5] overflow-hidden rounded-[5px] border border-filet bg-fond">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_30%_20%,rgba(220,239,229,0.9),transparent_60%)]" aria-hidden />
                <div className="absolute inset-x-0 bottom-0 p-6">
                  <p className="etiquette">Portrait</p>
                  <p className="mt-1 font-mono text-[12px] text-gris">[Photo de la dirigeante à insérer]</p>
                </div>
              </div>
            </Reveal>
            <div className="space-y-7">
              <SectionHead
                index="08"
                eyebrow="Qui je suis"
                titre={
                  <>
                    {CONSULTANTE.prenomNom}, <em className="text-vert">vingt ans de l&apos;autre côté de la table.</em>
                  </>
                }
              />
              <Reveal delay={0.05}>
                <p className="text-[16px] leading-relaxed text-encre-2">{CONSULTANTE.accroche}</p>
              </Reveal>
              <Reveal delay={0.1}>
                <p className="border-l-2 border-vert pl-5 font-display text-[1.35rem] italic leading-snug text-encre">{CONSULTANTE.citation}</p>
              </Reveal>
              <Reveal delay={0.15}>
                <Bouton href="/a-propos" variante="lien">
                  Mon parcours et ma ligne de crête
                </Bouton>
              </Reveal>
            </div>
          </div>
        </Conteneur>
      </section>

      {/* ------------------------------------------------ FAQ */}
      <section>
        <Conteneur className="py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHead index="09" eyebrow="Vos questions" titre={<>Les objections qu&apos;on m&apos;oppose, <em className="text-vert">et ce que je réponds.</em></>} />
            <Reveal delay={0.1}>
              <FAQ items={FAQ_ITEMS} />
            </Reveal>
          </div>
        </Conteneur>
      </section>

      {/* ------------------------------------------------ CHECKLIST (lead magnet) */}
      <section id="checklist" className="bg-encre text-papier">
        <Conteneur className="py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
            <div className="space-y-7">
              <SectionHead index="10" eyebrow="Ressource gratuite" titre={CHECKLIST_CNAPS.titre} sous={CHECKLIST_CNAPS.texte} sombre />
              <Reveal delay={0.1}>
                <div className="max-w-md">
                  <LeadMagnet source="checklist-cnaps" cta={CHECKLIST_CNAPS.cta} sombre />
                </div>
              </Reveal>
              <Reveal delay={0.15}>
                <div className="space-y-3 pt-4">
                  <p className="etiquette text-brume">À venir</p>
                  <ul className="space-y-2">
                    {RESSOURCES.filter((r) => r.statut === "a_venir").map((r) => (
                      <li key={r.titre} className="flex items-baseline justify-between gap-4 border-b border-nuit pb-2 text-[14px] text-brume-2">
                        {r.titre}
                        <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-brume">{r.type}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            </div>
            <Reveal delay={0.1} y={32}>
              <ol className="rounded-[5px] border border-nuit bg-encre/60 p-6 md:p-8">
                {CHECKLIST_CNAPS.points.map((p, i) => (
                  <li key={p} className="flex gap-4 border-b border-nuit py-3 text-[14.5px] leading-relaxed text-brume-2 last:border-0">
                    <span className="font-mono text-[12px] text-brume">{String(i + 1).padStart(2, "0")}</span>
                    <span className={i > 3 ? "blur-[3px] select-none" : ""} aria-hidden={i > 3}>
                      {p}
                    </span>
                  </li>
                ))}
                <li className="pt-4 text-center font-mono text-[11px] uppercase tracking-[0.14em] text-brume">
                  Les dix points, dans votre boîte mail
                </li>
              </ol>
            </Reveal>
          </div>
        </Conteneur>
      </section>

      {/* ------------------------------------------------ CTA */}
      <CtaFinal />
      <div className="sr-only">
        <Link href="/audit">Audit 360°</Link>
      </div>
    </>
  );
}
