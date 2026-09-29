import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import { typographie } from "./typographie";

/**
 * Image de partage (1200 × 630) aux couleurs de la vitrine : fond encre, texte papier, accent menthe.
 * Polices du site (Instrument Serif, Archivo, IBM Plex Mono), lues depuis src/lib/rapport/polices :
 * next.config.ts les embarque avec les routes /observatoire (outputFileTracingIncludes).
 */
export const TAILLE_OG = { width: 1200, height: 630 };

const COULEURS = { encre: "#0e1f1c", papier: "#fbfbf9", menthe: "#dcefe5", brume: "#9fb3ac", nuit: "#2c4a43" };

const police = (fichier: string) => readFile(join(process.cwd(), "src/lib/rapport/polices", fichier));

export async function imageObservatoire({
  etiquette,
  titre,
  detail,
}: {
  etiquette: string;
  titre: string;
  detail?: string | null;
}) {
  const [serif, sans, mono] = await Promise.all([
    police("instrument-serif-latin-400-normal.ttf"),
    police("archivo-latin-500-normal.ttf"),
    police("ibm-plex-mono-latin-400-normal.ttf"),
  ]);
  const t = typographie(titre);
  const tailleTitre = t.length > 110 ? 50 : t.length > 70 ? 60 : 72;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: COULEURS.encre,
          color: COULEURS.papier,
          padding: "64px 72px",
          fontFamily: "Archivo",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <div style={{ display: "flex", fontFamily: "Plex Mono", fontSize: 22, letterSpacing: 4, textTransform: "uppercase", color: COULEURS.menthe }}>
            {etiquette}
          </div>
          <div style={{ display: "flex", alignItems: "baseline", gap: 10 }}>
            <span style={{ fontFamily: "Instrument Serif", fontSize: 40, color: COULEURS.papier }}>ANM</span>
            <span style={{ fontFamily: "Plex Mono", fontSize: 14, letterSpacing: 6, textTransform: "uppercase", color: COULEURS.brume }}>Consulting</span>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
          <div style={{ display: "flex", fontFamily: "Instrument Serif", fontSize: tailleTitre, lineHeight: 1.04, letterSpacing: -1, maxWidth: 1000 }}>
            {t}
          </div>
          {detail ? <div style={{ display: "flex", fontSize: 26, color: COULEURS.menthe }}>{typographie(detail)}</div> : null}
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderTop: `1.5px solid ${COULEURS.nuit}`,
            paddingTop: 24,
            gap: 32,
            fontSize: 18,
            color: COULEURS.brume,
          }}
        >
          <span>{typographie("L’Observatoire ANM de la sécurité privée")}</span>
          <span>{typographie("Repérez vos écarts avant qu’un contrôleur ne les trouve.")}</span>
        </div>
      </div>
    ),
    {
      ...TAILLE_OG,
      fonts: [
        { name: "Instrument Serif", data: serif, style: "normal", weight: 400 },
        { name: "Archivo", data: sans, style: "normal", weight: 500 },
        { name: "Plex Mono", data: mono, style: "normal", weight: 400 },
      ],
    },
  );
}
