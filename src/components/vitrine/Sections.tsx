import Link from "next/link";
import { ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { CRITICITE, PILIERS, POSITIONNEMENT } from "@/content/piliers";
import { ABONNEMENTS, OFFRES } from "@/content/offres";
import { REGLE_OR } from "@/content/methode";
import { LIGNE_DE_CRETE } from "@/content/vision";
import { CONTROLES_VECUS, LIVRABLES } from "@/content/vitrine";
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
            <li className="group relative isolate before:absolute before:inset-y-0 before:-inset-x-5 before:-z-10 before:transition-colors before:duration-500 before:ease-expo before:content-[''] md:before:-inset-x-4 grid gap-3 border-b border-filet py-6 hover:before:bg-papier md:grid-cols-[3.5rem_1fr_13.5rem] md:gap-8 md:py-7">
              <span className="font-mono text-note text-gris md:pt-2">0{i + 1}</span>
              <div className="space-y-2.5">
                <div className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                  <h3 className="font-display text-t3 text-encre transition-transform duration-500 ease-expo group-hover:translate-x-1">{p.nom}</h3>
                  <span className="font-mono text-etiquette uppercase tracking-[0.14em] text-gris">{p.organisme}</span>
                </div>
                <p className="max-w-2xl text-corps text-encre-2">{p.description}</p>
                {detaille ? (
                  <p className="font-mono text-etiquette text-gris">
                    {p.fichesBible} · {p.moduleSource}
                  </p>
                ) : null}
              </div>
              <div className="flex items-baseline gap-2 md:flex-col md:items-end md:gap-0 md:pt-1">
                <span className="font-display text-t3 leading-none text-vert">{p.nbPoints}</span>
                <span className="text-note text-gris">points de contrôle</span>
              </div>
            </li>
          </Reveal>
        ))}
      </ol>
      <Reveal>
        <div className="flex flex-wrap items-baseline justify-between gap-4 pt-5">
          <p className="max-w-xl text-corps text-gris">{POSITIONNEMENT.phraseCle}</p>
          <p className="flex items-baseline gap-2">
            <span className="font-display text-chiffre leading-none text-encre">{total}</span>
            <span className="text-meta text-gris">points de contrôle au total, croisés entre eux</span>
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
          <span className={`rounded-full border px-4 py-2 font-mono text-note uppercase tracking-[0.16em] ${sombre ? "border-nuit bg-encre text-papier" : "border-encre bg-papier text-encre"}`}>
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
            <h3 className="font-display text-t4" style={{ color: c.couleur }}>
              {c.label}
            </h3>
          </div>
          <p className="text-corps text-encre-2">{c.definition}</p>
          <p className="font-mono text-etiquette uppercase tracking-[0.12em] text-gris">{c.traitement}</p>
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
                className={`group relative isolate before:absolute before:inset-y-0 before:-inset-x-5 before:-z-10 before:transition-colors before:duration-500 before:ease-expo before:content-[''] md:before:-inset-x-4 grid gap-3 border-b border-filet py-6 md:grid-cols-[3.5rem_1fr_13.5rem] md:gap-8 md:py-7 ${
                  phare ? "before:bg-menthe-2" : "hover:before:bg-papier"
                }`}
              >
                <span className="font-mono text-note text-gris md:pt-2">0{i + 1}</span>
                <div className="space-y-2">
                  <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <h3 className="font-display text-t3 text-encre">{o.nom}</h3>
                    {phare ? <span className="rounded-full bg-vert px-2.5 py-0.5 font-mono text-etiquette uppercase tracking-[0.16em] text-papier">Produit phare</span> : null}
                  </div>
                  <p className="max-w-2xl text-corps text-encre-2">{o.contenu}</p>
                  <p className="font-mono text-etiquette uppercase tracking-[0.12em] text-gris">
                    {o.format.replace(/\s*\(à confirmer\)/i, "")} · {o.cible}
                  </p>
                </div>
                <div className="flex items-baseline justify-between gap-2 md:flex-col md:items-end md:justify-start md:gap-1 md:pt-1 md:text-right">
                  <span className="font-display text-t3 leading-none text-vert">{o.fourchette}</span>
                  {o.commentaire && o.statut === "valide" && o.id !== "fiscal" && !phare ? <span className="text-note text-gris">{o.commentaire}</span> : null}
                  {o.id === "fiscal" ? <span className="text-note text-gris">Avec votre expert-comptable</span> : null}
                </div>
              </li>
            </Reveal>
          );
        })}
      </ol>
      <Reveal>
        <div className="flex flex-wrap items-center justify-between gap-4 pt-5">
          <p className="max-w-xl text-meta text-gris">
            Prix HT indicatifs, ajustés selon l’effectif, le nombre de sites et l’urgence. Journée complémentaire : 850 € HT. Le montant ferme figure dans la proposition écrite.
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
          <Element key={a.id} className={`flex flex-col gap-4 p-6 md:p-7 ${phare ? "bg-papier ring-1 ring-inset ring-encre" : "bg-papier"}`}>
            <div className="flex items-center justify-between">
              <h3 className="font-display text-t3 text-encre">{a.nom}</h3>
              {phare ? <span className="font-mono text-etiquette uppercase tracking-[0.16em] text-vert">Le plus choisi</span> : null}
            </div>
            <p className="flex items-baseline gap-1.5">
              <span className="font-display text-chiffre leading-none text-vert">{a.prixMensuelHT.toLocaleString("fr-FR")} €</span>
              <span className="text-note text-gris">HT / mois</span>
            </p>
            <Filet />
            <p className="text-corps font-medium text-encre">{a.inclus}</p>
            <ul className="space-y-1.5 text-meta text-encre-2">
              <li>Revue {a.revue.toLowerCase()}</li>
              <li>Support {a.support.toLowerCase()}</li>
              {detaille ? <li>Plan d’actions et échéances suivis dans le portail</li> : null}
              {detaille ? <li>Alertes cartes professionnelles et attestations</li> : null}
            </ul>
            <p className="mt-auto pt-3 font-mono text-etiquette text-gris">
              {a.cible} · {a.limites}
            </p>
            <Bouton href={`/contact?situation=abonnement&offre=${a.id}`} variante={phare ? "primaire" : "fantome"} taille="sm" className="w-full justify-between">
              Choisir cette formule
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
          <span className="font-mono text-etiquette text-gris">0{i + 1}</span>
          <h3 className="font-display text-t4 text-encre">{l.titre}</h3>
          <p className="text-corps text-encre-2">{l.texte}</p>
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
                <h3 className="font-display text-t4 text-encre">{c.nom}</h3>
                <p className="text-corps text-encre-2">{c.besoin}</p>
              </li>
            </Reveal>
          ))}
        </ul>
      </div>
      <Reveal delay={0.1}>
        <div id="ligne-de-crete" className="space-y-6 rounded-[5px] border border-encre bg-papier p-7 md:p-9">
          <p className="etiquette !text-encre">Ligne de crête</p>
          <p className="font-display text-t3 text-encre">{LIGNE_DE_CRETE.phrase}</p>
          <div className="space-y-2">
            <p className="etiquette">Ce que nous ne faisons pas</p>
            <ul className="space-y-1.5 text-corps text-encre-2">
              {LIGNE_DE_CRETE.exclusions.map((e) => (
                <li key={e} className="flex gap-3">
                  <span className="mt-[9px] h-px w-3 shrink-0 bg-encre" aria-hidden />
                  {e}
                </li>
              ))}
            </ul>
          </div>
          <p className="text-meta text-gris">{LIGNE_DE_CRETE.regle}</p>
        </div>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Repères : quelques chiffres clés en registre, à côté d'un hero      */
/* ------------------------------------------------------------------ */

export function Reperes({ lignes, titre }: { lignes: readonly { cle: string; valeur: string; href?: string }[]; titre: string }) {
  return (
    <div>
      <p className="etiquette mb-4">{titre}</p>
      <Filet epais />
      <ul>
        {lignes.map((l) => {
          const contenu = (
            <>
              <span className="text-meta text-encre-2">{l.cle}</span>
              <span className="font-display text-t4 text-encre">{l.valeur}</span>
            </>
          );
          return (
            <li key={l.cle} className="border-b border-filet">
              {l.href ? (
                <Link href={l.href} className="group flex items-baseline justify-between gap-6 py-3.5 transition-colors duration-300 hover:text-vert">
                  {contenu}
                </Link>
              ) : (
                <div className="flex items-baseline justify-between gap-6 py-3.5">{contenu}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Citation éditoriale                                                 */
/* ------------------------------------------------------------------ */

/** Une citation en serif italique, guillemets français, sans filet décoratif. */
export function Citation({ texte, auteur, sombre = false, className = "" }: { texte: string; auteur?: string; sombre?: boolean; className?: string }) {
  return (
    <figure className={`max-w-2xl ${className}`}>
      <blockquote className={`font-display text-t3 italic ${sombre ? "text-papier" : "text-encre"}`}>« {texte} »</blockquote>
      {auteur ? <figcaption className={`etiquette mt-4 ${sombre ? "text-brume" : ""}`}>{auteur}</figcaption> : null}
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Les contrôles vécus comme dirigeante : un registre, pas des cartes  */
/* ------------------------------------------------------------------ */

export function ControlesVecus() {
  return (
    <div>
      <Filet epais />
      <ol>
        {CONTROLES_VECUS.items.map((c, i) => (
          <Reveal key={c.organisme} delay={i * 0.05}>
            <li className="grid gap-3 border-b border-filet py-6 md:grid-cols-[11rem_1fr_1.3fr] md:items-baseline md:gap-8 md:py-7">
              <span className="etiquette !text-encre md:pt-1">{c.organisme}</span>
              <p className="flex items-baseline gap-3">
                <span className="font-display text-chiffre-lg leading-none text-vert">{c.nombre}</span>
                <span className="max-w-[14rem] text-meta text-gris">{c.label}</span>
              </p>
              <p className="font-display text-t4 text-encre">{c.resultat}</p>
            </li>
          </Reveal>
        ))}
      </ol>
      <Reveal>
        <div className="grid gap-3 pt-6 md:grid-cols-[11rem_1fr] md:gap-8">
          <span className="etiquette md:pt-1">Réserve</span>
          <p className="max-w-3xl text-corps text-encre-2">{CONTROLES_VECUS.reserve}</p>
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
  texte = "Trente minutes, sans engagement, pour identifier vos trois principaux risques et décider de la suite. Aucune promesse de garantie contre un redressement : des faits, une méthode, un plan.",
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
              <h2 className="font-display text-t1-lg">{titre}</h2>
              <p className="max-w-xl text-chapo text-brume-2">{texte}</p>
            </div>
            <div className="flex flex-col gap-4 md:items-end">
              <Bouton href={href} taille="lg" variante="clair">
                {cta}
              </Bouton>
              <Link href="/audit#estimateur" className="souligne pb-0.5 text-corps text-brume hover:text-papier">
                Ou estimer ma mission en trente secondes
              </Link>
            </div>
          </div>
        </Reveal>
      </Conteneur>
    </section>
  );
}
