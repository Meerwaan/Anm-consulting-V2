import { MANIFESTE, PHRASE_CHOC, PONT_OBSERVATOIRE } from "@/content/vitrine";
import { Bouton } from "./Bouton";
import { Reveal } from "./Reveal";
import { Conteneur, Filet } from "./SectionHead";

/*
 * Les textes de Sofia (docs/observatoire/01 et 02) : repris mot pour mot, seule la mise en page change.
 * Instrument Serif n'existe qu'en une graisse : le « gras » qu'elle demande passe par l'échelle
 * (la plus grande taille du site), la couleur et l'italique, jamais par un faux gras synthétisé.
 */

/* ------------------------------------------------------------------ */
/* La phrase choc : une section plein écart, avant la grille tarifaire */
/* ------------------------------------------------------------------ */

export function PhraseChoc() {
  return (
    <section aria-label="Le coût d’une mise en conformité tardive" className="bg-vert text-papier">
      <Conteneur className="py-24 md:py-36">
        <Reveal>
          <figure className="max-w-5xl space-y-10">
            <p className="etiquette !text-menthe">Avant de parler de prix</p>
            <blockquote className="font-display text-t1 text-papier md:text-t1-lg lg:text-t1-xl">
              <p>
                {PHRASE_CHOC.debut} <em className="text-menthe">{PHRASE_CHOC.accent}</em>
              </p>
            </blockquote>
            <figcaption className="flex items-center gap-4">
              <span className="h-px w-10 bg-menthe" aria-hidden />
              <span className="etiquette !text-menthe">{PHRASE_CHOC.auteur}</span>
            </figcaption>
          </figure>
        </Reveal>
      </Conteneur>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* « TVA • Sous-traitance • URSSAF • CNAPS », en bandeau               */
/* ------------------------------------------------------------------ */

export function ManifesteDomaines() {
  return (
    <ul className="grid grid-cols-2 gap-x-5 gap-y-2 border-y-[1.5px] border-encre py-5 sm:flex sm:flex-wrap sm:items-center">
      {MANIFESTE.domaines.map((d, i) => (
        <li key={d} className="flex items-center gap-x-5 whitespace-nowrap font-display text-t4 text-encre md:text-t3">
          {/* Sur mobile, grille 2 × 2 sans puces : une puce en début de ligne ferait désordre. */}
          {i > 0 ? <span className="hidden size-1.5 rounded-full bg-vert sm:block" aria-hidden /> : null}
          {d}
        </li>
      ))}
    </ul>
  );
}

/* ------------------------------------------------------------------ */
/* Le manifeste complet (ouverture de la page À propos)                */
/* ------------------------------------------------------------------ */

/** Le texte intégral, dans son ordre. Le titre de la page (h1) est sa première phrase. */
export function Manifeste() {
  return (
    <div className="space-y-10 md:space-y-12">
      <Reveal delay={0.05}>
        <div className="space-y-6">
          <h1 className="font-display text-t1 text-encre md:text-t1-lg">{MANIFESTE.ouverture}</h1>
          <p className="max-w-2xl font-display text-t2 italic text-vert md:text-t2-lg">{MANIFESTE.ouvertureSuite}</p>
        </div>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="space-y-6">
          <Filet epais />
          <p className="font-display text-t3 text-encre">{MANIFESTE.duree}</p>
          <p className="font-display text-t3 text-encre-2">
            {MANIFESTE.rythme.map((ligne) => (
              <span key={ligne} className="block">
                {ligne}
              </span>
            ))}
          </p>
        </div>
      </Reveal>

      <Reveal>
        <div className="space-y-6">
          <p className="font-display text-t2 text-encre md:text-t2-lg">
            <span className="block">{MANIFESTE.metier}</span>
            <em className="block text-vert">{MANIFESTE.place}</em>
          </p>
          <p className="max-w-xl text-chapo text-encre-2">{MANIFESTE.role}</p>
        </div>
      </Reveal>

      <Reveal>
        <ManifesteDomaines />
      </Reveal>

      <Reveal>
        <figure className="space-y-4">
          <p className="etiquette">{MANIFESTE.marque}</p>
          <blockquote className="font-display text-t2 italic text-encre md:text-t2-lg">
            {MANIFESTE.signature.map((ligne) => (
              <span key={ligne} className="block">
                {ligne}
              </span>
            ))}
          </blockquote>
          <figcaption className="etiquette !text-encre">{MANIFESTE.auteur}</figcaption>
        </figure>
      </Reveal>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Le manifeste en quelques lignes (accueil, section « La fondatrice ») */
/* ------------------------------------------------------------------ */

export function ManifesteCourt() {
  return (
    <figure className="space-y-6">
      <blockquote className="space-y-6">
        <p className="font-display text-t2 text-encre md:text-t2-lg">
          {MANIFESTE.ouverture} <em className="text-vert">{MANIFESTE.ouvertureSuite}</em>
        </p>
        <p className="font-display text-t4 text-encre-2">
          {MANIFESTE.rythme.map((ligne) => (
            <span key={ligne} className="block">
              {ligne}
            </span>
          ))}
        </p>
        <p className="font-display text-t3 text-encre">
          <span className="block">{MANIFESTE.metier}</span>
          <em className="block text-vert">{MANIFESTE.place}</em>
        </p>
      </blockquote>
      <figcaption className="etiquette !text-encre">{PHRASE_CHOC.auteur}</figcaption>
    </figure>
  );
}

/* ------------------------------------------------------------------ */
/* Le pont vers l'Observatoire                                         */
/* ------------------------------------------------------------------ */

export function PontObservatoire() {
  return (
    <div className="grid gap-6 border-t-[1.5px] border-encre pt-8 md:grid-cols-[1.4fr_1fr] md:items-end md:gap-12">
      <p className="font-display text-t3 text-encre">
        {PONT_OBSERVATOIRE.phrase} <em className="text-vert">{PONT_OBSERVATOIRE.accent}</em>
      </p>
      <div className="space-y-3 md:pb-1">
        <p className="text-corps text-encre-2">{PONT_OBSERVATOIRE.texte}</p>
        <Bouton href={PONT_OBSERVATOIRE.href} variante="lien">
          {PONT_OBSERVATOIRE.lien}
        </Bouton>
      </div>
    </div>
  );
}
