import { Path, Svg } from "@react-pdf/renderer";
import { lireLogo } from "./traces";

/**
 * Le logo horizontal « couleur » dans un PDF, en vectoriel : net à l'écran comme à l'impression.
 * Largeur en points. Le kit demande 35 mm au minimum à l'impression, soit 100 pt, et autour du
 * logo un vide d'un quart de sa hauteur.
 */
export const LogoPdf = ({ largeur = 120 }: { largeur?: number }) => {
  const { viewBox, ratio, traces } = lireLogo("ANM-Consulting_1_horizontal_couleur.svg");
  return (
    <Svg viewBox={viewBox} style={{ width: largeur, height: largeur / ratio }}>
      {traces.map((t, i) => (
        <Path key={i} d={t.d} fill={t.couleur} />
      ))}
    </Svg>
  );
};
