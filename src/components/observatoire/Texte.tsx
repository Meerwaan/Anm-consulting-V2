import type { ReactNode } from "react";
import Link from "next/link";
import { typographie } from "@/lib/observatoire/typographie";
import { slugifier } from "@/lib/observatoire/article";

/**
 * Rendu du texte saisi dans l’outil : un markdown volontairement réduit, rendu en éléments React
 * (jamais de HTML injecté). Paragraphes séparés par une ligne vide, « ## » et « ### » pour les
 * intertitres, listes « - » ou « 1. », citations « > », **gras**, *italique*, [lien](https://…).
 * La typographie française est appliquée à chaque morceau de texte, jamais aux adresses.
 */

type Bloc =
  | { type: "h2" | "h3" | "p" | "citation"; texte: string }
  | { type: "ul" | "ol"; items: string[] };

const LIEN = /\[([^\]]+)\]\(((?:https?:\/\/|\/)[^\s)]*)\)|\*\*([^*]+)\*\*|\*([^*\s][^*]*)\*|(https?:\/\/[^\s)<>]+[^\s)<>.,;:!?])/g;

export const Inline = ({ texte }: { texte: string }): ReactNode => {
  const morceaux: ReactNode[] = [];
  let dernier = 0;
  let cle = 0;
  for (const m of texte.matchAll(LIEN)) {
    const i = m.index ?? 0;
    if (i > dernier) morceaux.push(typographie(texte.slice(dernier, i)));
    const [, libelle, href, gras, italique, nue] = m;
    if (href) {
      morceaux.push(
        href.startsWith("/") ? (
          <Link key={cle++} href={href} className="text-vert underline underline-offset-4 hover:text-encre">
            {typographie(libelle)}
          </Link>
        ) : (
          <a key={cle++} href={href} rel="noopener" target="_blank" className="text-vert underline underline-offset-4 hover:text-encre">
            {typographie(libelle)}
          </a>
        ),
      );
    } else if (gras) morceaux.push(<strong key={cle++} className="font-semibold text-encre">{typographie(gras)}</strong>);
    else if (italique) morceaux.push(<em key={cle++}>{typographie(italique)}</em>);
    else if (nue)
      morceaux.push(
        <a key={cle++} href={nue} rel="noopener" target="_blank" className="break-all text-vert underline underline-offset-4 hover:text-encre">
          {nue.replace(/^https?:\/\/(www\.)?/, "")}
        </a>,
      );
    dernier = i + m[0].length;
  }
  if (dernier < texte.length) morceaux.push(typographie(texte.slice(dernier)));
  return <>{morceaux}</>;
};

export const analyser = (source: string): Bloc[] => {
  const blocs: Bloc[] = [];
  const lignes = source.replace(/\r\n?/g, "\n").split("\n");
  let paragraphe: string[] = [];
  const clore = () => {
    if (paragraphe.length) blocs.push({ type: "p", texte: paragraphe.join(" ") });
    paragraphe = [];
  };
  for (const brute of lignes) {
    const ligne = brute.trim();
    if (!ligne) {
      clore();
      continue;
    }
    const titre = ligne.match(/^(#{2,3})\s+(.+)$/);
    const puce = ligne.match(/^[-*•]\s+(.+)$/);
    const numero = ligne.match(/^\d+[.)]\s+(.+)$/);
    const cite = ligne.match(/^>\s?(.*)$/);
    const precedent = blocs[blocs.length - 1];
    if (titre) {
      clore();
      blocs.push({ type: titre[1].length === 2 ? "h2" : "h3", texte: titre[2] });
    } else if (puce || numero) {
      clore();
      const type = puce ? "ul" : "ol";
      const item = (puce ?? numero)![1];
      if (precedent && precedent.type === type) precedent.items.push(item);
      else blocs.push({ type, items: [item] });
    } else if (cite) {
      clore();
      if (precedent && precedent.type === "citation") precedent.texte += ` ${cite[1]}`;
      else blocs.push({ type: "citation", texte: cite[1] });
    } else {
      paragraphe.push(ligne);
    }
  }
  clore();
  return blocs;
};

/** Les intertitres « ## » d’un texte, pour le sommaire d’un dossier. */
export const intertitres = (source: string) =>
  analyser(source)
    .filter((b): b is { type: "h2"; texte: string } => b.type === "h2")
    .map((b) => ({ id: slugifier(b.texte), texte: b.texte }));

export function Texte({ source, className = "" }: { source: string; className?: string }) {
  const blocs = analyser(source);
  return (
    <div className={`flex flex-col gap-5 text-corps text-encre-2 md:text-chapo ${className}`}>
      {blocs.map((b, i) => {
        switch (b.type) {
          case "h2":
            return (
              <h2 key={i} id={slugifier(b.texte)} className="mt-8 scroll-mt-28 font-display text-t3 text-encre first:mt-0">
                <Inline texte={b.texte} />
              </h2>
            );
          case "h3":
            return (
              <h3 key={i} className="mt-4 font-display text-t4 text-encre">
                <Inline texte={b.texte} />
              </h3>
            );
          case "ul":
            return (
              <ul key={i} className="flex flex-col gap-2 pl-5 [list-style:disc] marker:text-gris">
                {b.items.map((it, j) => (
                  <li key={j} className="pl-1">
                    <Inline texte={it} />
                  </li>
                ))}
              </ul>
            );
          case "ol":
            return (
              <ol key={i} className="flex flex-col gap-2 pl-5 [list-style:decimal] marker:font-mono marker:text-gris">
                {b.items.map((it, j) => (
                  <li key={j} className="pl-1">
                    <Inline texte={it} />
                  </li>
                ))}
              </ol>
            );
          case "citation":
            return (
              <blockquote key={i} className="font-display text-t4 italic text-encre">
                <Inline texte={b.texte} />
              </blockquote>
            );
          default:
            return (
              <p key={i}>
                <Inline texte={b.texte} />
              </p>
            );
        }
      })}
    </div>
  );
}

/** Les sources d’un article : une par ligne ; l’adresse éventuelle devient un lien. */
export function Sources({ source }: { source: string }) {
  const lignes = source
    .split(/\r?\n/)
    .map((l) => l.replace(/^[-*•]\s+/, "").trim())
    .filter(Boolean);
  if (!lignes.length) return null;
  return (
    <ul className="flex flex-col gap-2 text-meta text-encre-2">
      {lignes.map((l, i) => (
        <li key={i}>
          <Inline texte={l} />
        </li>
      ))}
    </ul>
  );
}
