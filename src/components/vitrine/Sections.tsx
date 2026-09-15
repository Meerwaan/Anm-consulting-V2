import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { CRITICITE, PILIERS, POSITIONNEMENT } from "@/content/piliers";
import { ABONNEMENTS, OFFRES } from "@/content/offres";
import { REGLE_OR } from "@/content/methode";
import { LIGNE_DE_CRETE } from "@/content/vision";
import { LIVRABLES } from "@/content/vitrine";
import { Bouton } from "./Bouton";
import { Cascade, Element, Reveal } from "./Reveal";
import { Conteneur, Filet } from "./SectionHead";

/* ------------------------------------------------------------------ */
/* Les cinq piliers                                                    */
/* ------------------------------------------------------------------ */

export function Piliers({ detaille = false }: { detaille?: boolean }) {
  const total = PILIERS.reduce((n, p) => n + p.nbPoints, 0);
  return (
    <div>
      <Filet epais />
      <ol>
        {PILIERS.map((p, i) => (
          <Reveal key={p.id} delay={i * 0.05}>
            <li className="group grid gap-3 border-b border-filet py-6 transition-colors duration-500 ease-expo hover:bg-papier md:grid-cols-[3.5rem_1fr_11rem] md:gap-8 md:py-7">
              <span className="font-mono text-[12px] text-gris md:pt-2">0{i + 1}</span>
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="font-display text-[1.7rem] leading-tight text-encre transition-transform duration-500 ease-expo group-hover:translate-x-1 md:text-[1.9rem]">
                    {p.nom}
                  </h3>
                  <span className="font-mono text-[11px] uppercase tracking-[0.14em] text-gris">{p.organisme}</span>
                </div>
                <p className="max-w-2xl text-[15px] leading-relaxed text-encre-2">{p.description}</p>
                {detaille ? (
                  <p className="font-mono text-[11px] leading-relaxed text-gris">
                    {p.fichesBible} · {p.moduleSource}
                  </p>
                ) : null}
              </div>
              <div className="flex items-baseline gap-2 md:flex-col md:items-end md:gap-0 md:pt-1">
                <span className="font-display text-[1.9rem] leading-none text-vert">{p.nbPoints}</span>
                <span className="text-[12px] text-gris">points de contrôle</span>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
      <Reveal>
        <div className="flex flex-wrap items-baseline justify-between gap-4 pt-5">
          <p className="max-w-xl text-[14px] leading-relaxed text-gris">{POSITIONNEMENT.phraseCle}</p>
          <p className="flex items-baseline gap-2">
            <span className="font-display text-[2.2rem] leading-none text-encre">{total}</span>
            <span className="text-[13px] text-gris">points de contrôle au total, croisés entre eux</span>
          </p>
        </div>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* La règle d'or                                                       */
/* ------------------------------------------------------------------ */

export function RegleOr({ sombre = true }: { sombre?: boolean }) {
  return (
    <Cascade className="flex flex-wrap items-center gap-x-3 gap-y-3" pas={0.12}>
      {REGLE_OR.map((mot, i) => (
        <Element key={mot} className="flex items-center gap-3" y={10}>
          <span
            className={`rounded-full border px-4 py-2 font-mono text-[12px] uppercase tracking-[0.16em] ${
              sombre ? "border-nuit bg-encre text-papier" : "border-encre bg-papier text-encre"
            }`}
          >
            {mot}
          </span>
          {i < REGLE_OR.length - 1 ? <ArrowRight size={14} className={sombre ? "text-brume" : "text-gris"} aria-hidden /> : null}
        </Element>
      ))}
    </Cascade>
  );
}

/* ------------------------------------------------------------------ */
/* Échelle de criticité                                                */
/* ------------------------------------------------------------------ */

export function EchelleCriticite() {
  return (
    <Cascade className="grid gap-px overflow-hidden rounded-[5px] border border-filet bg-filet md:grid-cols-4">
      {CRITICITE.map((c) => (
        <Element key={c.niveau} className="space-y-3 bg-papier p-6">
          <div className="flex items-center gap-2">
            <span className="size-2.5 rounded-full" style={{ background: c.couleur }} aria-hidden />
            <h3 className="font-display text-[1.4rem]" style={{ color: c.couleur }}>
              {c.label}
            </h3>
          </div>
          <p className="text-[14px] leading-relaxed text-encre-2">{c.definition}</p>
          <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gris">{c.traitement}</p>
        </Element>
      ))}
    </Cascade>
  );
}

/* ------------------------------------------------------------------ */
/* Grille tarifaire (décision 02 : complète)                           */
/* ------------------------------------------------------------------ */

export function Tarifs({ avecLien = true }: { avecLien?: boolean }) {
  return (
    <div>
      <Filet epais />
      <ol>
        {OFFRES.map((o, i) => {
          const phare = o.produitPhare;
          return (
            <Reveal key={o.id} delay={i * 0.04}>
              <li
                className={`group grid gap-3 border-b border-filet py-6 transition-colors duration-500 ease-expo md:grid-cols-[3.5rem_1fr_13.5rem] md:gap-8 md:py-7 ${
                  phare ? "bg-menthe-2/70 -mx-5 px-5 md:-mx-6 md:px-6" : "hover:bg-papier"
                }`}
              >
                <span className="font-mono text-[12px] text-gris md:pt-2">0{i + 1}</span>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-[1.6rem] leading-tight text-encre md:text-[1.8rem]">{o.nom}</h3>
                    {phare ? (
                      <span className="rounded-full bg-vert px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-papier">
                        Produit phare
                      </span>
                    ) : null}
                  </div>
                  <p className="max-w-2xl text-[14.5px] leading-relaxed text-encre-2">{o.contenu}</p>
                  <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-gris">
                    {o.format.replace(/\s*\(à confirmer\)/i, "")} · {o.cible}
                  </p>
                </div>
                <div className="flex items-baseline justify-between gap-2 md:flex-col md:items-end md:justify-start md:gap-1 md:pt-1 md:text-right">
                  <span className="font-display text-[1.6rem] leading-none text-vert md:text-[1.7rem]">{o.fourchette}</span>
                  {o.commentaire && o.statut === "valide" && o.id !== "fiscal" ? (
                    <span className="text-[12px] text-gris">{o.commentaire}</span>
                  ) : null}
                  {o.id === "fiscal" ? <span className="text-[12px] text-gris">Avec votre expert-comptable</span> : null}
                </div>
              </li>
            </Reveal>
          );
        })}
      </ol>
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5">
          <p className="max-w-xl text-[13px] leading-relaxed text-gris">
            Prix HT indicatifs, ajustés selon l&apos;effectif, le nombre de sites et l&apos;urgence. Journée complémentaire :
            850 € HT. Le montant ferme figure dans la proposition écrite.
          </p>
          {avecLien ? (
            <Bouton href="/audit#estimateur" variante="lien">
              Estimer ma mission
            </Bouton>
          ) : null}
        </div>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Abonnements                                                         */
/* ------------------------------------------------------------------ */

export function Abonnements({ detaille = false }: { detaille?: boolean }) {
  return (
    <Cascade className="grid gap-px overflow-hidden rounded-[5px] border border-filet bg-filet md:grid-cols-4" pas={0.1}>
      {ABONNEMENTS.map((a) => {
        const phare = a.id === "360";
        return (
          <Element key={a.id} className={`flex flex-col gap-4 p-6 md:p-7 ${phare ? "bg-papier ring-1 ring-inset ring-encre" : "bg-fond"}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-[1.55rem] leading-tight text-encre">{a.nom}</h3>
              {phare ? <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-vert">Le plus choisi</span> : null}
            </div>
            <p className="flex items-baseline gap-1.5">
              <span className="font-display text-[2.3rem] leading-none text-vert">{a.prixMensuelHT.toLocaleString("fr-FR")} €</span>
              <span className="text-[12px] text-gris">HT / mois</span>
            </p>
            <Filet />
            <p className="text-[14px] font-medium text-encre">{a.inclus}</p>
            <ul className="space-y-1.5 text-[13.5px] text-encre-2">
              <li>Revue {a.revue.toLowerCase()}</li>
              <li>Support {a.support.toLowerCase()}</li>
              {detaille ? <li>Plan d&apos;actions et échéances suivis dans le portail</li> : null}
              {detaille ? <li>Alertes cartes professionnelles et attestations</li> : null}
            </ul>
            <p className="mt-auto pt-3 font-mono text-[11px] leading-relaxed text-gris">
              {a.cible} · {a.limites}
            </p>
            <Bouton href={`/contact?situation=abonnement&offre=${a.id}`} variante={phare ? "primaire" : "fantome"} taille="sm" className="w-full justify-between">
              Choisir {a.nom}
            </Bouton>
          </Element>
        );
      })}
    </Cascade>
  );
}

/* ------------------------------------------------------------------ */
/* Livrables                                                           */
/* ------------------------------------------------------------------ */

export function Livrables() {
  return (
    <Cascade className="grid gap-px overflow-hidden rounded-[5px] border border-filet bg-filet sm:grid-cols-2 lg:grid-cols-3" pas={0.08}>
      {LIVRABLES.map((l, i) => (
        <Element key={l.titre} className="group space-y-3 bg-papier p-6 transition-colors duration-500 ease-expo hover:bg-menthe-2 md:p-7">
          <span className="font-mono text-[11px] text-gris">0{i + 1}</span>
          <h3 className="font-display text-[1.35rem] leading-snug text-encre">{l.titre}</h3>
          <p className="text-[14px] leading-relaxed text-encre-2">{l.texte}</p>
        </Element>
      ))}
    </Cascade>
  );
}

/* ------------------------------------------------------------------ */
/* Pour qui + ligne de crête                                           */
/* ------------------------------------------------------------------ */

export function PourQui() {
  return (
    <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:gap-20">
      <div>
        <Filet epais />
        <ul>
          {POSITIONNEMENT.cibles.map((c, i) => (
            <Reveal key={c.nom} delay={i * 0.05}>
              <li className="grid gap-1 border-b border-filet py-5 md:grid-cols-[11rem_1fr] md:gap-6">
                <h3 className="font-display text-[1.4rem] leading-tight text-encre">{c.nom}</h3>
                <p className="text-[15px] leading-relaxed text-encre-2">{c.besoin}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
      <Reveal delay={0.1}>
        <div id="ligne-de-crete" className="space-y-6 rounded-[5px] border border-encre bg-papier p-7 md:p-9">
          <p className="etiquette !text-encre">Ligne de crête</p>
          <p className="font-display text-[1.6rem] leading-[1.25] text-encre md:text-[1.8rem]">{LIGNE_DE_CRETE.phrase}</p>
          <div className="space-y-2">
            <p className="etiquette">Ce que je ne fais pas</p>
            <ul className="space-y-1.5 text-[14px] text-encre-2">
              {LIGNE_DE_CRETE.exclusions.map((e) => (
                <li key={e} className="flex gap-3">
                  <span className="mt-[9px] h-px w-3 shrink-0 bg-encre" aria-hidden />
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-[13px] leading-relaxed text-gris">{LIGNE_DE_CRETE.regle}</p>
        </div>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Bandeau d'appel final                                               */
/* ------------------------------------------------------------------ */

export function CtaFinal({
  titre = "Parlons de votre situation.",
  texte = "Trente minutes, sans engagement, pour identifier vos trois principaux risques et décider de la suite. Aucune promesse de garantie contre un redressement : des faits, une méthode, un plan.",
  cta = "Demander un premier échange",
  href = "/contact",
}: {
  titre?: string;
  texte?: string;
  cta?: string;
  href?: string;
}) {
  return (
    <section className="bg-encre text-papier">
      <Conteneur className="py-24 md:py-32">
        <Reveal>
          <div className="grid gap-10 md:grid-cols-[1.3fr_1fr] md:items-end">
            <div className="space-y-5">
              <p className="etiquette text-brume">Premier échange</p>
              <h2 className="font-display text-[2.6rem] leading-[1.02] md:text-[4rem]">{titre}</h2>
              <p className="max-w-xl text-[16px] leading-relaxed text-brume-2">{texte}</p>
            </div>
            <div className="flex flex-col gap-4 md:items-end">
              <Bouton href={href} taille="lg" variante="clair">
                {cta}
              </Bouton>
              <Link href="/audit#estimateur" className="souligne pb-0.5 text-[14px] text-brume hover:text-papier">
                Ou estimer ma mission en trente secondes
              </Link>
            </div>
          </div>
        </Reveal>
      </Conteneur>
    </section>
  );
}
