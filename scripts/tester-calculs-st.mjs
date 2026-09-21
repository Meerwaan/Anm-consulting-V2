// Tests du moteur sous-traitance : node --experimental-strip-types --test scripts/tester-calculs-st.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { calculerEcart, analyserSousTraitant, boucler, attestationDuMois, heuresDeVente } from "../src/lib/sous-traitance/calculs.ts";

const P = { periode_debut: null, periode_fin: null, taux_horaire_vendu: 25, heures_mensuelles_etp: 151.67 };
const vente = (mois, heures, montant = null) => ({ id: mois + heures, mois, client: "Client", bon_commande: null, heures_commandees: null, heures_facturees: heures, montant_ht: montant, note: null });
const st = { id: "st1", raison_sociale: "Gardiennage Sud", siren: null, adresse: null, dirigeant: null, activite: null, debut_relation: null, contrat_ref: null, montant_contrat_ht: 120000, rang: 1, donneur_id: null, note: null };

test("l'exemple de Sofia : 20 000 h vendues, 8 000 h payées → 12 000 h à expliquer", () => {
  const e = calculerEcart([vente("2026-03-01", 20000)], [{ mois: "2026-03-01", effectif: 50, heures_payees: 8000, note: null }], P);
  assert.equal(e.totalEcart, 12000);
  assert.equal(e.totalEcartPct, 60);
});

test("une facture client sans heures est convertie par le taux horaire vendu", () => {
  assert.deepEqual(heuresDeVente(vente("2026-03-01", null, 2500), 25), { heures: 100, converties: true });
  assert.deepEqual(heuresDeVente(vente("2026-03-01", null, 2500), null), { heures: null, converties: false });
});

test("un mois sans paie n'entre pas dans le total de l'écart", () => {
  const e = calculerEcart([vente("2026-03-01", 1000), vente("2026-04-01", 1000)], [{ mois: "2026-03-01", effectif: 5, heures_payees: 600, note: null }], P);
  assert.equal(e.totalEcart, 400);
  assert.deepEqual(e.moisIncomplets, ["2026-04"]);
});

test("attestation : valide 6 mois après sa délivrance", () => {
  const a = { id: "a", sous_traitant_id: "st1", date_delivrance: "2026-01-15", mois_reference: null, effectif_etp: 4, remunerations: null, siren_conforme: "oui", authentifiee: "oui", note: null };
  assert.equal(attestationDuMois([a], "2026-07")?.id, "a");
  assert.equal(attestationDuMois([a], "2026-08"), null);
  assert.equal(attestationDuMois([a], "2025-12"), null);
});

test("faisabilité : 4 ETP ne produisent pas 1 000 h dans le mois", () => {
  const a = { id: "a", sous_traitant_id: "st1", date_delivrance: "2026-02-10", mois_reference: "2026-01-01", effectif_etp: 4, remunerations: 7000, siren_conforme: "oui", authentifiee: "oui", note: null };
  const f = { id: "f1", sous_traitant_id: "st1", numero: "F-12", date_facture: "2026-03-31", mois: "2026-03-01", heures: 1000, montant_ht: 22000, montant_ttc: 26400, note: null };
  const p = { id: "p1", sous_traitant_id: "st1", facture_id: "f1", date_paiement: "2026-04-15", montant: 26400, reference: null, compte_au_nom: "oui", note: null };
  const d = analyserSousTraitant(st, [a], [f], [p], P, [{ valable_du: "2026-01-01", taux_brut: 12 }]);
  assert.equal(d.mois[0].capacite, 606.68);
  assert.equal(d.mois[0].plafondSmic, 583.33);
  const codes = d.alertes.map((x) => x.code);
  assert.ok(codes.includes("capacite_depassee"));
  assert.ok(codes.includes("plafond_smic_depasse"));
  assert.ok(!codes.includes("facture_non_payee"));
});

test("fléchage DGFiP : paiement sans facture, compte tiers, paiement supérieur", () => {
  const f = { id: "f1", sous_traitant_id: "st1", numero: "F-1", date_facture: null, mois: "2026-03-01", heures: 100, montant_ht: 2000, montant_ttc: 2400, note: null };
  const ps = [
    { id: "p1", sous_traitant_id: "st1", facture_id: "f1", date_paiement: null, montant: 3000, reference: null, compte_au_nom: "non", note: null },
    { id: "p2", sous_traitant_id: "st1", facture_id: null, date_paiement: "2026-04-01", montant: 500, reference: null, compte_au_nom: "oui", note: null },
  ];
  const codes = analyserSousTraitant(st, [], [f], ps, P, []).alertes.map((x) => x.code);
  for (const c of ["paiement_superieur", "paiement_sans_facture", "compte_tiers", "aucune_attestation", "mois_sans_attestation"]) assert.ok(codes.includes(c), c);
});

test("renouvellement : plus de 6 mois entre deux attestations", () => {
  const a1 = { id: "a1", sous_traitant_id: "st1", date_delivrance: "2026-01-10", mois_reference: null, effectif_etp: 4, remunerations: null, siren_conforme: "oui", authentifiee: "oui", note: null };
  const a2 = { ...a1, id: "a2", date_delivrance: "2026-08-20" };
  assert.ok(analyserSousTraitant(st, [a1, a2], [], [], P, []).alertes.some((x) => x.code === "renouvellement_tardif"));
});

test("bouclage : seules les heures des sous-traitants de rang 1 expliquent l'écart", () => {
  const e = calculerEcart([vente("2026-03-01", 2000)], [{ mois: "2026-03-01", effectif: 5, heures_payees: 800, note: null }], P);
  const st2 = { ...st, id: "st2", rang: 2, donneur_id: "st1" };
  const fs = [
    { id: "f1", sous_traitant_id: "st1", numero: null, date_facture: null, mois: "2026-03-01", heures: 900, montant_ht: null, montant_ttc: null, note: null },
    { id: "f2", sous_traitant_id: "st2", numero: null, date_facture: null, mois: "2026-03-01", heures: 400, montant_ht: null, montant_ttc: null, note: null },
  ];
  const b = boucler(e, [st, st2], fs);
  assert.equal(b.totalReste, 300);
  assert.equal(b.alertes[0].code, "ecart_non_explique");
});

test("bouclage : une sous-traitance facturée au-delà de l'écart est une alerte, et ne compense pas un autre mois", () => {
  const e = calculerEcart([vente("2026-03-01", 2000), vente("2026-04-01", 2000)], [
    { mois: "2026-03-01", effectif: 5, heures_payees: 800, note: null },
    { mois: "2026-04-01", effectif: 5, heures_payees: 800, note: null },
  ], P);
  const fs = [
    { id: "f1", sous_traitant_id: "st1", numero: null, date_facture: null, mois: "2026-03-01", heures: 1700, montant_ht: null, montant_ttc: null, note: null },
    { id: "f2", sous_traitant_id: "st1", numero: null, date_facture: null, mois: "2026-04-01", heures: 700, montant_ht: null, montant_ttc: null, note: null },
  ];
  const b = boucler(e, [st], fs);
  assert.equal(b.totalExcedent, 500);
  assert.equal(b.totalReste, 500);
  assert.deepEqual(b.alertes.map((a) => a.code).sort(), ["ecart_non_explique", "sous_traitance_excedentaire"]);
});
