import Link from "next/link";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import type { ReactNode } from "react";

type Variante = "primaire" | "encre" | "fantome" | "lien" | "clair";
type Taille = "sm" | "md" | "lg";

const base =
  "group inline-flex items-center gap-3 rounded-full font-medium transition-[transform,background-color,color,border-color,box-shadow] duration-500 ease-expo active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60";

const variantes: Record<Variante, string> = {
  primaire: "bg-vert text-papier hover:bg-vert-2 shadow-carte hover:shadow-flottant",
  encre: "bg-encre text-papier hover:bg-vert",
  fantome: "border border-encre/80 text-encre hover:border-encre hover:bg-encre hover:text-papier",
  clair: "border border-papier/30 text-papier hover:bg-papier hover:text-encre",
  lien: "rounded-none gap-2 text-vert",
};

const tailles: Record<Taille, string> = {
  sm: "px-4 py-2 text-[13px]",
  md: "px-5 py-2.5 text-sm",
  lg: "px-6 py-3 text-[15px]",
};

const cercle: Record<Variante, string> = {
  primaire: "bg-papier/15 text-papier",
  encre: "bg-papier/15 text-papier",
  fantome: "bg-encre/8 text-encre group-hover:bg-papier/15 group-hover:text-papier",
  clair: "bg-papier/15 text-papier group-hover:bg-encre/10 group-hover:text-encre",
  lien: "",
};

export function Bouton({
  href,
  children,
  variante = "primaire",
  taille = "md",
  fleche = true,
  type = "button",
  disabled,
  className = "",
  onClick,
}: {
  href?: string;
  children: ReactNode;
  variante?: Variante;
  taille?: Taille;
  fleche?: boolean;
  type?: "button" | "submit";
  disabled?: boolean;
  className?: string;
  onClick?: () => void;
}) {
  const classes =
    variante === "lien"
      ? `${base} ${variantes.lien} ${className}`
      : `${base} ${variantes[variante]} ${tailles[taille]} ${fleche ? "pr-2" : ""} ${className}`;

  const contenu = (
    <>
      <span className={variante === "lien" ? "souligne pb-0.5" : ""}>{children}</span>
      {fleche && variante === "lien" ? (
        <ArrowUpRight
          size={16}
          weight="regular"
          className="transition-transform duration-500 ease-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
        />
      ) : null}
      {fleche && variante !== "lien" ? (
        <span
          aria-hidden
          className={`flex size-7 items-center justify-center rounded-full transition-[transform,background-color,color] duration-500 ease-expo group-hover:-translate-y-px group-hover:translate-x-px group-hover:scale-105 ${cercle[variante]}`}
        >
          <ArrowUpRight size={14} weight="bold" />
        </span>
      ) : null}
    </>
  );

  if (href) {
    return (
      <Link href={href} className={classes}>
        {contenu}
      </Link>
    );
  }
  return (
    <button type={type} className={classes} disabled={disabled} onClick={onClick}>
      {contenu}
    </button>
  );
}
