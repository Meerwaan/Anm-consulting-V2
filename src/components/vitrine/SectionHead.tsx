import type { ReactNode } from "react";
import { Reveal } from "./Reveal";

/**
 * Tête de section : index mono, titre serif, sous-titre optionnel.
 * `aligne="deux"` place le sous-titre à droite du titre sur grand écran.
 */
export function SectionHead({
  index,
  eyebrow,
  titre,
  sous,
  sombre = false,
  aligne = "un",
  taille = "md",
}: {
  index?: string;
  eyebrow: string;
  titre: ReactNode;
  sous?: ReactNode;
  sombre?: boolean;
  aligne?: "un" | "deux";
  taille?: "md" | "lg";
}) {
  const couleurEyebrow = sombre ? "text-brume" : "text-gris";
  const couleurSous = sombre ? "text-brume-2" : "text-encre-2";
  const tailleTitre = taille === "lg" ? "text-[2.6rem] md:text-[3.6rem]" : "text-[2.2rem] md:text-[2.9rem]";

  return (
    <Reveal>
      <div className={aligne === "deux" ? "grid gap-6 md:grid-cols-[1.4fr_1fr] md:items-end" : "max-w-3xl"}>
        <div className="space-y-4">
          <p className={`etiquette ${couleurEyebrow}`}>
            {index ? <span className="mr-3">{index}</span> : null}
            {eyebrow}
          </p>
          <h2 className={`${tailleTitre} leading-[1.05] ${sombre ? "text-papier" : "text-encre"}`}>{titre}</h2>
          {sous && aligne === "un" ? <p className={`max-w-2xl text-[17px] leading-relaxed ${couleurSous}`}>{sous}</p> : null}
        </div>
        {sous && aligne === "deux" ? (
          <p className={`text-[15px] leading-relaxed md:pb-2 ${couleurSous}`}>{sous}</p>
        ) : null}
      </div>
    </Reveal>
  );
}

/** Conteneur de page : largeur de lecture, gouttières. */
export function Conteneur({ children, className = "", large = false }: { children: ReactNode; className?: string; large?: boolean }) {
  return <div className={`mx-auto w-full ${large ? "max-w-[1320px]" : "max-w-[1200px]"} px-5 md:px-10 ${className}`}>{children}</div>;
}

/** Filet horizontal, épais (encre) ou fin (filet). */
export function Filet({ epais = false, sombre = false }: { epais?: boolean; sombre?: boolean }) {
  const couleur = sombre ? (epais ? "bg-papier" : "bg-nuit") : epais ? "bg-encre" : "bg-filet";
  return <div className={`${couleur} ${epais ? "h-[1.5px]" : "h-px"} w-full`} aria-hidden />;
}
