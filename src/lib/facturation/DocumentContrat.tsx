import { Document, Page, Text, View } from "@react-pdf/renderer";
import { ARTICLES_CONTRAT, ARTICLE_PRESTATION, CHAINE_METHODE, type Bloc } from "@/content/contrat";
import { fmtDate, fmtEuros } from "@/lib/sous-traitance/format";
import { tvaIntracom } from "./annuaire";
import type { Cabinet, ClientFiche, Contrat, MissionFacturation } from "./donnees";
import { C, EnTete, Pied, Puces, Valeur, s, typo } from "./pdf-commun";

/**
 * Le contrat de prestation de services : le texte de Sofia (content/contrat.ts), les crochets
 * remplis par l'outil, et une annexe de conditions particulières qui reprend ce que la mission
 * a de propre (prestation, livrables, calendrier, prix, échéancier).
 */

interface Props {
  cabinet: Cabinet;
  client: ClientFiche;
  mission: MissionFacturation;
  contrat: Omit<Contrat, "id" | "mission_id" | "archive_path">;
}

const euros = (n: number) => fmtEuros(n);
const sansCentimes = (n: number) => fmtEuros(n).replace(",00", "");

export const montantsContrat = (contrat: Props["contrat"], cabinet: Cabinet) => {
  const ht = (contrat.montant_ht ?? 0) + contrat.frais_ht;
  const taux = cabinet.franchise_tva ? 0 : 20;
  const tva = Math.round(ht * taux) / 100;
  return { ht, taux, tva, ttc: Math.round((ht + tva) * 100) / 100 };
};

const echeancier = (pct: number) =>
  pct <= 0 ? "100 % à la remise des livrables." : pct >= 100 ? "100 % à la commande." : `${pct} % à la commande et ${100 - pct} % à la remise des livrables.`;

const Ligne = ({ libelle, children }: { libelle: string; children: React.ReactNode }) => (
  <Text style={{ marginBottom: 1.5 }}>
    {typo(libelle)} {children}
  </Text>
);

export const DocumentContrat = ({ cabinet, client, mission, contrat }: Props) => {
  const m = montantsContrat(contrat, cabinet);
  const titreDoc = `Contrat de prestation de services · Mission ${mission.reference}`;
  const siegeCabinet = [cabinet.adresse, [cabinet.code_postal, cabinet.ville].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const siegeClient = [client.adresse, [client.code_postal, client.ville].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const articles = [ARTICLE_PRESTATION[contrat.prestation], mission.control_in_progress ? "2.4" : null].filter(Boolean).join(" et ");

  const bloc = (b: Bloc, i: number) => {
    if (typeof b !== "string") return <Puces key={i} items={b.liste} />;
    if (b.startsWith("{SOUS:")) return <Text key={i} style={s.h3}>{typo(b.slice(6, -1))}</Text>;
    if (b.startsWith("{NUMEROTEE:")) return <Puces key={i} items={b.slice(11, -1).split("|")} numerotee />;
    if (b === "{CHAINE}") return <Text key={i} style={[s.p, s.fort, { letterSpacing: 0.4 }]}>{CHAINE_METHODE.join(" → ")}</Text>;
    if (b === "{MONTANTS}")
      return (
        <View key={i} style={[s.p, { paddingLeft: 8 }]}>
          <Ligne libelle="Montant HT :">{euros(m.ht)}</Ligne>
          <Ligne libelle={cabinet.franchise_tva ? "TVA :" : `TVA (${m.taux} %) :`}>{cabinet.franchise_tva ? typo("non applicable, art. 293 B du CGI") : euros(m.tva)}</Ligne>
          <Ligne libelle="Montant TTC :">{euros(m.ttc)}</Ligne>
        </View>
      );
    if (b === "{ECHEANCIER}") return <Text key={i} style={[s.p, { paddingLeft: 8 }]}>{typo(echeancier(contrat.acompte_pct))}</Text>;
    return <Text key={i} style={s.p}>{typo(b)}</Text>;
  };

  return (
    <Document title={titreDoc} author={cabinet.raison_sociale} language="fr">
      <Page size="A4" style={s.page}>
        <EnTete gauche={cabinet.raison_sociale} droite={titreDoc} />
        <Pied gauche={`${cabinet.raison_sociale} · ${client.name}`} />
        <View style={s.corps}>
          <Text style={s.etiquette}>Mission {mission.reference}</Text>
          <Text style={[s.h1, { marginTop: 6, marginBottom: 18 }]}>Contrat de prestation de services</Text>

          <Text style={[s.p, s.fort]}>Entre les soussignés</Text>
          <View style={{ marginBottom: 10 }}>
            <Text style={s.fort}>{typo(cabinet.raison_sociale)}</Text>
            <Text>{typo(`${cabinet.forme_juridique}${cabinet.capital ? ` au capital de ${sansCentimes(cabinet.capital)}` : ""}`)}</Text>
            <Ligne libelle="SIREN :"><Valeur v={cabinet.siren ? `${cabinet.siren}${cabinet.rcs_ville ? `, RCS ${cabinet.rcs_ville}` : ""}` : null} /></Ligne>
            <Ligne libelle="Siège social :"><Valeur v={siegeCabinet || null} /></Ligne>
            <Text>{typo(`Représentée par Mme ${cabinet.representant ?? "Sofia Aoun"}, en qualité de ${cabinet.fonction ?? "Gérante"}`)}</Text>
            <Text>{typo("Ci-après dénommée « ANM Consulting » ou « le Prestataire »,")}</Text>
          </View>
          <Text style={[s.p, s.fort]}>ET</Text>
          <View style={{ marginBottom: 10 }}>
            <Text style={s.fort}>{typo(client.name)}</Text>
            <Valeur v={client.forme_juridique} />
            <Ligne libelle="SIREN :"><Valeur v={client.siren} /></Ligne>
            <Ligne libelle="Siège social :"><Valeur v={siegeClient || null} /></Ligne>
            <Text>
              {typo("Représentée par ")}
              <Valeur v={client.representant} />
              {typo(", en qualité de ")}
              <Valeur v={client.representant_fonction} />
            </Text>
            <Text>{typo("Ci-après dénommée « le Client »,")}</Text>
          </View>
          <Text style={s.p}>Il a été convenu ce qui suit.</Text>

          {ARTICLES_CONTRAT.map((a) => (
            <View key={a.n}>
              <Text style={s.h2} minPresenceAhead={60}>{typo(`Article ${a.n} — ${a.titre}`)}</Text>
              {a.blocs.map(bloc)}
            </View>
          ))}

          <View wrap={false} style={{ marginTop: 18 }}>
            <Text style={s.h2}>Signatures</Text>
            <Ligne libelle="Fait à :"><Valeur v={contrat.lieu_signature} /></Ligne>
            <Ligne libelle="Le :">{fmtDate(contrat.date_contrat)}</Ligne>
            <Text style={{ marginTop: 4, marginBottom: 12, color: C.gris }}>En deux exemplaires originaux.</Text>
            <View style={{ flexDirection: "row", gap: 24 }}>
              <View style={{ flex: 1, borderTopWidth: 0.5, borderTopColor: C.filet, paddingTop: 8, minHeight: 130 }}>
                <Text style={s.fort}>{typo(cabinet.raison_sociale)}</Text>
                <Ligne libelle="Nom :">{typo(cabinet.representant ?? "Sofia Aoun")}</Ligne>
                <Ligne libelle="Fonction :">{typo(cabinet.fonction ?? "Gérante")}</Ligne>
                <Text style={{ marginTop: 6 }}>{typo("Signature :")}</Text>
              </View>
              <View style={{ flex: 1, borderTopWidth: 0.5, borderTopColor: C.filet, paddingTop: 8, minHeight: 130 }}>
                <Text style={s.fort}>Le Client</Text>
                <Ligne libelle="Société :">{typo(client.name)}</Ligne>
                <Ligne libelle="Nom :"><Valeur v={client.representant} /></Ligne>
                <Ligne libelle="Fonction :"><Valeur v={client.representant_fonction} /></Ligne>
                <Text style={{ marginTop: 6 }}>{typo("Signature précédée de la mention « Bon pour accord » :")}</Text>
              </View>
            </View>
          </View>
        </View>
      </Page>

      <Page size="A4" style={s.page}>
        <EnTete gauche={cabinet.raison_sociale} droite={titreDoc} />
        <Pied gauche={`${cabinet.raison_sociale} · ${client.name}`} />
        <View style={s.corps}>
          <Text style={s.etiquette}>Annexe au contrat du {fmtDate(contrat.date_contrat)}</Text>
          <Text style={[s.h1, { fontSize: 22, marginTop: 6, marginBottom: 6 }]}>Conditions particulières de la mission</Text>
          <Text style={[s.p, { color: C.encre2 }]}>
            {typo("La présente annexe précise la prestation souscrite au sens des articles 1, 2, 4, 12, 13 et 15 du contrat. Elle tient lieu de proposition commerciale acceptée (article 23).")}
          </Text>
          <View style={s.filet} />

          <Text style={s.h3}>Prestation souscrite</Text>
          <Text style={s.p}>{typo(`${contrat.intitule}${articles ? ` (${articles.includes(" et ") ? "articles" : "article"} ${articles} du contrat).` : "."}`)}</Text>
          {contrat.description ? <Text style={s.p}>{typo(contrat.description)}</Text> : null}
          <Ligne libelle="Référence de mission :">{mission.reference}</Ligne>
          {client.headcount ? <Ligne libelle="Effectif déclaré :">{`${client.headcount} salariés`}</Ligne> : null}

          <Text style={s.h3}>Livrables</Text>
          {contrat.livrables.length ? <Puces items={contrat.livrables.map((l, i) => `${l}${i === contrat.livrables.length - 1 ? "." : " ;"}`)} /> : <Valeur v={null} />}

          <Text style={s.h3}>Calendrier</Text>
          <Text style={s.p}>{typo(contrat.calendrier ?? "Calendrier arrêté avec le Client lors du cadrage de la mission.")}</Text>

          <Text style={s.h3}>Prix</Text>
          <View style={{ marginBottom: 5 }}>
            {contrat.montant_ht === null ? <Valeur v={null} /> : <Ligne libelle="Prestation :">{`${euros(contrat.montant_ht)} HT`}</Ligne>}
            {contrat.frais_ht > 0 ? <Ligne libelle="Frais de déplacement :">{`${euros(contrat.frais_ht)} HT`}</Ligne> : null}
            <Ligne libelle="Total :">{`${euros(m.ht)} HT${cabinet.franchise_tva ? "" : `, soit ${euros(m.ttc)} TTC (TVA ${m.taux} %)`}`}</Ligne>
            {cabinet.franchise_tva ? <Text>{typo("TVA non applicable, art. 293 B du CGI.")}</Text> : null}
          </View>

          <Text style={s.h3}>Échéancier</Text>
          <Text style={s.p}>
            {typo(
              contrat.acompte_pct > 0 && contrat.acompte_pct < 100
                ? `Acompte de ${contrat.acompte_pct} % à la commande, soit ${euros(Math.round(m.ttc * contrat.acompte_pct) / 100)} TTC ; solde de ${100 - contrat.acompte_pct} % à la remise des livrables. Factures payables à ${cabinet.delai_paiement_jours} jours, l’acompte à réception.`
                : `${echeancier(contrat.acompte_pct)} Factures payables à ${cabinet.delai_paiement_jours} jours.`,
            )}
          </Text>
          {cabinet.iban ? <Ligne libelle="Règlement par virement :">{`IBAN ${cabinet.iban}${cabinet.bic ? ` · BIC ${cabinet.bic}` : ""}`}</Ligne> : null}
          {!cabinet.franchise_tva && tvaIntracom(cabinet.siren) ? <Ligne libelle="TVA intracommunautaire d’ANM Consulting :">{tvaIntracom(cabinet.siren)}</Ligne> : null}

          <View wrap={false} style={{ marginTop: 24, flexDirection: "row", gap: 24 }}>
            <View style={{ flex: 1, borderTopWidth: 0.5, borderTopColor: C.filet, paddingTop: 8, minHeight: 60 }}>
              <Text style={{ color: C.gris }}>Paraphe d’ANM Consulting</Text>
            </View>
            <View style={{ flex: 1, borderTopWidth: 0.5, borderTopColor: C.filet, paddingTop: 8, minHeight: 60 }}>
              <Text style={{ color: C.gris }}>Paraphe du Client</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
