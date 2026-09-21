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

test("agents : absent des documents, carte non valide, plus d'agents que l'effectif déclaré", () => {
  const a = { id: "a", sous_traitant_id: "st1", date_delivrance: "2026-01-10", mois_reference: null, effectif_etp: 2, remunerations: null, siren_conforme: "oui", authentifiee: "oui", note: null };
  const ag = (nom, extra = {}) => ({ id: nom, sous_traitant_id: "st1", nom, employeur: null, carte_numero: null, heures: null, present_documents: "oui", carte_valide: "oui", carte_activite: null, dracar: "oui", planning: "oui", note: null, ...extra });
  const codes = analyserSousTraitant(st, [a], [], [], P, [], [ag("A"), ag("B", { present_documents: "non" }), ag("C", { carte_valide: "non" })]).alertes.map((x) => x.code);
  for (const c of ["agent_hors_documents", "carte_non_valide", "agents_superieurs_effectif"]) assert.ok(codes.includes(c), c);
});

import { analyserEntreprise, analyserCartes } from "../src/lib/sous-traitance/calculs.ts";

test("ventes : sans commande, au-delà de la commande, TVA, TTC, règlement", () => {
  const v = (x) => ({ id: "v", mois: "2026-03-01", client: "C", bon_commande: null, heures_commandees: null, heures_facturees: null, montant_ht: null, numero_facture: "F1", tva: null, montant_ttc: null, montant_regle: null, date_reglement: null, note: null, ...x });
  const a = analyserEntreprise([
    v({}),
    v({ bon_commande: "BC", heures_commandees: 100, heures_facturees: 120 }),
    v({ bon_commande: "BC", montant_ht: 1000, tva: 100, montant_ttc: 1200, montant_regle: 1500 }),
  ], [], []).ventes.map((x) => x.code);
  for (const c of ["vente_sans_commande", "facture_au_dela_commande", "tva_incoherente", "ttc_incoherent", "vente_trop_reglee"]) assert.ok(a.includes(c), c);
});

test("paie : heures réalisées non payées, coût horaire sous le SMIC", () => {
  const a = analyserEntreprise([], [{ mois: "2026-03-01", effectif: 10, heures_realisees: 1800, heures_payees: 1500, masse_salariale: 15000, note: null }], [{ valable_du: "2026-01-01", taux_brut: 12 }]).paie.map((x) => x.code);
  assert.deepEqual(a.sort(), ["cout_horaire_sous_smic", "heures_non_payees"]);
});

test("cartes : expirée, bientôt expirée, sans date", () => {
  const ag = (nom, carte_fin) => ({ id: nom, sous_traitant_id: null, nom, employeur: null, carte_numero: null, heures: null, present_documents: null, carte_valide: null, carte_activite: null, dracar: "oui", planning: "oui", carte_fin, affecte_mission: "oui", note: null });
  const codes = analyserCartes([ag("A", "2026-09-01"), ag("B", "2026-10-05"), ag("C", null), ag("D", "2027-06-01")], "2026-09-21").map((x) => x.code);
  assert.deepEqual(codes, ["carte_expiree", "carte_bientot_expiree", "carte_sans_date"]);
});

import { analyserFacturation } from "../src/lib/sous-traitance/calculs.ts";

test("DGFiP : numéros de facture en double, sous-traitance plus chère que la vente ou sous le SMIC", () => {
  const v = (numero, heures, montant) => ({ id: numero + heures, mois: "2026-03-01", client: "C", bon_commande: "BC", heures_commandees: null, heures_facturees: heures, montant_ht: montant, numero_facture: numero, tva: null, montant_ttc: null, montant_regle: null, date_reglement: null, note: null });
  const f = (sid, numero, heures, montant) => ({ id: sid + numero + heures, sous_traitant_id: sid, numero, date_facture: null, mois: "2026-03-01", heures, montant_ht: montant, montant_ttc: null, note: null });
  const cher = { ...st, id: "cher", raison_sociale: "Cher" };
  const bas = { ...st, id: "bas", raison_sociale: "Bas" };
  const a = analyserFacturation(
    [v("F-1", 100, 2500), v("f-1 ", 100, 2500)],
    [f("cher", "C1", 100, 3000), f("cher", "C1", 100, 3000), f("bas", "B1", 100, 1000)],
    [cher, bas],
    [{ valable_du: "2026-01-01", taux_brut: 12 }],
    P,
  ).map((x) => x.code);
  assert.deepEqual(a.sort(), ["cout_st_sous_smic", "cout_st_superieur_vente", "numero_st_double", "numero_vente_double"]);
});

import { echeancierVigilance } from "../src/lib/sous-traitance/calculs.ts";

test("échéancier de vigilance : conclusion puis tous les 6 mois jusqu'à la fin du contrat", () => {
  const c = { ...st, date_conclusion_contrat: "2025-10-15", date_fin_contrat: "2027-01-31" };
  const at = (id, date_delivrance) => ({ id, sous_traitant_id: "st1", date_delivrance, mois_reference: null, effectif_etp: 3, remunerations: null, siren_conforme: "oui", authentifiee: "oui", note: null });
  const e = echeancierVigilance(c, [at("a1", "2025-10-01"), at("a2", "2026-05-02")], "2026-09-21");
  assert.deepEqual(e.echeances.map((x) => [x.date, x.statut]), [
    ["2025-10-15", "fournie"],
    ["2026-04-15", "tardive"],
    ["2026-10-15", "prochaine"],
  ]);
  const sansFin = echeancierVigilance({ ...c, date_fin_contrat: null }, [], "2026-09-21");
  assert.deepEqual(sansFin.echeances.map((x) => x.statut), ["manquante", "manquante", "prochaine"]);
  assert.equal(echeancierVigilance(st, [], "2026-09-21"), null);
});

import { analyserIdentites, analyserSalaries } from "../src/lib/sous-traitance/calculs.ts";

test("identité : titre expiré, bientôt expiré, sans autorisation de travail ; un salarié sorti n'est plus suivi", () => {
  const ag = (nom, x) => ({ id: nom, sous_traitant_id: null, nom, note: null, ...x });
  const codes = analyserIdentites([
    ag("A", { piece_identite: "titre_sejour", piece_fin: "2026-09-01" }),
    ag("B", { piece_identite: "titre_sejour", piece_fin: "2026-10-30", autorisation_travail: "non" }),
    ag("C", { piece_identite: "cni", piece_fin: "2026-01-01" }),
    ag("D", { piece_identite: "titre_sejour", piece_fin: "2026-01-01", date_sortie: "2026-03-01" }),
  ], "2026-09-21").map((x) => x.code);
  assert.deepEqual(codes, ["titre_sejour_expire", "titre_sejour_bientot_expire", "sans_autorisation_travail", "piece_expiree"]);
});

test("salariés : DPAE absente ou tardive, registre, contrat, visite, effectif de la paie", () => {
  const ag = (nom, x) => ({ id: nom, sous_traitant_id: null, nom, note: null, ...x });
  const codes = analyserSalaries([
    ag("A", { date_entree: "2026-03-02", date_dpae: "2026-03-05", registre: "non" }),
    ag("B", { date_entree: "2026-01-05", type_contrat: "cdd", contrat_signe: "non" }),
    ag("C", { date_entree: "2025-01-05", date_dpae: "2025-01-02", visite_medicale: "2025-02-01", visite_prochaine: "2026-02-01" }),
  ], [{ mois: "2026-03-01", effectif: 5, heures_payees: null, note: null }], "2026-09-21").map((x) => x.code);
  for (const c of ["dpae_tardive", "absent_registre", "dpae_absente", "contrat_non_signe", "visite_absente", "visite_depassee", "effectif_liste_paie"]) assert.ok(codes.includes(c), c);
});

test("DGFiP : prix de vente et prix d'achat sous le coût de revient de référence", () => {
  const v = { id: "v", mois: "2026-03-01", client: "C", bon_commande: "BC", heures_commandees: null, heures_facturees: 100, montant_ht: 2000, numero_facture: "F-9", tva: null, montant_ttc: null, montant_regle: null, date_reglement: null, note: null };
  const f = { id: "f", sous_traitant_id: "st1", numero: "S1", date_facture: null, mois: "2026-03-01", heures: 100, montant_ht: 1900, montant_ttc: null, note: null };
  const codes = analyserFacturation([v], [f], [st], [], { ...P, cout_revient_horaire: 22, cout_revient_source: "Indice de la branche 2026" }).map((x) => x.code);
  assert.deepEqual(codes.sort(), ["cout_st_sous_revient", "prix_vente_sous_revient"]);
  assert.deepEqual(analyserFacturation([v], [f], [st], [], P).map((x) => x.code), []);
});
