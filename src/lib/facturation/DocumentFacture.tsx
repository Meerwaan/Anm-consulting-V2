import { Document, Page, Text, View } from "@react-pdf/renderer";
import { fmtDate, fmtEuros } from "@/lib/sous-traitance/format";
import { LIBELLE_NATURE, type Facture, type PartieFacture } from "./donnees";
import { C, Filigrane, Pied, s, typo } from "./pdf-commun";

/**
 * Une facture ou un avoir, produit depuis la ligne figée en base : le même PDF à chaque fois.
 * Mentions obligatoires (art. 242 nonies A de l'annexe II du CGI, art. L441-9 et L441-10 du Code
 * de commerce) : numéro, dates, parties avec SIREN, désignation, prix HT, taux et montant de TVA,
 * échéance, escompte, pénalités de retard et indemnité forfaitaire de 40 €, nature de l'opération.
 */

interface Props {
  facture: Facture;
  origine?: { numero: string; emise_le: string } | null;
  iban?: string | null;
  bic?: string | null;
  delaiJours: number;
}

const Partie = ({ titre, p }: { titre: string; p: PartieFacture }) => (
  <View style={{ flex: 1 }}>
    <Text style={[s.etiquette, { marginBottom: 4 }]}>{titre}</Text>
    <Text style={s.fort}>{typo(p.nom)}</Text>
    {p.mentions?.split(" · ").map((m) => <Text key={m} style={{ color: C.encre2 }}>{typo(m)}</Text>)}
    {p.lignes.map((l) => (
      <Text key={l}>{typo(l)}</Text>
    ))}
    {p.siren && !p.mentions ? <Text>{typo(`SIREN : ${p.siren.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}`)}</Text> : null}
    {p.tva ? <Text>{typo(`TVA intracommunautaire : ${p.tva}`)}</Text> : null}
  </View>
);

const col = { designation: { flex: 1 }, qte: { width: 40, textAlign: "right" as const }, pu: { width: 96, textAlign: "right" as const }, total: { width: 78, textAlign: "right" as const } };

export const DocumentFacture = ({ facture: f, origine, iban, bic, delaiJours }: Props) => {
  const avoir = f.nature === "avoir";
  const titre = `${LIBELLE_NATURE[f.nature]} n° ${f.numero}`;
  const franchise = f.taux_tva === 0;

  return (
    <Document title={titre} author={f.vendeur.nom} language="fr">
      <Page size="A4" style={s.page}>
        <Filigrane actif={f.numero.startsWith("EXEMPLE")} />
        <Pied gauche={`${f.vendeur.nom} · ${titre}`} />
        <View style={s.corps}>
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 22 }}>
            <View>
              <Text style={{ fontFamily: "Instrument Serif", fontSize: 20, lineHeight: 1.2 }}>{typo(f.vendeur.nom)}</Text>
              <Text style={[s.etiquette, { marginTop: 4 }]}>Audit & préparation aux contrôles</Text>
            </View>
            <View style={{ alignItems: "flex-end" }}>
              <Text style={[s.h1, { fontSize: 24, lineHeight: 1.2 }]}>{typo(LIBELLE_NATURE[f.nature])}</Text>
              <Text style={{ fontFamily: "Plex Mono", fontSize: 9, marginTop: 2 }}>{typo(`N° ${f.numero}`)}</Text>
            </View>
          </View>

          <View style={{ flexDirection: "row", gap: 24, marginBottom: 16 }}>
            <Partie titre="Émetteur" p={f.vendeur} />
            <Partie titre={avoir ? "Client" : "Facturé à"} p={f.client} />
          </View>

          <View style={{ flexDirection: "row", gap: 24, borderTopWidth: 0.5, borderBottomWidth: 0.5, borderColor: C.filet, paddingVertical: 8, marginBottom: 14 }}>
            <View style={{ flex: 1 }}>
              <Text style={s.etiquette}>Date d’émission</Text>
              <Text>{fmtDate(f.emise_le)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.etiquette}>{avoir ? "Facture annulée" : "Échéance"}</Text>
              <Text>{avoir ? (origine ? typo(`n° ${origine.numero} du ${fmtDate(origine.emise_le)}`) : "—") : f.nature === "acompte" ? `À réception, le ${fmtDate(f.echeance_le)}` : fmtDate(f.echeance_le)}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.etiquette}>Opération</Text>
              <Text>Prestation de services</Text>
            </View>
          </View>

          {/* Lignes */}
          <View style={{ flexDirection: "row", borderBottomWidth: 1, borderBottomColor: C.encre, paddingBottom: 4 }}>
            <Text style={[s.etiquette, col.designation]}>Désignation</Text>
            <Text style={[s.etiquette, col.qte]}>Qté</Text>
            <Text style={[s.etiquette, col.pu]}>Prix unit. HT</Text>
            <Text style={[s.etiquette, col.total]}>Total HT</Text>
          </View>
          {f.lignes.map((l, i) => (
            <View key={i} style={{ flexDirection: "row", borderBottomWidth: 0.5, borderBottomColor: C.filet, paddingVertical: 6 }} wrap={false}>
              <View style={col.designation}>
                <Text style={s.fort}>{typo(l.designation)}</Text>
                {l.detail ? <Text style={{ color: C.encre2 }}>{typo(l.detail)}</Text> : null}
              </View>
              <Text style={col.qte}>{l.quantite}</Text>
              <Text style={col.pu}>{fmtEuros(l.prix_unitaire_ht)}</Text>
              <Text style={col.total}>{fmtEuros(l.quantite * l.prix_unitaire_ht)}</Text>
            </View>
          ))}

          {/* Totaux */}
          <View style={{ alignSelf: "flex-end", width: 230, marginTop: 10 }} wrap={false}>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
              <Text>Total HT</Text>
              <Text>{fmtEuros(f.total_ht)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", paddingVertical: 2 }}>
              <Text>{franchise ? "TVA" : typo(`TVA ${f.taux_tva.toLocaleString("fr-FR")} %`)}</Text>
              <Text>{franchise ? "—" : fmtEuros(f.total_tva)}</Text>
            </View>
            <View style={{ flexDirection: "row", justifyContent: "space-between", borderTopWidth: 1, borderTopColor: C.encre, marginTop: 4, paddingTop: 5 }}>
              <Text style={s.fort}>{avoir ? "Montant de l’avoir TTC" : "Net à payer TTC"}</Text>
              <Text style={s.fort}>{fmtEuros(f.net_a_payer)}</Text>
            </View>
          </View>

          {/* Mentions */}
          <View style={{ marginTop: 26, color: C.encre2, fontSize: 8.5, lineHeight: 1.45 }} wrap={false}>
            {franchise ? <Text style={s.p}>{typo("TVA non applicable, art. 293 B du CGI.")}</Text> : null}
            {avoir ? (
              <Text style={s.p}>{typo(`Avoir annulant la facture n° ${origine?.numero ?? ""}. Il sera déduit de toute somme restant due ou remboursé sur demande.`)}</Text>
            ) : (
              <>
                <Text style={s.p}>
                  {typo(
                    f.nature === "acompte"
                      ? `Acompte payable à réception, conformément au contrat du ${f.contrat_du ? fmtDate(f.contrat_du) : "—"}. Le solde sera facturé à la remise des livrables.`
                      : `Paiement à ${delaiJours} jours à compter de la date d’émission, soit au plus tard le ${fmtDate(f.echeance_le)}.`,
                  )}
                </Text>
                {iban ? <Text style={s.p}>{typo(`Règlement par virement : IBAN ${iban}${bic ? ` · BIC ${bic}` : ""}. Merci de rappeler le numéro de facture.`)}</Text> : null}
                <Text style={s.p}>Pas d’escompte pour paiement anticipé.</Text>
                <Text style={s.p}>
                  {typo(
                    "En cas de retard de paiement, des pénalités sont exigibles au taux d’intérêt appliqué par la Banque centrale européenne à son opération de refinancement la plus récente, majoré de 10 points (art. L441-10 du Code de commerce), ainsi qu’une indemnité forfaitaire pour frais de recouvrement de 40 € (art. D441-5 du Code de commerce).",
                  )}
                </Text>
              </>
            )}
          </View>
        </View>
      </Page>
    </Document>
  );
};
