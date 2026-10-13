// Fabrique le logo des emails à partir du logo vectoriel du kit : node scripts/logo-email.mjs
//
// Les messageries n'affichent pas le SVG, et certaines (Gmail en mode sombre) assombrissent le fond
// du message sans toucher aux images : un logo « couleur » sur fond transparent y deviendrait
// illisible. Le PNG porte donc son propre fond papier, avec la zone de protection du kit autour.
//
// Affiché à 192 × 98 px (logo de 160 px de large, 16 px de marge), fabriqué en triple densité.
import { mkdir } from "node:fs/promises";
import sharp from "sharp";

const SOURCE = "src/lib/marque/logos/ANM-Consulting_1_horizontal_couleur.svg";
const SORTIE = "public/email/logo-anm-consulting.png";
const PAPIER = "#FBFBF9";
const DENSITE = 3;
const [LARGEUR, HAUTEUR, LOGO] = [192, 98, 160].map((px) => px * DENSITE);

const logo = await sharp(SOURCE, { density: 600 }).resize({ width: LOGO }).png().toBuffer();
const { height: hauteurLogo } = await sharp(logo).metadata();

await mkdir("public/email", { recursive: true });
await sharp({ create: { width: LARGEUR, height: HAUTEUR, channels: 3, background: PAPIER } })
  .composite([{ input: logo, left: (LARGEUR - LOGO) / 2, top: Math.round((HAUTEUR - hauteurLogo) / 2) }])
  .removeAlpha()
  .png({ compressionLevel: 9 })
  .toFile(SORTIE);

console.log(`${SORTIE} : ${LARGEUR} × ${HAUTEUR} px (logo ${LOGO} × ${hauteurLogo} px)`);
