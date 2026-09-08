import type { ReactNode } from "react";
import { DERNIERE_MISE_A_JOUR } from "@/content/legal";

/**
 * Gabarit commun aux pages légales : colonne de lecture étroite, titres sérif,
 * date de mise à jour en pied de page. Aucune de ces pages n'est indexée tant
 * que le site n'est pas en ligne avec les informations réelles.
 */
export function LegalPage({
  titre,
  chapeau,
  children,
}: {
  titre: string;
  chapeau?: string;
  children: ReactNode;
}) {
  return (
    <article className="mx-auto max-w-[68ch] space-y-8">
      <header className="space-y-3 border-b border-[var(--anm-hairline)] pb-6">
        <h1 className="text-3xl text-[var(--anm-ink)]">{titre}</h1>
        {chapeau ? <p className="text-[var(--anm-muted)]">{chapeau}</p> : null}
      </header>
      <div className="space-y-8 text-[15px] leading-relaxed">{children}</div>
      <footer className="border-t border-[var(--anm-hairline)] pt-4 font-mono text-xs text-[var(--anm-muted)]">
        Dernière mise à jour : {DERNIERE_MISE_A_JOUR}
      </footer>
    </article>
  );
}

/** Section titrée d'une page légale. */
export function Section({ titre, children }: { titre: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xl text-[var(--anm-ink)]">{titre}</h2>
      {children}
    </section>
  );
}

/** Liste de paires libellé / valeur, utilisée pour l'identité de l'éditeur. */
export function Definitions({ items }: { items: { label: string; value: string }[] }) {
  return (
    <dl className="grid grid-cols-[minmax(9rem,auto)_1fr] gap-x-6 gap-y-2">
      {items.map((item) => (
        <div key={item.label} className="contents">
          <dt className="font-mono text-xs uppercase tracking-wide text-[var(--anm-muted)]">
            {item.label}
          </dt>
          <dd className="text-[var(--anm-ink)]">{item.value}</dd>
        </div>
      ))}
    </dl>
  );
}
