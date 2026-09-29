/**
 * Les quatre checklists complètes (dix points chacune), telles qu’elles partent par email.
 *
 * Elles ne sont PAS affichées sur la vitrine : depuis le retour de Sofia du 29/09/2026 (« montrer où se
 * trouve le risque sans donner gratuitement toute la méthode »), la page ne montre que les trois premiers
 * points de chaque liste (`CHECKLISTS[].apercu` dans vitrine.ts, qui doivent rester identiques aux trois
 * premiers ci-dessous). Ce fichier ne doit être importé que côté serveur (action d’envoi de l’email),
 * jamais par un composant client, sinon les dix points repartent dans le JavaScript de la page.
 */
import type { ChecklistId } from "./vitrine";

export const CHECKLISTS_COMPLETES: Record<ChecklistId, readonly string[]> = {
  cnaps: [
    "Autorisation d’exercer à jour pour chaque établissement",
    "Cartes professionnelles : aucune expirée, activité adaptée au poste",
    "Sous-traitants autorisés, attestations de vigilance de moins de six mois",
    "Agrément dirigeant valide et affiché",
    "Déclarations mensuelles Dracar Ultimate à jour",
    "Contrats clients avec les mentions obligatoires",
    "Numéro d’autorisation sur devis, factures et documents commerciaux",
    "Tenue et carte visibles sur site, consignes écrites",
    "Registre du personnel et DPAE cohérents avec le planning",
    "Échéancier des renouvellements tenu, avec alerte à 90 jours",
  ],
  urssaf: [
    "DPAE transmise avant chaque prise de poste, sans exception",
    "Primes, paniers et indemnités justifiés par le planning réel (nuit, vacation, dimanche)",
    "Attestations de vigilance des sous-traitants renouvelées tous les six mois",
    "Registre unique du personnel à jour, contrats écrits et signés",
    "Classification et salaire de base conformes à la grille IDCC 1351",
    "Frais professionnels remboursés sur justificatifs, pas en forfait déguisé",
    "Heures supplémentaires et complémentaires payées, majorées et déclarées",
    "DSN mensuelle cohérente avec les bulletins et les effectifs",
    "Temps partiels : avenants signés et limite d’heures complémentaires respectée",
    "Planning, pointage, paie et facturation rapprochés au moins une fois par trimestre",
  ],
  inspection: [
    "DUERP rédigé, mis à jour dans l’année, adapté aux risques réels des sites",
    "Durées maximales de travail et repos quotidien et hebdomadaire respectés sur les plannings",
    "Travail isolé : procédure écrite et moyen d’alerte fonctionnel",
    "Plans de prévention établis pour les interventions sur sites clients",
    "Affichages et documents obligatoires disponibles : horaires, convention collective, coordonnées de l’inspection et de la médecine du travail",
    "Suivi médical à jour, renforcé pour les travailleurs de nuit",
    "Équipements de protection fournis, tracés, remplacés",
    "CSE en place dès que l’effectif l’impose, élections tracées",
    "Accidents du travail déclarés dans les délais et analysés",
    "Agressions et incidents consignés, avec une procédure connue des agents",
  ],
  fiscal: [
    "Fichier des écritures comptables (FEC) exportable et conforme, testé avant toute demande",
    "Factures complètes : mentions obligatoires et numéro d’autorisation CNAPS",
    "TVA collectée et déductible cohérentes avec les déclarations déposées",
    "Balance, grand livre et liasse fiscale rapprochés sans écart inexpliqué",
    "Chiffre d’affaires facturé rapproché des heures planifiées et pointées",
    "Charges et frais du dirigeant justifiés, usage mixte documenté",
    "Factures de sous-traitants rapprochées des plannings et des agents présents",
    "Comptes courants d’associés et flux avec le dirigeant documentés",
    "Pièces classées, indexées et datées, prêtes à être remises sur demande",
    "Interlocuteur unique désigné et procédure de contrôle comprise avant le premier rendez-vous",
  ],
};
