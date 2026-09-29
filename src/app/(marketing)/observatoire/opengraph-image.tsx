import { OBSERVATOIRE } from "@/content/observatoire";
import { TAILLE_OG, imageObservatoire } from "@/lib/observatoire/og";

export const alt = OBSERVATOIRE.nomLong;
export const size = TAILLE_OG;
export const contentType = "image/png";

export default function Image() {
  return imageObservatoire({ etiquette: "L’Observatoire ANM", titre: OBSERVATOIRE.promesse, detail: "CNAPS · URSSAF · DGFiP · Inspection du travail" });
}
