/** Affichage à la française : espaces fines comme séparateur de milliers, insécable avant l'unité. */

/** Signe moins typographique (U+2212) plutôt que le trait d'union. */
const moins = (t: string) => t.replace(/^-/, "−");

export const fmtHeures = (n: number | null | undefined): string =>
  n === null || n === undefined ? "—" : moins(`${n.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} h`);

export const fmtEuros = (n: number | null | undefined): string =>
  n === null || n === undefined
    ? "—"
    : moins(`${n.toLocaleString("fr-FR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`);

/** Montant rond, sans centimes : « 5 000 € ». */
export const fmtEurosRond = (n: number): string => moins(`${n.toLocaleString("fr-FR", { maximumFractionDigits: 0 })} €`);

export const fmtPct = (n: number | null | undefined): string =>
  n === null || n === undefined ? "—" : moins(`${n.toLocaleString("fr-FR", { maximumFractionDigits: 1 })} %`);

export const fmtNombre = (n: number | null | undefined): string =>
  n === null || n === undefined ? "—" : moins(n.toLocaleString("fr-FR", { maximumFractionDigits: 2 }));

/** « 2026-03 » ou « 2026-03-01 » → « mars 2026 ». */
export const fmtMois = (m: string): string =>
  new Date(`${m.slice(0, 7)}-01T12:00:00Z`).toLocaleDateString("fr-FR", { month: "long", year: "numeric", timeZone: "UTC" });

/** « 2026-03-31 » → « 31/03/2026 ». */
export const fmtDate = (d: string | null): string =>
  d ? new Date(`${d}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" }) : "—";
