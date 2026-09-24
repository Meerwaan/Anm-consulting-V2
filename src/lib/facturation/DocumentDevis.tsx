import { Document, Page, Text, View } from "@react-pdf/renderer";
import { fmtDate, fmtEuros } from "@/lib/sous-traitance/format";
import type { PartieFacture } from "./donnees";
import type { Devis } from "./devis";
import { C, Filigrane, Pied, Puces, s, typo } from "./pdf-commun";

/**
 * Le devis (proposition commerciale) : le chiffrage ligne par ligne selon la grille, les
 * conditions reprises ensuite au contrat, et la case « Bon pour accord » du client.
 */

interface Props {
  devis: Devis;
  vendeur: PartieFacture;
  client: PartieFacture & { representant?: string | null; fonction?: string | null };
}

const col = { designation: { flex: 1 }, qte: { width: 40, textAlign: "right" as const }, pu: { width: 96, textAlign: "right" as const }, total: { width: 78, textAlign: "right" as const } };

const Partie = ({ titre, p }: { titre: string; p: PartieFacture }) => (
  <View style={{ flex: 1, lineHeight: 1.5 }}>
    <Text style={[s.etiquette, { marginBottom: 4 }]}>{titre}</Text>
    <Text style={s.fort}>{typo(p.nom)}</Text>
    {p.mentions?.split(" · ").map((m) => <Text key={m} style={{ color: C.encre2 }}>{typo(m)}</Text>)}
    {p.lignes.map((l) => <Text key={l}>{typo(l)}</Text>)}
    {p.siren && !p.mentions ? <Text>{typo(`SIREN : ${p.siren.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}`)}</Text> : null}
    {p.tva ? <Text>{typo(`TVA intracommunautaire : ${p.tva}`)}</Text> : null}
  </View>
);

export const DocumentDevis = ({ devis: d, vendeur, client }: Props) => {
  const titre = `Devis n° ${d.numero}`;
  const franchise = d.taux_tva === 0;
  const suivi = d.prestation === "suivi_conformite";
  const acompteTTC = Math.round(d.total_ttc * d.acompte_pct) / 100;

  return (
    <Document title={titre} author={vendeur.nom} language="fr">
      <Page size="A4" style={s.page}>
        <Filigrane actif={d.numero.startsWith("EXEMPLE")} />
        <Pied gauche={`${vendeur.nom} · ${titre}`} />
        <View style={s.corps}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
            <View>
              <Text style={{ fontFamily: "Instrument Serif", fontSize: 20, lineHeight: 1.2 }}>{typo(vendeur.nom)}</Text>
              <Text style={[s.etiquette, { marginTop: 4 }]}>Audit & préparation aux contrôles</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[s.h1, { fontSize: 24, lineHeight: 1.2 }]}>Devis</Text>
              <Text style={{ fontFamily: "Plex Mono", fontSize: 9, marginTop: 2 }}>{typo(`N° ${d.numero}`)}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 24, marginBottom: 16 }}>
            <Partie titre="Émetteur" p={vendeur} />
            <View style={{ flex: 1 }}>
              <Partie titre="Client" p={client} />
              {client.representant ? <Text style={{ marginTop: 2, lineHeight: 1.5 }}>{typo(`À l’attention de ${client.representant}${client.fonction ? `, ${client.fonction}` : ""}`)}</Text> : null}
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 24, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: C.filet, paddingVertical: 8, marginBottom: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.etiquette}>Date</Text>
              <Text>{fmtDate(d.cree_le)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.etiquette}>Valable jusqu’au</Text>
              <Text>{fmtDate(d.valable_jusquau)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.etiquette}>Opération</Text>
              <Text>Prestation de services</Text>
            </View>
          </View>

          <Text style={[s.h3, { marginTop: 0 }]}>{typo(d.intitule)}</Text>
          {d.description ? <Text style={[s.p, { color: C.encre2 }]}>{typo(d.description)}</Text> : null}

          <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.encre, paddingBottom: 4, marginTop: 6 }}>
            <Text style={[s.etiquette, col.designation]}>Désignation</Text>
            <Text style={[s.etiquette, col.qte]}>Qté</Text>
            <Text style={[s.etiquette, col.pu]}>Prix unit. HT</Text>
            <Text style={[s.etiquette, col.total]}>Total HT</Text>
          </View>
          {d.lignes.map((l, i) => (
            <View key={i} style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.filet, paddingVertical: 6 }} wrap={false}>
              <View style={col.designation}>
                <Text style={i === 0 ? s.fort : undefined}>{typo(l.designation)}</Text>
                {l.detail ? <Text style={{ color: C.encre2 }}>{typo(l.detail)}</Text> : null}
              </View>
              <Text style={col.qte}>{l.quantite.toLocaleString("fr-FR")}</Text>
              <Text style={col.pu}>{fmtEuros(l.prix_unitaire_ht)}</Text>
              <Text style={col.total}>{fmtEuros(l.quantite * l.prix_unitaire_ht)}</Text>
            </View>
          ))}

          <View style={{ alignSelf: "flex-end", width: 230, marginTop: 10 }} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
              <Text>{suivi ? "Total HT par mois" : "Total HT"}</Text>
              <Text>{fmtEuros(d.total_ht)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
              <Text>{franchise ? "TVA" : typo(`TVA ${d.taux_tva.toLocaleString("fr-FR")} %`)}</Text>
              <Text>{franchise ? "—" : fmtEuros(d.total_ttc - d.total_ht)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.encre, marginTop: 4, paddingTop: 5 }}>
              <Text style={s.fort}>{suivi ? "Total TTC par mois" : "Total TTC"}</Text>
              <Text style={s.fort}>{fmtEuros(d.total_ttc)}</Text>
            </View>
          </View>

          <View style={{ marginTop: 18 }}>
            <Text style={s.h3} minPresenceAhead={40}>Conditions</Text>
            <Text style={s.p}>
              {typo(
                suivi
                  ? "Facturation mensuelle, à terme à échoir."
                  : d.acompte_pct > 0 && d.acompte_pct < 100
                    ? `Acompte de ${d.acompte_pct} % à la commande, soit ${fmtEuros(acompteTTC)} TTC ; solde à la remise des livrables.`
                    : d.acompte_pct >= 100
                      ? "Totalité à la commande."
                      : "Totalité à la remise des livrables.",
              )}
            </Text>
            {d.calendrier ? <Text style={s.p}>{typo(`Calendrier : ${d.calendrier}`)}</Text> : null}
            {d.livrables.length ? (
              <>
                <Text style={s.p}>Livrables :</Text>
                <Puces items={d.livrables.map((l, i) => `${l}${i === d.livrables.length - 1 ? "." : " ;"}`)} />
              </>
            ) : null}
            {franchise ? <Text style={s.p}>{typo("TVA non applicable, art. 293 B du CGI.")}</Text> : null}
            <Text style={[s.p, { color: C.encre2 }]}>
              {typo(
                "Le présent devis est complété par le contrat de prestation de services d’ANM Consulting, qui en reprend les conditions et précise le périmètre, les limites et les responsabilités de la mission. Aucune garantie de résultat n’est donnée sur l’issue d’un contrôle.",
              )}
            </Text>
          </View>

          <View wrap={false} style={{ marginTop: 18, flexDirection: "row", gap: 24 }}>
            <View style={{ flex: 1 }} />
            <View style={{ flex: 1, borderWidth: 0.5, borderColor: C.filet, padding: 10, minHeight: 110 }}>
              <Text style={s.fort}>Bon pour accord</Text>
              <Text style={{ color: C.encre2, marginTop: 2 }}>{typo("Date, nom, signature et cachet du Client :")}</Text>
            </View>
          </View>
        </View>
      </Page>
    </Document>
  );
};
