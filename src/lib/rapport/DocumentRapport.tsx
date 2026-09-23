import path from "node:path";
import { Document, Font, Page, StyleSheet, Text, View } from "@react-pdf/renderer";
import { fmtDate, fmtEuros, fmtHeures, fmtMois, fmtNombre, fmtPct } from "@/lib/sous-traitance/format";
import { GRILLE_SOUS_TRAITANT } from "@/content/grilles";
import { TITRES_TEXTES, type ChapitreModule, type ModeleRapport, type PointDefavorable } from "./modele";

/**
 * Le rapport PDF, produit côté serveur : identique sur iPad, ordinateur et papier.
 * Charte du site : Instrument Serif pour les titres, Archivo pour le texte, IBM Plex Mono pour
 * les repères. La criticité se lit sans couleur : le mot est toujours écrit.
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
// Pas de césure automatique : elle coupe mal le français et les numéros.
Font.registerHyphenationCallback((mot) => [mot]);

const C = {
  encre: "#0e1f1c",
  encre2: "#33403c",
  vert: "#0f3d35",
  gris: "#5f6b67",
  filet: "#d3dad6",
  filet2: "#e6eae7",
  menthe: "#eef6f1",
  critique: "#8a1f1b",
  critiqueL: "#f6dedc",
  majeur: "#8a5a12",
  mineur: "#1f5a3a",
};

// L'interligne du texte courant est portée par un bloc « corps », jamais par la page : react-pdf
// recalcule à chaque page le style des éléments fixes (en-tête, pied, filigrane), et une
// interligne héritée de la page s'y remultiplie jusqu'à casser le rendu vers la treizième page.
const s = StyleSheet.create({
  page: { paddingTop: 64, paddingBottom: 60, paddingHorizontal: 52, fontFamily: "Archivo", fontSize: 9.5, color: C.encre },
  // La taille est répétée ici : sans elle, react-pdf calcule l'interligne sur sa taille par défaut (18).
  corps: { fontSize: 9.5, lineHeight: 1.5 },
  entete: { position: "absolute", top: 26, left: 52, right: 52, flexDirection: "row", justifyContent: "space-between", fontFamily: "Plex Mono", fontSize: 7, color: C.gris, borderBottomWidth: 0.5, borderBottomColor: C.filet, paddingBottom: 6 },
  pied: { position: "absolute", bottom: 26, left: 52, right: 52, flexDirection: "row", justifyContent: "space-between", fontFamily: "Plex Mono", fontSize: 7, color: C.gris },
  filigrane: { position: "absolute", top: 380, left: 60, fontFamily: "Instrument Serif", fontSize: 60, color: C.filet2, transform: "rotate(-30deg)" },
  etiquette: { fontFamily: "Plex Mono", fontSize: 7.5, letterSpacing: 1.2, color: C.gris, textTransform: "uppercase" },
  h1: { fontFamily: "Instrument Serif", fontSize: 30, lineHeight: 1.1, color: C.encre },
  h2: { fontFamily: "Instrument Serif", fontSize: 20, lineHeight: 1.15, color: C.encre, marginBottom: 10 },
  h3: { fontFamily: "Instrument Serif", fontSize: 14, lineHeight: 1.2, color: C.encre, marginTop: 14, marginBottom: 6 },
  para: { fontSize: 9.5, color: C.encre2, marginBottom: 6 },
  petit: { fontSize: 8, color: C.gris },
  filetEpais: { borderBottomWidth: 1.2, borderBottomColor: C.encre, marginBottom: 2 },
  ligne: { flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.filet, paddingVertical: 4 },
  enteteTableau: { flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.encre, paddingBottom: 3, fontSize: 7.5, color: C.encre2, fontWeight: 500 },
  chiffre: { fontFamily: "Instrument Serif", fontSize: 15, color: C.encre },
});

// ——— Petits éléments ——————————————————————————————————————————————————————————

const Paragraphes = ({ texte }: { texte: string }) => (
  <>
    {texte.split(/\n{2,}|\n/).filter(Boolean).map((p, i) => (
      <Text key={i} style={s.para}>{p}</Text>
    ))}
  </>
);

const Tableau = ({ colonnes, lignes, alignDroite = [] }: { colonnes: { t: string; w: string }[]; lignes: (string | { t: string; c?: string; b?: boolean })[][]; alignDroite?: number[] }) => (
  <View style={{ marginVertical: 6 }}>
    <View style={s.enteteTableau} minPresenceAhead={40}>
      {colonnes.map((c, i) => (
        <Text key={i} style={{ width: c.w, textAlign: alignDroite.includes(i) ? "right" : "left", paddingRight: alignDroite.includes(i) ? 12 : 4 }}>{c.t}</Text>
      ))}
    </View>
    {lignes.map((l, j) => (
      <View key={j} style={s.ligne} wrap={false}>
        {l.map((cel, i) => {
          const o = typeof cel === "string" ? { t: cel } : cel;
          return (
            <Text key={i} style={{ width: colonnes[i].w, textAlign: alignDroite.includes(i) ? "right" : "left", paddingRight: alignDroite.includes(i) ? 12 : 4, color: o.c ?? C.encre, fontWeight: o.b ? 500 : 400 }}>
              {o.t}
            </Text>
          );
        })}
      </View>
    ))}
  </View>
);

const Chiffres = ({ items }: { items: { t: string; v: string; c?: string }[] }) => (
  <View style={{ flexDirection: "row", flexWrap: "wrap", borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: C.filet, paddingVertical: 8, marginVertical: 8 }}>
    {items.map((x) => (
      <View key={x.t} style={{ width: "33.33%", paddingVertical: 4 }}>
        <Text style={s.petit}>{x.t}</Text>
        <Text style={[s.chiffre, x.c ? { color: x.c } : {}]}>{x.v}</Text>
      </View>
    ))}
  </View>
);

const Alertes = ({ alertes }: { alertes: { niveau: string; texte: string }[] }) =>
  alertes.length === 0 ? (
    <Text style={s.para}>Aucune alerte ne ressort des chiffres saisis.</Text>
  ) : (
    <View>
      {alertes.map((a, i) => (
        <View key={i} style={{ flexDirection: "row", marginBottom: 4 }} wrap={false}>
          <Text style={{ width: 62, fontWeight: 500, color: a.niveau === "alerte" ? C.critique : C.majeur }}>{a.niveau === "alerte" ? "Alerte" : "À vérifier"}</Text>
          <Text style={{ flex: 1, color: C.encre2 }}>{a.texte}</Text>
        </View>
      ))}
    </View>
  );

const Choix = ({ titre, valeur }: { titre: string; valeur: string | null }) => (
  <View style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.filet, paddingVertical: 4 }} wrap={false}>
    <Text style={{ width: "45%", color: C.encre2 }}>{titre}</Text>
    <Text style={{ width: "55%", fontWeight: 500, color: valeur ? C.encre : C.gris }}>{valeur ?? "Non conclu"}</Text>
  </View>
);

const libelleReponse = (r: string, alerte: boolean) => (alerte ? "Constaté" : r === "non" ? "Non" : "À vérifier");

const Points = ({ points }: { points: PointDefavorable[] }) =>
  points.length === 0 ? (
    <Text style={s.para}>Aucun point défavorable parmi ceux renseignés.</Text>
  ) : (
    <>
      {points.map((p, i) => (
        <View key={i} style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.filet, paddingVertical: 4 }} wrap={false}>
          <Text style={{ width: 62, fontWeight: 500, color: p.reponse === "a_verifier" ? C.majeur : C.critique }}>{libelleReponse(p.reponse, p.alerte)}</Text>
          <View style={{ flex: 1 }}>
            <Text>{p.libelle} <Text style={{ color: C.gris }}>· {p.section}</Text></Text>
            {p.observation ? <Text style={{ color: C.encre2 }}>{p.observation}</Text> : null}
          </View>
        </View>
      ))}
    </>
  );

const Module = ({ n, titre, intro, m, avant }: { n: string; titre: string; intro: string; m: ChapitreModule; avant?: React.ReactNode }) => (
  <View break>
    <Text style={s.etiquette}>{n}</Text>
    <Text style={s.h2}>{titre}</Text>
    <Text style={s.para}>{intro}</Text>
    <Chiffres
      items={[
        { t: "Points contrôlés", v: `${m.bilan.controles} / ${m.bilan.total}` },
        { t: "Conformes", v: String(m.bilan.conformes) },
        { t: "Non-conformités", v: String(m.bilan.nonConformes), c: m.bilan.nonConformes ? C.critique : undefined },
      ]}
    />
    {avant}
    {m.alertes.length ? (
      <>
        <Text style={s.h3} minPresenceAhead={70}>Ce qui ressort des chiffres</Text>
        <Alertes alertes={m.alertes} />
      </>
    ) : null}
    <Text style={s.h3} minPresenceAhead={70}>Points défavorables ou à vérifier</Text>
    <Points points={m.points} />
    <Text style={s.h3} minPresenceAhead={70}>Conclusions</Text>
    {m.conclusions.map((c) => (
      <Choix key={c.titre} titre={c.titre} valeur={c.valeur} />
    ))}
    {m.synthese ? <><Text style={s.h3} minPresenceAhead={70}>Synthèse de l’auditrice</Text><Paragraphes texte={m.synthese} /></> : null}
  </View>
);

const STATUT_ECHEANCE: Record<string, { t: string; c: string }> = {
  fournie: { t: "à jour", c: C.mineur },
  tardive: { t: "fournie en retard", c: C.majeur },
  manquante: { t: "manquante", c: C.critique },
  prochaine: { t: "prochaine échéance", c: C.encre },
  a_venir: { t: "à venir", c: C.gris },
};

// ——— Le document ——————————————————————————————————————————————————————————————

export const DocumentRapport = ({ r, version, dateEmission }: { r: ModeleRapport; version: string; dateEmission: string }) => {
  const brouillon = r.manques.length > 0;
  const periode = r.periode.debut && r.periode.fin ? `${fmtMois(r.periode.debut)} – ${fmtMois(r.periode.fin)}` : "Période à préciser";
  const entete = `${r.mission.client} · Rapport de contrôle`;

  return (
    <Document title={`Rapport de contrôle, ${r.mission.client}`} author={`${r.mission.auditeur}, ANM Consulting`} language="fr">
      {/* Page de garde */}
      <Page size="A4" style={[s.page, { paddingTop: 80 }]}>
        {brouillon ? <Text style={s.filigrane} fixed>Version de travail</Text> : null}
        <View style={s.corps}>
        <Text style={{ fontFamily: "Instrument Serif", fontSize: 18, color: C.encre }}>ANM Consulting</Text>
        <Text style={[s.etiquette, { marginTop: 4 }]}>Audit et préparation aux contrôles · sécurité privée</Text>
        <View style={{ marginTop: 170 }}>
          <Text style={s.etiquette}>Rapport de contrôle</Text>
          <Text style={[s.h1, { marginTop: 12 }]}>Sous-traitance, URSSAF, DGFiP et CNAPS</Text>
          <Text style={[s.h1, { color: C.vert, fontStyle: "italic", marginTop: 4 }]}>{r.mission.client}</Text>
        </View>
        <View style={{ marginTop: 40, borderTopWidth: 1.2, borderTopColor: C.encre }}>
          {[
            ["SIREN", r.mission.siren ?? "—"],
            ["Période contrôlée", periode],
            ["Référence de mission", r.mission.reference],
            ["Contexte", r.mission.controleEnCours ? `Contrôle ${r.mission.organisme ?? ""} en cours${r.mission.echeance ? `, échéance le ${fmtDate(r.mission.echeance)}` : ""}` : "Audit préventif"],
            ["Auditrice", r.mission.auditeur],
            ["Version", `${version} du ${dateEmission}`],
          ].map(([t, v]) => (
            <View key={t} style={[s.ligne, { paddingVertical: 6 }]}>
              <Text style={{ width: "40%", color: C.gris }}>{t}</Text>
              <Text style={{ width: "60%" }}>{v}</Text>
            </View>
          ))}
        </View>
        </View>
        <Text style={[s.petit, { position: "absolute", bottom: 40, left: 52, right: 52 }]}>
          Document confidentiel, diffusion restreinte. Il ne vaut ni certification ni garantie contre un redressement ou une sanction.
        </Text>
      </Page>

      {/* Corps */}
      <Page size="A4" style={s.page}>
        {brouillon ? <Text style={s.filigrane} fixed>Version de travail</Text> : null}
        <View style={s.entete} fixed>
          <Text>{entete}</Text>
          <Text>{r.mission.reference} · {version}</Text>
        </View>
        <View style={s.pied} fixed>
          <Text>Document confidentiel · diffusion restreinte</Text>
          <Text render={({ pageNumber, totalPages }) => `Page ${pageNumber} / ${totalPages}`} />
        </View>

        <View style={s.corps}>
        <Text style={s.etiquette}>1</Text>
        <Text style={s.h2}>{TITRES_TEXTES.contexte}</Text>
        <Paragraphes texte={r.textes.contexte.texte} />

        <Text style={[s.etiquette, { marginTop: 14 }]}>2</Text>
        <Text style={s.h2}>{TITRES_TEXTES.synthese}</Text>
        <Paragraphes texte={r.textes.synthese.texte} />
        <Chiffres
          items={[
            { t: "A · Heures vendues", v: fmtHeures(r.ecart.totalVendues) },
            { t: "B · Heures payées", v: fmtHeures(r.ecart.totalPayees) },
            { t: "A − B · Capacitaire (paie)", v: fmtHeures(r.bouclage.totalEcart) },
            { t: "Facturées par les sous-traitants", v: fmtHeures(r.bouclage.totalDocumentees) },
            { t: "Reste inexpliqué", v: fmtHeures(r.bouclage.totalReste), c: r.bouclage.totalReste > 0.5 ? C.critique : undefined },
            { t: "Facturé en trop", v: fmtHeures(r.bouclage.totalExcedent), c: r.bouclage.totalExcedent > 0.5 ? C.critique : undefined },
          ]}
        />
        {r.sousTraitants.length ? (
          <>
            <Text style={s.h3} minPresenceAhead={70}>Conclusions par sous-traitant</Text>
            <Tableau
              colonnes={[{ t: "Sous-traitant", w: "22%" }, { t: "Travail dissimulé", w: "19%" }, { t: "Prêt illicite", w: "19%" }, { t: "Marchandage", w: "19%" }, { t: "Vigilance", w: "21%" }]}
              lignes={r.sousTraitants.map((c) => [
                { t: c.dossier.st.raison_sociale, b: true },
                c.conclusions["st-td"] ?? "Non conclu",
                c.conclusions["st-pi"] ?? "Non conclu",
                c.conclusions["st-ma"] ?? "Non conclu",
                c.conclusions["st-vigilance"] ?? "Non conclu",
              ])}
            />
          </>
        ) : null}

        {/* 3. Rapprochement */}
        <View break>
          <Text style={s.etiquette}>3</Text>
          <Text style={s.h2}>Le rapprochement des heures</Text>
          <Text style={s.para}>
            Heures vendues aux clients (A), heures réalisées selon le planning ou le pointage, heures payées sur les bulletins (B) ; A − B est le capacitaire de sous-traitance, le maximum d’heures que l’entreprise a pu sous-traiter ; il doit être couvert par la sous-traitance facturée, sans la dépasser. Les mois ne se compensent pas entre eux.
          </Text>
          <Tableau
            colonnes={[{ t: "Mois", w: "14%" }, { t: "A · Vendues", w: "11%" }, { t: "Réalisées", w: "11%" }, { t: "B · Payées", w: "11%" }, { t: "Capacitaire paie", w: "13%" }, { t: "Capacitaire réel", w: "13%" }, { t: "Sous-traitants", w: "12%" }, { t: "Reste", w: "15%" }]}
            alignDroite={[1, 2, 3, 4, 5, 6, 7]}
            lignes={r.ecart.lignes.map((l, i) => {
              const b = r.bouclage.lignes[i];
              const reste = b.reste === null ? { t: "incomplet", c: C.gris } : b.reste < -0.5 ? { t: `${fmtHeures(-b.reste)} en trop`, c: C.critique } : { t: fmtHeures(b.reste), c: b.reste > 0.5 ? C.critique : C.encre };
              return [fmtMois(l.mois), fmtHeures(l.vendues), fmtHeures(l.realisees), fmtHeures(l.payees), fmtHeures(l.ecart), fmtHeures(l.ecartReel), fmtHeures(b.documentees), reste];
            })}
          />
          <Text style={s.h3} minPresenceAhead={70}>Ce qui ressort</Text>
          <Alertes alertes={[...r.alertesEntreprise.ventes, ...r.alertesEntreprise.paie, ...r.bouclage.alertes]} />
          <Text style={s.h3} minPresenceAhead={70}>Conclusion de l’auditrice</Text>
          {r.rapprochement.sources.length ? <Text style={s.para}>Sources contrôlées : {r.rapprochement.sources.join(", ")}.</Text> : null}
          <Choix titre="Volume facturé compatible avec les effectifs et les heures rémunérées" valeur={r.rapprochement.question} />
          <Choix titre="Éléments expliquant le volume non couvert" valeur={r.rapprochement.explications.length ? r.rapprochement.explications.join(", ") : null} />
          <Choix titre="Conclusion" valeur={r.rapprochement.conclusion} />
          {r.rapprochement.justificatifs ? <><Text style={s.h3} minPresenceAhead={70}>Justificatifs complémentaires demandés</Text><Paragraphes texte={r.rapprochement.justificatifs} /></> : null}
          {r.rapprochement.observations ? <><Text style={s.h3} minPresenceAhead={70}>Observations</Text><Paragraphes texte={r.rapprochement.observations} /></> : null}
        </View>

        {/* 4. Un chapitre par sous-traitant */}
        {r.sousTraitants.map((c, n) => {
          const x = c.dossier;
          return (
            <View key={x.st.id} break>
              <Text style={s.etiquette}>4.{n + 1} · Sous-traitant de rang {x.st.rang}</Text>
              <Text style={s.h2}>{x.st.raison_sociale}</Text>
              <Tableau
                colonnes={[{ t: "SIREN", w: "20%" }, { t: "Dirigeant", w: "25%" }, { t: "Contrat", w: "20%" }, { t: "Montant HT", w: "17%" }, { t: "Vigilance", w: "18%" }]}
                lignes={[[x.st.siren ?? "—", x.st.dirigeant ?? "—", x.st.contrat_ref ?? "—", x.st.montant_contrat_ht !== null ? fmtEuros(x.st.montant_contrat_ht) : "—", x.vigilanceObligatoire === null ? "—" : x.vigilanceObligatoire ? "Obligatoire" : "Sous le seuil"]]}
              />
              <Chiffres items={[{ t: "Heures facturées", v: fmtHeures(x.totalHeures) }, { t: "Facturé TTC", v: fmtEuros(x.totalTTC || x.totalHT) }, { t: "Payé", v: fmtEuros(x.totalPaye) }]} />

              {x.echeancier ? (
                <>
                  <Text style={s.h3} minPresenceAhead={70}>Échéancier de vigilance</Text>
                  <Text style={s.petit}>
                    Contrat conclu le {fmtDate(x.echeancier.debut)}{x.echeancier.fin ? `, jusqu’au ${fmtDate(x.echeancier.fin)}` : ", sans date de fin"} : une attestation de moins de 6 mois est due à chaque échéance.
                  </Text>
                  <Tableau
                    colonnes={[{ t: "Échéance", w: "30%" }, { t: "Situation", w: "35%" }, { t: "Attestation retenue", w: "35%" }]}
                    lignes={x.echeancier.echeances.map((e) => [
                      fmtDate(e.date),
                      { t: STATUT_ECHEANCE[e.statut].t, c: STATUT_ECHEANCE[e.statut].c, b: e.statut === "manquante" },
                      e.attestation?.date_delivrance ? `du ${fmtDate(e.attestation.date_delivrance)}` : "—",
                    ])}
                  />
                </>
              ) : null}

              {x.mois.length ? (
                <>
                  <Text style={s.h3} minPresenceAhead={70}>Faisabilité : l’effectif déclaré peut-il produire les heures facturées ?</Text>
                  <Tableau
                    colonnes={[{ t: "Mois", w: "16%" }, { t: "Facturées", w: "14%" }, { t: "Attestation", w: "18%" }, { t: "Effectif", w: "11%" }, { t: "Disponibles", w: "14%" }, { t: "Utilisée", w: "12%" }, { t: "Plafond SMIC", w: "15%" }]}
                    alignDroite={[1, 3, 4, 5, 6]}
                    lignes={x.mois.map((m) => [
                      fmtMois(m.mois),
                      fmtHeures(m.heuresFacturees),
                      m.attestation ? { t: `du ${fmtDate(m.attestation.date_delivrance)}` } : { t: "aucune valide", c: C.critique, b: true },
                      m.attestation?.effectif_etp != null ? `${fmtNombre(m.attestation.effectif_etp)} ETP` : "—",
                      fmtHeures(m.capacite),
                      { t: fmtPct(m.tauxCapacite), c: m.tauxCapacite !== null && m.tauxCapacite > 100 ? C.critique : C.encre },
                      fmtHeures(m.plafondSmic),
                    ])}
                  />
                </>
              ) : null}

              {x.flechage.length || x.paiementsSansFacture.length ? (
                <>
                  <Text style={s.h3} minPresenceAhead={70}>Fléchage des factures vers les paiements</Text>
                  <Tableau
                    colonnes={[{ t: "Facture", w: "24%" }, { t: "Attendu", w: "20%" }, { t: "Payé", w: "20%" }, { t: "Écart", w: "18%" }, { t: "Payée le", w: "18%" }]}
                    alignDroite={[1, 2, 3]}
                    lignes={[
                      ...x.flechage.map((f) => [
                        f.facture.numero ? `N° ${f.facture.numero}` : "Sans numéro",
                        `${fmtEuros(f.attendu)} ${f.baseAttendu === "ttc" ? "TTC" : "HT"}`,
                        fmtEuros(f.paye),
                        f.paiements.length === 0 ? { t: "non payée", c: C.majeur } : { t: fmtEuros(f.ecart), c: f.ecart !== null && Math.abs(f.ecart) >= 1 ? C.critique : C.encre },
                        f.paiements.map((p) => fmtDate(p.date_paiement)).join(", ") || "—",
                      ]),
                      ...x.paiementsSansFacture.map((p) => [{ t: "Sans facture", c: C.critique, b: true }, "—", fmtEuros(p.montant), "—", fmtDate(p.date_paiement)]),
                    ]}
                  />
                </>
              ) : null}

              <Text style={s.h3} minPresenceAhead={70}>Ce qui ressort des chiffres</Text>
              <Alertes alertes={x.alertes} />

              <Text style={s.h3} minPresenceAhead={70}>Points de contrôle défavorables ou à vérifier</Text>
              <Text style={s.petit}>{c.repondues} points renseignés sur {c.totalQuestions}.</Text>
              {c.points.length === 0 ? (
                <Text style={s.para}>Aucun point défavorable parmi ceux renseignés.</Text>
              ) : (
                c.points.map((p, i) => (
                  <View key={i} style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.filet, paddingVertical: 4 }} wrap={false}>
                    <Text style={{ width: 62, fontWeight: 500, color: p.reponse === "a_verifier" ? C.majeur : C.critique }}>{libelleReponse(p.reponse, p.alerte)}</Text>
                    <View style={{ flex: 1 }}>
                      <Text>{p.libelle} <Text style={{ color: C.gris }}>· {p.section}</Text></Text>
                      {p.observation ? <Text style={{ color: C.encre2, fontStyle: "normal" }}>{p.observation}</Text> : null}
                    </View>
                  </View>
                ))
              )}

              <Text style={s.h3} minPresenceAhead={70}>Conclusions</Text>
              {GRILLE_SOUS_TRAITANT.conclusions.filter((k) => k.type === "choix").map((k) => (
                <Choix key={k.code} titre={k.titre} valeur={c.conclusions[k.code]} />
              ))}
              {c.synthese ? <><Text style={s.h3} minPresenceAhead={70}>Synthèse de l’auditrice</Text><Paragraphes texte={c.synthese} /></> : null}
            </View>
          );
        })}

        {/* 5. URSSAF */}
        <Module
          n="5"
          titre="URSSAF · Travail dissimulé, prêt illicite, marchandage"
          intro="L’entreprise contrôlée pour elle-même : dissimulation d’emploi salarié, dissimulation d’activité, recours à des travailleurs présentés comme indépendants, prêt illicite de main-d’œuvre et marchandage. Les sous-traitants le sont chacun dans leur chapitre."
          m={r.urssaf}
          avant={r.sousTraitants.length ? (
            <Tableau
              colonnes={[{ t: "Sous-traitant", w: "24%" }, { t: "Travail dissimulé", w: "19%" }, { t: "Prêt illicite", w: "19%" }, { t: "Marchandage", w: "19%" }, { t: "Vigilance", w: "19%" }]}
              lignes={r.sousTraitants.map((c) => [
                { t: c.dossier.st.raison_sociale, b: true },
                c.conclusions["st-td"] ?? "Non conclu",
                c.conclusions["st-pi"] ?? "Non conclu",
                c.conclusions["st-ma"] ?? "Non conclu",
                c.conclusions["st-vigilance"] ?? "Non conclu",
              ])}
            />
          ) : null}
        />

        {/* 6. DGFiP */}
        <Module
          n="6"
          titre="DGFiP · Factures fictives et de complaisance"
          intro="Chaque facture, émise aux clients ou reçue d’un sous-traitant, doit reposer sur une commande, une prestation réellement réalisée et un paiement au bon destinataire. Les écarts de ventes, de TVA et de paiements relevés plus haut en font partie."
          m={r.dgfip}
        />

        {/* 7. CNAPS */}
        {r.dracar.renseigne || r.alertesCartes.length ? (
          <View break>
            <Text style={s.etiquette}>7</Text>
            <Text style={s.h2}>CNAPS · Dracar Ultimate</Text>
            <Chiffres
              items={[
                { t: "Points contrôlés", v: String(r.dracar.controles) },
                { t: "Conformes", v: String(r.dracar.conformes) },
                { t: "Non-conformités", v: String(r.dracar.nonConformes), c: r.dracar.nonConformes ? C.critique : undefined },
              ]}
            />
            {r.dracar.points.length ? (
              r.dracar.points.map((p, i) => (
                <View key={i} style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.filet, paddingVertical: 4 }} wrap={false}>
                  <Text style={{ width: 62, fontWeight: 500, color: p.reponse === "a_verifier" ? C.majeur : C.critique }}>{libelleReponse(p.reponse, p.alerte)}</Text>
                  <View style={{ flex: 1 }}>
                    <Text>{p.libelle} <Text style={{ color: C.gris }}>· {p.section}</Text></Text>
                    {p.observation ? <Text style={{ color: C.encre2 }}>{p.observation}</Text> : null}
                  </View>
                </View>
              ))
            ) : (
              <Text style={s.para}>Aucun point défavorable parmi ceux renseignés.</Text>
            )}
            {r.alertesCartes.length ? (
              <>
                <Text style={s.h3} minPresenceAhead={70}>Suivi des cartes professionnelles</Text>
                <Alertes alertes={r.alertesCartes} />
              </>
            ) : null}
            <Text style={s.h3} minPresenceAhead={70}>Synthèse</Text>
            <Choix titre="Niveau de conformité" valeur={r.dracar.niveau} />
            <Choix titre="Délai préconisé" valeur={r.dracar.delai} />
            {r.dracar.actions ? <><Text style={s.h3} minPresenceAhead={70}>Actions correctives recommandées</Text><Paragraphes texte={r.dracar.actions} /></> : null}
          </View>
        ) : null}

        {/* 8. Plan d'actions */}
        <View break>
          <Text style={s.etiquette}>8</Text>
          <Text style={s.h2}>Plan d’actions correctives</Text>
          <Text style={s.para}>Chaque anomalie : constat, risque, action corrective, justificatif à produire, responsable, échéance, contrôle de régularisation.</Text>
          {r.nonConformites.length === 0 ? (
            <Text style={s.para}>Aucune action formalisée.</Text>
          ) : (
            r.nonConformites.map((n, i) => (
              <View key={n.id} style={{ borderTopWidth: i === 0 ? 1.2 : 0.5, borderTopColor: i === 0 ? C.encre : C.filet, paddingVertical: 8 }} wrap={false}>
                <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
                  <Text style={{ fontWeight: 600 }}>Action {i + 1} · {n.libelleNature}{n.sousTraitant ? ` · ${n.sousTraitant}` : ""}</Text>
                  <Text style={{ fontWeight: 500, color: n.statut === "regularise" ? C.mineur : n.statut === "en_cours" ? C.majeur : C.critique }}>
                    {n.statut === "regularise" ? `Régularisé${n.date_regularisation ? ` le ${fmtDate(n.date_regularisation)}` : ""}` : n.statut === "en_cours" ? "En cours" : "À faire"}
                  </Text>
                </View>
                {[
                  ["Constat", n.constat],
                  ["Élément vérifié", n.element_verifie],
                  ["Risque", n.risque],
                  ["Action corrective", n.action],
                  ["Justificatif à produire", n.justificatif],
                  ["Responsable", n.responsable],
                  ["Échéance", n.echeance ? fmtDate(n.echeance) : null],
                  ["Preuve de régularisation", n.preuve_regularisation],
                ]
                  .filter(([, v]) => v)
                  .map(([t, v]) => (
                    <View key={t} style={{ flexDirection: "row", marginTop: 3 }}>
                      <Text style={{ width: "28%", color: C.gris }}>{t}</Text>
                      <Text style={{ width: "72%", color: C.encre2 }}>{v}</Text>
                    </View>
                  ))}
              </View>
            ))
          )}
        </View>

        {/* 9. Conclusion et limites */}
        <View break>
          <Text style={s.etiquette}>9</Text>
          <Text style={s.h2}>{TITRES_TEXTES.conclusion}</Text>
          <Paragraphes texte={r.textes.conclusion.texte} />
          <Text style={s.h3} minPresenceAhead={70}>{TITRES_TEXTES.limites}</Text>
          <Paragraphes texte={r.textes.limites.texte} />
          {r.documents.length ? (
            <>
              <Text style={s.h3} minPresenceAhead={70}>Documents examinés</Text>
              <Text style={s.para}>{r.documents.join(" · ")}</Text>
            </>
          ) : null}
          <Text style={s.h3} minPresenceAhead={70}>Méthode de calcul</Text>
          <Text style={s.para}>
            Capacitaire de sous-traitance (A − B) : heures facturées aux clients moins heures payées aux salariés sur les bulletins, mois par mois ; le capacitaire réel retranche les heures réalisées par les salariés (planning, pointage) au lieu des heures payées. Heures disponibles d’un sous-traitant : salariés en équivalent temps plein sur l’attestation de vigilance × 151,67 h, durée mensuelle d’un temps plein ; c’est le volume d’heures réelles dont il disposait pour répondre aux commandes. Plafond SMIC : rémunérations déclarées ÷ SMIC horaire brut en vigueur. Une attestation est retenue six mois à compter de sa délivrance ; elle est due à la conclusion du contrat de sous-traitance, puis tous les six mois jusqu’à sa fin. Prix de l’heure : montant hors taxe ÷ heures facturées, comparé au coût de revient horaire de référence{r.coutRevient ? ` retenu : ${r.coutRevient}` : ", lorsqu’il est renseigné"}.
          </Text>
          <View style={{ marginTop: 28, borderTopWidth: 0.5, borderTopColor: C.filet, paddingTop: 10 }} wrap={false}>
            <Text style={{ fontFamily: "Instrument Serif", fontSize: 14 }}>{r.mission.auditeur}</Text>
            <Text style={s.petit}>ANM Consulting · Audit et conseil, sécurité privée · le {dateEmission}</Text>
          </View>
        </View>
        </View>
      </Page>
    </Document>
  );
};
