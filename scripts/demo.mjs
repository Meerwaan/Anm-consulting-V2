// Mission de démonstration, pour apprendre l'outil sur un cas réaliste.
//
//   node --experimental-strip-types --env-file=.env.local scripts/demo.mjs
//
// Efface la démo existante et la recrée à neuf : on peut la rejouer autant qu'on veut.
// Attention : ce que Sofia a saisi dans la démo est effacé aussi.
//
// Pour les tests automatiques, une copie à part, jamais la démo de Sofia :
//   DEMO_NOM="Test automatique" DEMO_REF=E2E-TEST node … scripts/demo.mjs
//   DEMO_NOM="Test automatique" DEMO_SUPPRIMER=1 node … scripts/demo.mjs   (la supprime)
// Données entièrement fictives (SIREN 999 999 999), avec de vraies erreurs à trouver :
// facture au-delà de la commande, TVA à 10 %, vente sans bon de commande, facture impayée,
// heures réalisées non payées, sous-traitant de 3 salariés qui facture 800 h par mois,
// attestation non renouvelée, paiement sur le compte d'un tiers, paiement sans facture,
// sous-traitance facturée au-delà du besoin, rang 2 sans attestation, cartes expirées,
// numéro de facture utilisé deux fois, échéances de vigilance manquées.
// Une partie des grilles est remplie, le reste est à faire : c'est l'exercice.
import { createClient } from "@supabase/supabase-js";
import { GRILLE_CNAPS, GRILLE_DGFIP, GRILLE_SOUS_TRAITANT, GRILLE_URSSAF } from "../src/content/grilles.ts";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const cle = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !cle) {
  console.error("Variables manquantes : lancer avec --env-file=.env.local");
  process.exit(1);
}
const db = createClient(url, cle, { auth: { persistSession: false, autoRefreshToken: false } });
const NOM = process.env.DEMO_NOM || "Démo — Horizon Sécurité Privée";
const REF = process.env.DEMO_REF || "DEMO-2026";

const verifier = (r, quoi) => {
  if (r.error) throw new Error(`${quoi} : ${r.error.message}`);
  return r.data;
};
const code = (grille, libelle) => {
  for (const s of grille.sections) {
    const i = s.items.find((x) => x.libelle === libelle);
    if (i) return i.code;
  }
  throw new Error(`Question introuvable : ${libelle}`);
};

// 1. Repartir de zéro --------------------------------------------------------------------
const anciennes = verifier(await db.from("organizations").select("id").eq("name", NOM), "lecture");
for (const o of anciennes) {
  const missions = verifier(await db.from("missions").select("id").eq("org_id", o.id), "missions");
  for (const m of missions) {
    const { data: objets } = await db.storage.from("pieces").list(m.id, { limit: 1000 });
    const { data: rapports } = await db.storage.from("pieces").list(`${m.id}/rapports`, { limit: 1000 });
    const chemins = [...(objets ?? []).filter((x) => x.id).map((x) => `${m.id}/${x.name}`), ...(rapports ?? []).map((x) => `${m.id}/rapports/${x.name}`)];
    if (chemins.length) await db.storage.from("pieces").remove(chemins);
  }
  verifier(await db.from("organizations").delete().eq("id", o.id), "suppression");
}
if (process.env.DEMO_SUPPRIMER) {
  console.log(`« ${NOM} » supprimée.`);
  process.exit(0);
}

// 2. Le client et la mission -----------------------------------------------------------------
const org = verifier(await db.from("organizations").insert({ name: NOM, siren: "999999999", headcount: 20, establishments: 1 }).select("id").single(), "client");
const mission = verifier(
  await db
    .from("missions")
    .insert({ org_id: org.id, reference: REF, type: "social_urssaf", control_in_progress: true, control_body: "URSSAF", control_deadline: "2026-11-16" })
    .select("id")
    .single(),
  "mission",
);
const M = mission.id;
verifier(await db.from("st_parametres").insert({ mission_id: M, periode_debut: "2026-01-01", periode_fin: "2026-06-01", taux_horaire_vendu: 24.5 }), "paramètres");

// 3. A — les ventes, et leur facturation ----------------------------------------------------------
const mois = ["01", "02", "03", "04", "05", "06"];
const ventes = [];
mois.forEach((mm, i) => {
  const n = i + 1;
  // Centre commercial : 3 000 h par mois, facturées à 24,50 € HT.
  const arcadesHT = 3000 * 24.5;
  const tvaArcades = mm === "03" ? arcadesHT * 0.1 : arcadesHT * 0.2; // mars : TVA à 10 %
  const ttcArcades = mm === "03" ? arcadesHT * 1.2 : arcadesHT + tvaArcades; // mars : TTC calculé à 20 % malgré tout
  ventes.push({
    mission_id: M, mois: `2026-${mm}-01`, client: "Centre commercial Les Arcades", bon_commande: `BC-ARC-26${mm}`,
    heures_commandees: 3000, heures_facturees: 3000, montant_ht: arcadesHT, numero_facture: `FA-26${mm}-01`,
    tva: tvaArcades, montant_ttc: ttcArcades,
    montant_regle: mm === "05" ? 40000 : mm === "06" ? null : ttcArcades, // mai : réglée en partie ; juin : pas encore
    date_reglement: mm === "06" ? null : `2026-${String(n + 1).padStart(2, "0")}-10`,
  });
  // Plateforme logistique : 1 800 h commandées.
  const hLog = mm === "02" ? 2100 : 1800; // février : 300 h de plus que la commande
  ventes.push({
    mission_id: M, mois: `2026-${mm}-01`, client: "Logistique Val-de-Marne", bon_commande: `BC-LVM-26${mm}`,
    heures_commandees: 1800, heures_facturees: mm === "06" ? null : hLog, montant_ht: hLog * 24.5, // juin : montant seul, converti
    numero_facture: `FA-26${mm}-02`, tva: hLog * 24.5 * 0.2, montant_ttc: hLog * 24.5 * 1.2, montant_regle: hLog * 24.5 * 1.2,
    date_reglement: `2026-${String(Math.min(n + 1, 12)).padStart(2, "0")}-05`,
  });
});
// Avril : une prestation événementielle facturée sans bon de commande, sous un numéro déjà utilisé.
ventes.push({
  mission_id: M, mois: "2026-04-01", client: "Stade municipal (événement)", bon_commande: null, heures_commandees: null,
  heures_facturees: 400, montant_ht: 400 * 26, numero_facture: "FA-2604-02", tva: 400 * 26 * 0.2, montant_ttc: 400 * 26 * 1.2,
  montant_regle: 400 * 26 * 1.2, date_reglement: "2026-05-02",
});
verifier(await db.from("st_ventes").insert(ventes), "ventes");

// 4. B — la paie : 20 salariés, 2 800 h payées par mois ------------------------------------------
verifier(
  await db.from("st_paie").insert(
    mois.map((mm) => ({
      mission_id: M, mois: `2026-${mm}-01`, effectif: 20,
      heures_realisees: mm === "04" ? 3100 : 2800, // avril : 300 h réalisées qui ne sont sur aucun bulletin
      heures_payees: 2800, masse_salariale: 2800 * 13.4, note: "DSN et bulletins",
    })),
  ),
  "paie",
);

// 5. Les sous-traitants ----------------------------------------------------------------------------
const st = async (x) => verifier(await db.from("st_sous_traitants").insert({ mission_id: M, ...x }).select("id").single(), "sous-traitant").id;
const vigilance = await st({ raison_sociale: "Vigilance Services IDF", siren: "999999991", dirigeant: "Karim B.", activite: "Surveillance humaine", adresse: "Créteil (94)", debut_relation: "2025-09-01", date_conclusion_contrat: "2025-12-05", date_fin_contrat: "2027-08-31", contrat_ref: "CST-2025-07", montant_contrat_ht: 160000 });
const protect = await st({ raison_sociale: "Protect Ouest", siren: "999999992", dirigeant: "Sébastien L.", activite: "Sécurité privée", adresse: "Nanterre (92)", debut_relation: "2025-11-01", date_conclusion_contrat: "2025-11-01", contrat_ref: null, montant_contrat_ht: 110000 });
const garde = await st({ raison_sociale: "Garde Express", siren: "999999993", activite: "Gardiennage", rang: 2, donneur_id: protect, date_conclusion_contrat: "2026-02-01", date_fin_contrat: "2026-12-31", montant_contrat_ht: null });

verifier(
  await db.from("st_attestations").insert([
    { mission_id: M, sous_traitant_id: vigilance, date_delivrance: "2025-12-10", mois_reference: "2025-11-01", effectif_etp: 18, remunerations: 52000, siren_conforme: "oui", authentifiee: "oui" },
    { mission_id: M, sous_traitant_id: vigilance, date_delivrance: "2026-06-05", mois_reference: "2026-05-01", effectif_etp: 19, remunerations: 55000, siren_conforme: "oui", authentifiee: "oui" },
    // Protect Ouest : une seule attestation, jamais renouvelée ; juin n'est plus couvert.
    { mission_id: M, sous_traitant_id: protect, date_delivrance: "2025-11-20", mois_reference: "2025-10-01", effectif_etp: 3, remunerations: 7500, siren_conforme: "oui", authentifiee: "a_verifier" },
  ]),
  "attestations",
);

const factures = [];
mois.forEach((mm) => {
  factures.push({ mission_id: M, sous_traitant_id: vigilance, numero: `VS-26${mm}`, date_facture: `2026-${mm}-28`, mois: `2026-${mm}-01`, heures: 1200, montant_ht: 1200 * 21, montant_ttc: 1200 * 21 * 1.2 });
  factures.push({ mission_id: M, sous_traitant_id: protect, numero: `PO-26${mm}`, date_facture: `2026-${mm}-28`, mois: `2026-${mm}-01`, heures: 800, montant_ht: 800 * 20, montant_ttc: 800 * 20 * 1.2 });
});
// Mars : une facture supplémentaire de Protect Ouest, au-delà de tout besoin.
factures.push({ mission_id: M, sous_traitant_id: protect, numero: "PO-2603-B", date_facture: "2026-03-31", mois: "2026-03-01", heures: 900, montant_ht: 900 * 20, montant_ttc: 900 * 20 * 1.2 });
factures.push({ mission_id: M, sous_traitant_id: garde, numero: "GE-2602", date_facture: "2026-02-27", mois: "2026-02-01", heures: 300, montant_ht: 300 * 18, montant_ttc: 300 * 18 * 1.2 });
factures.push({ mission_id: M, sous_traitant_id: garde, numero: "GE-2603", date_facture: "2026-03-30", mois: "2026-03-01", heures: 300, montant_ht: 300 * 18, montant_ttc: 300 * 18 * 1.2 });
const fs = verifier(await db.from("st_factures").insert(factures).select("id, numero, montant_ttc, sous_traitant_id"), "factures");
const facture = (n) => fs.find((f) => f.numero === n);

const paiements = [];
for (const f of fs.filter((x) => x.sous_traitant_id === vigilance)) {
  paiements.push({ mission_id: M, sous_traitant_id: vigilance, facture_id: f.id, date_paiement: `2026-${f.numero.slice(5, 7) === "06" ? "07" : String(Number(f.numero.slice(5, 7)) + 1).padStart(2, "0")}-15`, montant: f.montant_ttc, reference: `VIR-${f.numero}`, compte_au_nom: "oui" });
}
for (const n of ["PO-2601", "PO-2602", "PO-2603", "PO-2604", "PO-2605"]) {
  const f = facture(n);
  paiements.push({
    mission_id: M, sous_traitant_id: protect, facture_id: f.id, date_paiement: `2026-${String(Number(n.slice(5, 7)) + 1).padStart(2, "0")}-20`,
    montant: f.montant_ttc, reference: `VIR-${n}`, compte_au_nom: n === "PO-2604" ? "non" : "oui", // avril : versé sur le compte d'un tiers
  });
}
// La facture PO-2603-B est payée ; PO-2606 ne l'est pas. Et un virement sans facture.
paiements.push({ mission_id: M, sous_traitant_id: protect, facture_id: facture("PO-2603-B").id, date_paiement: "2026-04-25", montant: facture("PO-2603-B").montant_ttc, reference: "VIR-PO-2603-B", compte_au_nom: "oui" });
paiements.push({ mission_id: M, sous_traitant_id: protect, facture_id: null, date_paiement: "2026-05-30", montant: 4800, reference: "VIR-2605-DIVERS", compte_au_nom: "a_verifier" });
paiements.push({ mission_id: M, sous_traitant_id: garde, facture_id: facture("GE-2602").id, date_paiement: "2026-03-20", montant: facture("GE-2602").montant_ttc, reference: "VIR-GE-2602", compte_au_nom: "oui" });
verifier(await db.from("st_paiements").insert(paiements), "paiements");

// 6. Les agents -----------------------------------------------------------------------------------
verifier(
  await db.from("st_agents").insert([
    { mission_id: M, sous_traitant_id: vigilance, nom: "Mehdi A.", carte_numero: "CAR-093-2029-01-11-0001", heures: 151, present_documents: "oui", carte_valide: "oui", dracar: "oui", planning: "oui" },
    { mission_id: M, sous_traitant_id: vigilance, nom: "Julie R.", carte_numero: "CAR-094-2028-06-02-0002", heures: 140, present_documents: "oui", carte_valide: "oui", dracar: "oui", planning: "oui" },
    { mission_id: M, sous_traitant_id: protect, nom: "Yanis T.", carte_numero: "CAR-092-2027-03-15-0003", heures: 180, present_documents: "oui", carte_valide: "oui", dracar: "oui", planning: "oui" },
    { mission_id: M, sous_traitant_id: protect, nom: "Ousmane D.", carte_numero: "CAR-092-2025-12-01-0004", heures: 176, present_documents: "oui", carte_valide: "non", dracar: "non", planning: "oui" },
    { mission_id: M, sous_traitant_id: protect, nom: "Nicolas P.", carte_numero: null, heures: 168, present_documents: "non", carte_valide: "a_verifier", dracar: "non", planning: "oui" },
    { mission_id: M, sous_traitant_id: protect, nom: "Samir K.", carte_numero: "CAR-075-2028-09-30-0005", heures: 172, present_documents: "oui", carte_valide: "oui", dracar: "oui", planning: "non" },
    // Agents de l'entreprise (onglet Dracar Ultimate).
    { mission_id: M, sous_traitant_id: null, nom: "Claire M.", carte_numero: "CAR-094-2029-02-01-0101", carte_fin: "2029-02-01", dracar: "oui", planning: "oui", affecte_mission: "oui" },
    { mission_id: M, sous_traitant_id: null, nom: "David S.", carte_numero: "CAR-094-2026-08-31-0102", carte_fin: "2026-08-31", dracar: "oui", planning: "oui", affecte_mission: "oui" },
    { mission_id: M, sous_traitant_id: null, nom: "Inès B.", carte_numero: "CAR-094-2026-10-10-0103", carte_fin: "2026-10-10", dracar: "oui", planning: "oui", affecte_mission: "oui" },
    { mission_id: M, sous_traitant_id: null, nom: "Loïc F.", carte_numero: "CAR-094-2028-04-18-0104", carte_fin: "2028-04-18", dracar: "non", planning: "oui", affecte_mission: "a_verifier" },
    { mission_id: M, sous_traitant_id: null, nom: "Aïcha N.", carte_numero: "CAR-094-2027-11-05-0105", carte_fin: "2027-11-05", dracar: "oui", planning: "oui", affecte_mission: "oui" },
  ]),
  "agents",
);

// 7. Une partie des grilles, déjà remplie ----------------------------------------------------------
const r = (cible, libelle, reponse, observation = null, grille = GRILLE_SOUS_TRAITANT, nomGrille = "st") => ({
  mission_id: M, grille: nomGrille, cible, item: code(grille, libelle), reponse, observation,
});
const reponses = [
  // Vigilance Services : dossier propre, contrôle bien avancé.
  ...["Kbis / justificatif d’immatriculation", "SIREN / SIRET vérifié", "Activité déclarée cohérente avec la prestation", "Adresse de l’établissement vérifiée", "Dirigeant identifié", "Autorisation CNAPS valide", "Agrément(s) du ou des dirigeants vérifié(s)", "Établissement déclaré auprès du CNAPS", "Contrat écrit et signé", "Objet de la prestation clairement défini", "Prix et modalités de facturation définis", "Attestation de vigilance URSSAF demandée", "Attestation en cours de validité", "Authenticité de l’attestation vérifiée", "Contrôle renouvelé tous les 6 mois pendant l’exécution du contrat"].map((l) => r(vigilance, l, "oui")),
  // Protect Ouest : premières constatations, le reste est à faire.
  r(protect, "Kbis / justificatif d’immatriculation", "oui"),
  r(protect, "SIREN / SIRET vérifié", "oui"),
  r(protect, "Autorisation CNAPS valide", "a_verifier", "Numéro d’autorisation communiqué par e-mail, pas encore vérifié sur le site du CNAPS."),
  r(protect, "Contrat écrit et signé", "non", "Aucun contrat : la relation repose sur des bons de commande envoyés par e-mail."),
  r(protect, "Contrôle renouvelé tous les 6 mois pendant l’exécution du contrat", "non", "Une seule attestation, du 20/11/2025."),
  r(protect, "Agent absent des documents transmis", "oui", "Nicolas P. est sur le planning du site Arcades mais absent de la liste nominative transmise."),
  r(protect, "Donneur d’ordre établissant directement les plannings", "oui", "Les plannings des agents de Protect Ouest sont faits par le chef de site d’Horizon."),
  r(protect, "Facturation essentiellement calculée sur les heures / effectifs fournis", "oui"),
  // Dracar Ultimate.
  ...[["Espace administrateur créé", "oui"], ["Espace gestionnaire créé", "oui"], ["Gestionnaires désignés", "oui"], ["Établissements rattachés aux comptes concernés", "a_verifier"], ["Procédure interne de gestion de Dracar Ultimate définie", "non"], ["Tous les salariés/agents concernés sont rattachés dans Dracar Ultimate", "non"], ["Vérification régulière de la validité des cartes professionnelles", "non"]].map(([l, v]) =>
    r("mission", l, v, l.startsWith("Tous les salariés") ? "Loïc F. n’est pas rattaché ; la liste n’est pas tenue à jour depuis mars." : l.startsWith("Vérification régulière") ? "Aucune traçabilité : la validité des cartes n’est vérifiée qu’à l’embauche." : null, GRILLE_CNAPS, "cnaps"),
  ),
  ...[["Autorisation d’exercer CNAPS valide", "oui"], ["Une autorisation détenue pour chaque activité exercée", "a_verifier", "Surveillance humaine et événementiel : une seule autorisation présentée."], ["Compte administrateur validé par le CNAPS", "oui"], ["Rattachements rompus pour les salariés sortis", "non", "Deux agents sortis en avril sont toujours rattachés."], ["Entreprise concernée par la surveillance de grands événements", "oui", "Match au stade municipal en avril."], ["Validité des cartes contrôlée avant affectation", "non", "Aucune vérification tracée avant l’événement d’avril."]].map(([l, v, o = null]) =>
    r("mission", l, v, o, GRILLE_CNAPS, "cnaps"),
  ),
  // URSSAF : l'entreprise elle-même.
  ...[["DPAE effectuée avant chaque prise de poste", "oui"], ["Registre unique du personnel à jour", "oui"], ["Toutes les heures réalisées figurent sur les bulletins de paie", "non", "Avril : 300 h au planning ne figurent sur aucun bulletin."], ["Heures réalisées supérieures aux heures payées", "oui", "Avril 2026."], ["Entreprise immatriculée pour l’activité réellement exercée", "oui"], ["DSN déposées chaque mois", "oui"], ["Le client ne choisit, n’évalue ni ne sanctionne les agents", "a_verifier", "Le centre commercial demande parfois le remplacement d’un agent nommément."], ["Donneur d’ordre établissant directement les plannings", "oui", "Plannings de Protect Ouest faits par le chef de site d’Horizon."]].map(([l, v, o = null]) =>
    r("mission", l, v, o, GRILLE_URSSAF, "urssaf"),
  ),
  // DGFiP : factures.
  ...[["Numérotation continue et chronologique, sans doublon", "non", "FA-2604-02 attribué à deux factures (Logistique Val-de-Marne et Stade municipal)."], ["Taux de TVA correct", "non", "Mars : TVA à 10 % sur la facture Arcades."], ["Chaque facture correspond à une prestation identifiable (sites, dates, agents)", "a_verifier", "PO-2603-B : aucune liste d’agents ni planning joint."], ["Paiement effectué sur un compte au nom du sous-traitant", "non", "Avril : virement Protect Ouest sur un compte au nom d’un tiers."], ["Facture sans prestation identifiable", "oui", "PO-2603-B, 900 h en mars."], ["Paiement vers un compte différent de celui de l’émetteur", "oui"]].map(([l, v, o = null]) =>
    r("mission", l, v, o, GRILLE_DGFIP, "dgfip"),
  ),
];
verifier(await db.from("grille_reponses").insert(reponses), "réponses");
verifier(
  await db.from("grille_conclusions").insert([
    { mission_id: M, grille: "st-conclusion", cible: vigilance, choix: "Sous-traitance conforme" },
    { mission_id: M, grille: "st-vigilance", cible: vigilance, choix: "Conforme" },
    { mission_id: M, grille: "st-effectif", cible: vigilance, choix: "Oui" },
  ]),
  "conclusions",
);

// 8. Deux actions correctives, pour montrer la chaîne complète ----------------------------------------
verifier(
  await db.from("non_conformites").insert([
    {
      mission_id: M, sous_traitant_id: protect, nature: "travail_dissimule",
      constat: "Protect Ouest facture 800 h par mois (1 700 h en mars) avec un effectif déclaré de 3 salariés, soit une capacité d’environ 455 h.",
      element_verifie: "Attestation de vigilance du 20/11/2025, factures PO-2601 à PO-2606",
      risque: "Heures facturées sans capacité démontrée : recours possible à des salariés non déclarés ou à un sous-traitant non identifié.",
      action: "Obtenir la liste nominative des agents affectés, leurs bulletins de paie et l’attestation de vigilance à jour ; suspendre les nouvelles commandes dans l’attente.",
      justificatif: "Liste nominative, bulletins de paie des agents, attestation de vigilance de moins de 6 mois",
      responsable: "Dirigeant", echeance: "2026-10-15", statut: "a_faire",
    },
    {
      mission_id: M, sous_traitant_id: vigilance, nature: "defaut_vigilance",
      constat: "Attestation de vigilance de Vigilance Services non renouvelée entre décembre 2025 et juin 2026.",
      element_verifie: "Attestations du 10/12/2025 et du 05/06/2026",
      risque: "Défaut de vigilance du donneur d’ordre sur la période non couverte.",
      action: "Mettre en place un rappel semestriel de demande d’attestation pour chaque sous-traitant.",
      justificatif: "Tableau de suivi des attestations",
      responsable: "Responsable administratif", echeance: "2026-09-30", statut: "regularise",
      date_regularisation: "2026-09-18", preuve_regularisation: "Tableau de suivi mis en place, rappels programmés",
    },
  ]),
  "actions",
);

// 9. Quelques pièces déjà reçues ------------------------------------------------------------------
const { data: pieces } = await db.from("mission_documents").select("id, name").eq("mission_id", M);
const recues = (pieces ?? []).slice(0, 6).map((p) => p.id);
if (recues.length) await db.from("mission_documents").update({ received: "oui", received_on: "2026-09-15" }).in("id", recues);

console.log(`Démo prête : « ${NOM} », mission ${REF} (${M}).`);
console.log(`${ventes.length} ventes, 6 mois de paie, 3 sous-traitants, ${factures.length} factures, ${paiements.length} paiements, 11 agents, ${reponses.length} réponses de grille, 2 actions.`);
