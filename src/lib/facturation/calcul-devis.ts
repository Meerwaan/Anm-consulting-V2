import { JOURNEE_COMPLEMENTAIRE_HT, majorationEffectif, majorationSites } from "@/content/offres";

/**
 * Le calcul d'un devis, sans accès à la base : utilisé côté serveur à l'enregistrement et côté
 * écran pour afficher les totaux pendant la saisie. Mêmes règles que l'estimateur du site.
 */

export interface LigneDevis {
  designation: string;
  detail?: string;
  quantite: number;
  prix_unitaire_ht: number;
}

const arrondi = (n: number) => Math.round(n * 100) / 100;

export interface ParametresDevis {
  prestation: string;
  intitule: string;
  base_ht: number;
  effectif: number | null;
  sites: number | null;
  urgence: boolean;
  jours_comp: number;
  frais_ht: number;
  ajustement_ht: number;
  ajustement_libelle: string | null;
}

/** Les lignes du devis, dans l'ordre de la grille (11_Pilotage_Commercial_Tarifs > CHIFFRAGE). */
export const calculerDevis = (p: ParametresDevis, franchise: boolean) => {
  const suivi = p.prestation === "suivi_conformite";
  const lignes: LigneDevis[] = [{ designation: p.intitule, detail: suivi ? "Forfait mensuel" : "Forfait de base", quantite: 1, prix_unitaire_ht: p.base_ht }];
  if (!suivi) {
    const e = majorationEffectif(p.effectif ?? 0);
    if (e) lignes.push({ designation: `Majoration effectif (${p.effectif} salariés)`, quantite: 1, prix_unitaire_ht: e });
    const s = majorationSites(p.sites ?? 0);
    if (s) lignes.push({ designation: `Sites au-delà de deux (${(p.sites ?? 0) - 2} × 180 €)`, quantite: 1, prix_unitaire_ht: s });
    if (p.urgence) lignes.push({ designation: "Urgence : intervention sous 7 jours (+20 % de la base)", quantite: 1, prix_unitaire_ht: arrondi(0.2 * p.base_ht) });
    if (p.jours_comp > 0) lignes.push({ designation: "Journées complémentaires", quantite: p.jours_comp, prix_unitaire_ht: JOURNEE_COMPLEMENTAIRE_HT });
  }
  if (p.ajustement_ht) lignes.push({ designation: p.ajustement_libelle || (p.ajustement_ht < 0 ? "Remise" : "Ajustement"), quantite: 1, prix_unitaire_ht: p.ajustement_ht });
  if (p.frais_ht > 0) lignes.push({ designation: "Frais de déplacement", quantite: 1, prix_unitaire_ht: p.frais_ht });
  const total_ht = arrondi(lignes.reduce((t, l) => t + l.quantite * l.prix_unitaire_ht, 0));
  const taux = franchise ? 0 : 20;
  return { lignes, total_ht, taux_tva: taux, total_ttc: arrondi(total_ht * (1 + taux / 100)) };
};

