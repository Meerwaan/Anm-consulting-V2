/**
 * Offres et tarifs — source de vérité pour la vitrine et le calculateur de devis.
 * Sources : 10_Pack_Commercial_Contractuel.docx §2 (offre) · 11_Pilotage_Commercial_Tarifs.xlsx
 * (TARIFS, CHIFFRAGE, ABONNEMENTS). Pack complet V2, septembre 2026.
 *
 * Décisions de la consultante du 08/09/2026 :
 *   02. La grille complète est affichée sur la vitrine — chaque offre avec sa fourchette.
 *   01. L'offre fiscale est lancée, mais SUR DEVIS uniquement : aucun montant affiché.
 * ⚠ Le format de la mission fiscale (nombre de jours) reste à confirmer.
 */

export type MissionType =
  | "flash"
  | "cnaps"
  | "social_urssaf"
  | "inspection"
  | "fiscal"
  | "audit_360"
  | "suivi_conformite";

export interface Offre {
  id: MissionType;
  nom: string;
  contenu: string;
  format: string;
  /** Prix de base HT (11 TARIFS > Base HT). null = à définir. */
  baseHT: number | null;
  /** Fourchette affichée sur la vitrine (10 §2 > Tarif indicatif). */
  fourchette: string;
  /** Supplément indicatif HT (11 TARIFS). */
  supplementHT: number | null;
  cible: string;
  commentaire?: string;
  /** Statut de validation de l'offre par Maman. */
  statut: "brouillon" | "a_valider" | "valide";
  produitPhare?: boolean;
}

export const OFFRES: Offre[] = [
  {
    id: "flash",
    nom: "Diagnostic Flash",
    contenu:
      "Entretien dirigeant + examen ciblé de documents + synthèse des principaux points de vigilance.",
    format: "½ journée à 1 journée",
    baseHT: 590,
    fourchette: "À partir de 590 € HT",
    supplementHT: 150,
    cible: "TPE / premier contact",
    statut: "valide",
  },
  {
    id: "cnaps",
    nom: "Audit CNAPS",
    contenu:
      "Société, dirigeants, agents/titres, Dracar Ultimate, contrats, missions, sous-traitance et visite terrain.",
    format: "1 à 2 jours + rapport",
    baseHT: 1500,
    fourchette: "1 500 à 2 900 € HT",
    supplementHT: 650,
    cible: "TPE / PME",
    commentaire: "Ajouter selon sites / effectif",
    statut: "valide",
  },
  {
    id: "social_urssaf",
    nom: "Audit Social / URSSAF",
    contenu:
      "Contrats, DPAE, paie, temps de travail, frais, primes, DSN, sous-traitance et rapprochements.",
    format: "1 à 3 jours + rapport",
    baseHT: 1800,
    fourchette: "1 800 à 3 500 € HT",
    supplementHT: 750,
    cible: "TPE / PME",
    commentaire: "Volume paie déterminant",
    statut: "valide",
  },
  {
    id: "inspection",
    nom: "Audit Inspection du travail",
    contenu:
      "Temps de travail, DUERP, prévention, suivi santé, CSE, documents et organisation multi-sites.",
    format: "1 à 2 jours + rapport",
    baseHT: 1500,
    fourchette: "1 500 à 2 900 € HT",
    supplementHT: 650,
    cible: "TPE / PME",
    commentaire: "Ajouter si multi-sites",
    statut: "valide",
  },
  {
    id: "fiscal",
    nom: "Préparation contrôle fiscal DGFiP",
    contenu:
      "Procédure et charte, FEC / balance / grand livre, chiffre d'affaires et facturation, TVA collectée et déductible, charges et frais du dirigeant, sous-traitance, préparation de la remise des pièces. Orientation systématique vers expert-comptable / avocat fiscaliste.",
    format: "1 à 2 jours + rapport (à confirmer)",
    baseHT: null,
    fourchette: "Sur devis",
    supplementHT: null,
    cible: "TPE / PME",
    commentaire:
      "Décision 01 du 08/09/2026 : offre lancée, sans montant affiché — la charge dépend trop de la comptabilité du client. Format encore à confirmer.",
    statut: "valide",
  },
  {
    id: "audit_360",
    nom: "Audit 360° Sécurité Privée",
    contenu:
      "Audit croisé CNAPS + social/URSSAF + Inspection du travail + exploitation + plan d'actions.",
    format: "2 à 5 jours selon taille",
    baseHT: 2900,
    fourchette: "2 900 à 5 900 € HT",
    supplementHT: 900,
    cible: "PME",
    commentaire: "Produit phare",
    statut: "valide",
    produitPhare: true,
  },
  {
    id: "suivi_conformite",
    nom: "Suivi Conformité",
    contenu:
      "Revue périodique, contrôle des échéances, suivi du plan d'actions et points dirigeants.",
    format: "Mensuel / trimestriel",
    baseHT: 390,
    fourchette: "390 à 990 € HT / mois",
    supplementHT: null,
    cible: "Tous clients",
    statut: "valide",
  },
];

/** Journée complémentaire consultant (11 TARIFS). */
export const JOURNEE_COMPLEMENTAIRE_HT = 850;

export interface Abonnement {
  id: "essentiel" | "pilotage" | "360" | "direction_conformite";
  nom: string;
  prixMensuelHT: number;
  inclus: string;
  revue: string;
  support: string;
  cible: string;
  limites: string;
}

/** 11_Pilotage_Commercial_Tarifs.xlsx > ABONNEMENTS. */
export const ABONNEMENTS: Abonnement[] = [
  {
    id: "essentiel",
    nom: "Essentiel",
    prixMensuelHT: 390,
    inclus: "Revue trimestrielle + suivi actions",
    revue: "Trimestrielle",
    support: "Email",
    cible: "TPE < 20 salariés",
    limites: "1 établissement",
  },
  {
    id: "pilotage",
    nom: "Pilotage",
    prixMensuelHT: 590,
    inclus: "Revue bimestrielle + alertes titres / points sociaux",
    revue: "Bimestrielle",
    support: "Email + téléphone",
    cible: "20-50 salariés",
    limites: "Jusqu'à 3 sites",
  },
  {
    id: "360",
    nom: "360",
    prixMensuelHT: 790,
    inclus: "Revue mensuelle ciblée + tableau de bord",
    revue: "Mensuelle",
    support: "Prioritaire",
    cible: "50-100 salariés",
    limites: "Jusqu'à 5 sites",
  },
  {
    id: "direction_conformite",
    nom: "Direction conformité",
    prixMensuelHT: 990,
    inclus: "Pilotage mensuel + comité dirigeant + contrôles ciblés",
    revue: "Mensuelle",
    support: "Prioritaire",
    cible: "PME",
    limites: "Périmètre à cadrer",
  },
];

/**
 * Calculateur de devis — règles de 11_Pilotage_Commercial_Tarifs.xlsx > CHIFFRAGE.
 *   Majoration effectif : ≤20 → 0 · ≤50 → 350 · ≤100 → 700 · ≤200 → 1 200 · >200 → 1 800
 *   Majoration sites    : max(0, sites − 2) × 180
 *   Urgence < 7 jours   : +20 % de la base
 *   Jours complémentaires × 850 · Frais de déplacement HT convenus
 */
export interface ChiffrageInput {
  baseHT: number;
  effectif: number;
  sites: number;
  urgence: boolean;
  joursComplementaires?: number;
  fraisDeplacementHT?: number;
}

export function majorationEffectif(effectif: number): number {
  if (effectif <= 20) return 0;
  if (effectif <= 50) return 350;
  if (effectif <= 100) return 700;
  if (effectif <= 200) return 1200;
  return 1800;
}

export function majorationSites(sites: number): number {
  return Math.max(0, sites - 2) * 180;
}

export function chiffrer(input: ChiffrageInput) {
  const base = input.baseHT;
  const effectif = majorationEffectif(input.effectif);
  const sites = majorationSites(input.sites);
  const jours = (input.joursComplementaires ?? 0) * JOURNEE_COMPLEMENTAIRE_HT;
  const urgence = input.urgence ? 0.2 * base : 0;
  const deplacement = input.fraisDeplacementHT ?? 0;
  const totalHT = base + effectif + sites + jours + urgence + deplacement;
  return { base, effectif, sites, jours, urgence, deplacement, totalHT };
}
