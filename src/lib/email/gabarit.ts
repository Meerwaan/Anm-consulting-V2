/**
 * Gabarit commun des emails d’ANM Consulting : HTML sobre (tableaux, styles en ligne, aucune image
 * distante) et version texte brut, construits à partir des mêmes blocs pour qu’ils disent la même chose.
 *
 * Direction artistique du site (src/app/globals.css) : fond #f6f7f5, papier #fbfbf9, encre #0e1f1c,
 * vert #0f3d35, filet #d3dad6, gris #5f6b67. Instrument Serif n’est pas disponible dans les messageries :
 * Georgia prend le relais pour les titres, Arial pour le texte.
 *
 * Tout texte venu d’un visiteur passe par `echapper` avant d’entrer dans le HTML.
 */

const C = {
  fond: "#f6f7f5",
  papier: "#fbfbf9",
  encre: "#0e1f1c",
  encre2: "#33403c",
  vert: "#0f3d35",
  menthe: "#eef6f1",
  filet: "#d3dad6",
  gris: "#5f6b67",
} as const;

const SERIF = "Georgia, 'Times New Roman', serif";
const SANS = "Arial, Helvetica, sans-serif";
const MONO = "'Courier New', Courier, monospace";

export const echapper = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#39;");

/** Échappe puis conserve les retours à la ligne d’un texte saisi par un visiteur. */
const multiligne = (s: string) => echapper(s).replace(/\r?\n/g, "<br>");

export type Bloc =
  | { type: "paragraphe"; texte: string; discret?: boolean }
  | { type: "liste"; items: readonly string[] }
  | { type: "bouton"; libelle: string; url: string }
  | { type: "champs"; lignes: readonly (readonly [string, string | null | undefined])[] }
  | { type: "citation"; texte: string };

export interface Contenu {
  /** Texte d’aperçu affiché par la messagerie à côté de l’objet. */
  apercu: string;
  surtitre: string;
  titre: string;
  blocs: Bloc[];
  /** Mentions de bas de page : origine de l’email, désinscription. */
  mentions: string[];
  /** Lien de désinscription en un clic, affiché dans les mentions. */
  desinscription?: string;
}

const blocHtml = (b: Bloc): string => {
  switch (b.type) {
    case "paragraphe":
      return `<p style="margin:0 0 16px;font-family:${SANS};font-size:15px;line-height:1.65;color:${b.discret ? C.gris : C.encre2};">${multiligne(b.texte)}</p>`;
    case "liste":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;border-top:1px solid ${C.filet};">${b.items
        .map(
          (item, i) =>
            `<tr><td valign="top" style="width:36px;padding:10px 0;border-bottom:1px solid ${C.filet};font-family:${MONO};font-size:12px;color:${C.gris};">${String(i + 1).padStart(2, "0")}</td><td style="padding:10px 0;border-bottom:1px solid ${C.filet};font-family:${SANS};font-size:15px;line-height:1.55;color:${C.encre};">${echapper(item)}</td></tr>`,
        )
        .join("")}</table>`;
    case "bouton":
      return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:8px 0 24px;"><tr><td style="background:${C.vert};border-radius:3px;"><a href="${echapper(b.url)}" style="display:inline-block;padding:12px 22px;font-family:${SANS};font-size:15px;font-weight:bold;color:${C.papier};text-decoration:none;">${echapper(b.libelle)}</a></td></tr></table>`;
    case "champs":
      return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:4px 0 20px;border-top:1px solid ${C.filet};">${b.lignes
        .filter(([, v]) => v != null && v !== "")
        .map(
          ([label, v]) =>
            `<tr><td valign="top" style="width:140px;padding:9px 12px 9px 0;border-bottom:1px solid ${C.filet};font-family:${MONO};font-size:11px;letter-spacing:1px;text-transform:uppercase;color:${C.gris};">${echapper(label)}</td><td style="padding:9px 0;border-bottom:1px solid ${C.filet};font-family:${SANS};font-size:15px;line-height:1.55;color:${C.encre};">${multiligne(String(v))}</td></tr>`,
        )
        .join("")}</table>`;
    case "citation":
      return `<div style="margin:4px 0 20px;padding:14px 16px;border-left:2px solid ${C.vert};background:${C.menthe};font-family:${SANS};font-size:15px;line-height:1.65;color:${C.encre};">${multiligne(b.texte)}</div>`;
  }
};

const blocTexte = (b: Bloc): string => {
  switch (b.type) {
    case "paragraphe":
      return b.texte;
    case "liste":
      return b.items.map((item, i) => `${String(i + 1).padStart(2, "0")}. ${item}`).join("\n");
    case "bouton":
      return `${b.libelle} : ${b.url}`;
    case "champs":
      return b.lignes
        .filter(([, v]) => v != null && v !== "")
        .map(([label, v]) => `${label} : ${v}`)
        .join("\n");
    case "citation":
      return b.texte
        .split(/\r?\n/)
        .map((l) => `> ${l}`)
        .join("\n");
  }
};

export const composer = (c: Contenu): { html: string; text: string } => {
  const mentionsHtml = c.mentions
    .map((m) => `<p style="margin:0 0 8px;font-family:${SANS};font-size:12px;line-height:1.5;color:${C.gris};">${echapper(m)}</p>`)
    .join("");
  const desinscriptionHtml = c.desinscription
    ? `<p style="margin:0;font-family:${SANS};font-size:12px;line-height:1.5;color:${C.gris};"><a href="${echapper(c.desinscription)}" style="color:${C.gris};text-decoration:underline;">Se désinscrire en un clic</a></p>`
    : "";

  const html = `<!doctype html>
<html lang="fr">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light">
<title>${echapper(c.titre)}</title>
</head>
<body style="margin:0;padding:0;background:${C.fond};">
<div style="display:none;max-height:0;overflow:hidden;opacity:0;">${echapper(c.apercu)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${C.fond};">
<tr><td align="center" style="padding:32px 16px;">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background:${C.papier};border:1px solid ${C.filet};border-radius:5px;">
<tr><td style="padding:22px 28px 16px;font-family:${MONO};font-size:11px;letter-spacing:2px;text-transform:uppercase;color:${C.encre};">ANM Consulting</td></tr>
<tr><td style="height:2px;line-height:2px;font-size:0;background:${C.encre};">&nbsp;</td></tr>
<tr><td style="padding:28px 28px 8px;">
<p style="margin:0 0 10px;font-family:${MONO};font-size:11px;letter-spacing:1.5px;text-transform:uppercase;color:${C.gris};">${echapper(c.surtitre)}</p>
<h1 style="margin:0 0 22px;font-family:${SERIF};font-size:28px;line-height:1.15;font-weight:normal;color:${C.encre};">${echapper(c.titre)}</h1>
${c.blocs.map(blocHtml).join("\n")}
</td></tr>
<tr><td style="padding:0 28px 26px;">
<p style="margin:0 0 4px;font-family:${SANS};font-size:15px;line-height:1.6;color:${C.encre};">ANM Consulting</p>
<p style="margin:0;font-family:${SANS};font-size:13px;line-height:1.6;color:${C.gris};">Audit et préparation aux contrôles en sécurité privée · <a href="mailto:contact@anm-consulting.fr" style="color:${C.vert};">contact@anm-consulting.fr</a></p>
</td></tr>
</table>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;">
<tr><td style="padding:18px 28px 0;">${mentionsHtml}${desinscriptionHtml}</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`;

  const text = [
    c.titre,
    "",
    ...c.blocs.flatMap((b) => [blocTexte(b), ""]),
    "ANM Consulting",
    "Audit et préparation aux contrôles en sécurité privée · contact@anm-consulting.fr",
    "",
    "—",
    ...c.mentions,
    ...(c.desinscription ? [`Se désinscrire en un clic : ${c.desinscription}`] : []),
  ].join("\n");

  return { html, text };
};
