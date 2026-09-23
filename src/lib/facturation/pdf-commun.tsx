import path from "node:path";
import { Font, StyleSheet, Text, View } from "@react-pdf/renderer";

/**
 * Ce que partagent le contrat et la facture : les polices et la charte du rapport, et la
 * typographie française. Les polices du PDF n'ont pas l'espace fine : l'insécable la remplace.
 */

const polices = path.join(process.cwd(), "src/lib/rapport/polices");
Font.register({
  family: "Archivo",
  fonts: [
    { src: path.join(polices, "archivo-latin-400-normal.ttf"), fontWeight: 400 },
    { src: path.join(polices, "archivo-latin-500-normal.ttf"), fontWeight: 500 },
    { src: path.join(polices, "archivo-latin-600-normal.ttf"), fontWeight: 600 },
  ],
});
Font.register({
  family: "Instrument Serif",
  fonts: [
    { src: path.join(polices, "instrument-serif-latin-400-normal.ttf") },
    { src: path.join(polices, "instrument-serif-latin-400-italic.ttf"), fontStyle: "italic" },
  ],
});
Font.register({ family: "Plex Mono", src: path.join(polices, "ibm-plex-mono-latin-400-normal.ttf") });
Font.registerHyphenationCallback((mot) => [mot]);

export const C = {
  encre: "#0e1f1c",
  encre2: "#33403c",
  vert: "#0f3d35",
  gris: "#5f6b67",
  filet: "#d3dad6",
  menthe: "#eef6f1",
  critique: "#8a1f1b",
};

/** Espace insécable avant « : ; ? ! » et à l'intérieur des guillemets. */
export const typo = (t: string): string =>
  t
    .replace(/[  ]([:;?!»])/g, " $1")
    .replace(/«[  ]/g, "« ")
    .replace(/ /g, " ");

export const s = StyleSheet.create({
  page: { paddingTop: 64, paddingBottom: 60, paddingHorizontal: 56, fontFamily: "Archivo", fontSize: 9.5, color: C.encre },
  corps: { fontSize: 9.5, lineHeight: 1.5 },
  entete: { position: "absolute", top: 26, left: 56, right: 56, flexDirection: "row", justifyContent: "space-between", fontFamily: "Plex Mono", fontSize: 7, color: C.gris, borderBottomWidth: 0.5, borderBottomColor: C.filet, paddingBottom: 6 },
  pied: { position: "absolute", bottom: 26, left: 56, right: 56, flexDirection: "row", justifyContent: "space-between", fontFamily: "Plex Mono", fontSize: 7, color: C.gris },
  etiquette: { fontFamily: "Plex Mono", fontSize: 7.5, letterSpacing: 1.2, color: C.gris, textTransform: "uppercase" },
  h1: { fontFamily: "Instrument Serif", fontSize: 28, lineHeight: 1.1, color: C.encre },
  h2: { fontFamily: "Instrument Serif", fontSize: 15, lineHeight: 1.2, color: C.encre, marginTop: 16, marginBottom: 6 },
  h3: { fontSize: 9.5, fontWeight: 600, marginTop: 6, marginBottom: 2 },
  p: { marginBottom: 5 },
  fort: { fontWeight: 600 },
  aCompleter: { color: C.critique, fontWeight: 500 },
  puce: { flexDirection: "row", marginBottom: 2, paddingLeft: 8 },
  puceMarque: { width: 10 },
  filet: { borderBottomWidth: 0.5, borderBottomColor: C.filet, marginVertical: 10 },
});

/** Une valeur, ou « à compléter » en rouge : ce qui manque se voit sur le PDF même. */
export const Valeur = ({ v }: { v: string | null | undefined }) =>
  v ? <Text>{typo(v)}</Text> : <Text style={s.aCompleter}>à compléter</Text>;

export const Puces = ({ items, numerotee = false }: { items: string[]; numerotee?: boolean }) => (
  <View style={{ marginBottom: 5 }}>
    {items.map((it, i) => (
      <View key={i} style={s.puce} wrap={false}>
        <Text style={s.puceMarque}>{numerotee ? `${i + 1}.` : "•"}</Text>
        <Text style={{ flex: 1 }}>{typo(it)}</Text>
      </View>
    ))}
  </View>
);

export const EnTete = ({ gauche, droite }: { gauche: string; droite: string }) => (
  <View style={s.entete} fixed>
    <Text>{typo(gauche)}</Text>
    <Text>{typo(droite)}</Text>
  </View>
);

export const Pied = ({ gauche }: { gauche: string }) => (
  <View style={s.pied} fixed>
    <Text>{typo(gauche)}</Text>
    <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
  </View>
);
