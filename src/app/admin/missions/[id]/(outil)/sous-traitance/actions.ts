"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";
import { TABLES, type NomTable, lireDate, lireMois, lireNombre, lireVerif, versLigneInitiale } from "@/lib/sous-traitance/tables";

type Resultat<T = undefined> = ({ ok: true } & (T extends undefined ? object : { valeur: T })) | { ok: false; erreur: string };

const racine = (missionId: string) => `/admin/missions/${missionId}/sous-traitance`;

/**
 * Convertit une ligne saisie (chaînes) en valeurs pour la base, colonne par colonne,
 * d'après TABLES. Toute colonne non déclarée est ignorée : le navigateur ne peut rien
 * écrire d'autre que ce que l'écran montre.
 */
const convertir = (table: NomTable, ligne: Record<string, string>): { valeurs: Record<string, unknown> } | { erreur: string } => {
  const valeurs: Record<string, unknown> = {};
  for (const c of TABLES[table].colonnes) {
    if (!(c.cle in ligne)) continue;
    const brut = String(ligne[c.cle] ?? "");
    let v: unknown;
    switch (c.type) {
      case "heures":
      case "euros":
      case "nombre": {
        const n = lireNombre(brut);
        if (Number.isNaN(n)) return { erreur: `« ${brut} » n’est pas un nombre (${c.libelle}).` };
        if (n !== null && n < 0 && c.type !== "euros") return { erreur: `${c.libelle} ne peut pas être négatif.` };
        v = n;
        break;
      }
      case "mois": {
        const m = lireMois(brut);
        if (m === "invalide") return { erreur: `« ${brut} » n’est pas un mois lisible (${c.libelle}). Exemple : 03/2026.` };
        v = m;
        break;
      }
      case "date": {
        const d = lireDate(brut);
        if (d === "invalide") return { erreur: `« ${brut} » n’est pas une date lisible (${c.libelle}). Exemple : 31/03/2026.` };
        v = d;
        break;
      }
      case "verif": {
        const r = lireVerif(brut);
        if (r === "invalide") return { erreur: `« ${brut} » : réponds oui, non ou à vérifier (${c.libelle}).` };
        v = r;
        break;
      }
      case "facture":
        v = /^[0-9a-f-]{36}$/.test(brut) ? brut : null;
        break;
      case "choix": {
        const x = brut.trim();
        const o = c.options?.find((p) => p.v === x || p.l.toLowerCase() === x.toLowerCase());
        if (x && !o) return { erreur: `« ${brut} » n’est pas un choix possible (${c.libelle}).` };
        v = o?.v ?? null;
        break;
      }
      default:
        v = brut.trim() || null;
    }
    valeurs[c.cle] = v;
  }
  return { valeurs };
};

/**
 * Enregistre une ligne d'un tableau de saisie. Renvoie sa clé (identifiant, ou mois
 * pour la paie) pour que l'écran sache qu'elle existe désormais en base.
 */
export const enregistrerLigne = async (entree: {
  missionId: string;
  table: NomTable;
  sousTraitantId?: string;
  /** Clé actuelle en base ; absente pour une nouvelle ligne. */
  cle?: string;
  ligne: Record<string, string>;
}): Promise<Resultat<{ cle: string; valeurs: Record<string, string> }>> => {
  const session = await exigerRole("consultant");
  const def = TABLES[entree.table];
  if (!def) return { ok: false, erreur: "Tableau inconnu." };

  const conv = convertir(entree.table, entree.ligne);
  if ("erreur" in conv) return { ok: false, erreur: conv.erreur };
  const valeurs = conv.valeurs;
  const supabase = await createClient();
  const tableDb = def.base ?? def.nom;
  if (def.complement && !entree.cle) return { ok: false, erreur: "Ajoute d’abord la ligne dans le tableau principal." };

  if (!def.globale) valeurs.mission_id = entree.missionId;
  if (def.parSousTraitant) {
    if (!entree.sousTraitantId) return { ok: false, erreur: "Sous-traitant manquant." };
    const { data: st } = await supabase
      .from("st_sous_traitants")
      .select("id")
      .eq("id", entree.sousTraitantId)
      .eq("mission_id", entree.missionId)
      .maybeSingle();
    if (!st) return { ok: false, erreur: "Ce sous-traitant n’appartient pas à la mission. Recharge la page." };
    valeurs.sous_traitant_id = entree.sousTraitantId;
  }
  if (tableDb === "st_ventes" || tableDb === "st_paie") {
    valeurs.updated_at = new Date().toISOString();
    valeurs.updated_by = session.utilisateurId;
  }
  if (entree.table === "smic_horaire") valeurs.saisi_par = session.utilisateurId;

  // Tables à clé naturelle (paie : un mois ; SMIC : une date) : la clé est obligatoire,
  // et la changer revient à déplacer la ligne.
  if (def.cle !== "id") {
    const nouvelleCle = valeurs[def.cle] as string | null;
    if (!nouvelleCle) return { ok: false, erreur: `${def.colonnes.find((c) => c.cle === def.cle)?.libelle} est obligatoire.` };
    if (entree.table === "smic_horaire" && valeurs.taux_brut == null) return { ok: false, erreur: "Saisis le taux horaire brut." };
    if (entree.cle && entree.cle !== nouvelleCle) {
      let suppr = supabase.from(tableDb).delete().eq(def.cle, entree.cle);
      if (!def.globale) suppr = suppr.eq("mission_id", entree.missionId);
      await suppr;
    }
    const conflit = def.globale ? def.cle : `mission_id,${def.cle}`;
    const { error } = await supabase.from(tableDb).upsert(valeurs, { onConflict: conflit });
    if (error) {
      console.error("[sous-traitance] enregistrement", entree.table, error.message);
      return { ok: false, erreur: "L’enregistrement a échoué. Réessaie." };
    }
    revalidatePath(racine(entree.missionId), "layout");
    return { ok: true, valeur: { cle: nouvelleCle, valeurs: versLigneInitiale(entree.table, valeurs).valeurs } };
  }

  if (entree.cle) {
    let maj = supabase.from(tableDb).update(valeurs).eq("id", entree.cle).eq("mission_id", entree.missionId);
    if (def.parSousTraitant) maj = maj.eq("sous_traitant_id", entree.sousTraitantId!);
    const { error } = await maj;
    if (error) {
      console.error("[sous-traitance] mise à jour", entree.table, error.message);
      return { ok: false, erreur: "L’enregistrement a échoué. Réessaie." };
    }
    revalidatePath(racine(entree.missionId), "layout");
    return { ok: true, valeur: { cle: entree.cle, valeurs: versLigneInitiale(entree.table, valeurs).valeurs } };
  }

  if (tableDb === "st_ventes" && !valeurs.mois) return { ok: false, erreur: "Indique le mois de la vente." };
  const { data, error } = await supabase.from(tableDb).insert(valeurs).select("id").single<{ id: string }>();
  if (error || !data) {
    console.error("[sous-traitance] création", entree.table, error?.message);
    return { ok: false, erreur: "L’enregistrement a échoué. Réessaie." };
  }
  revalidatePath(racine(entree.missionId), "layout");
  return { ok: true, valeur: { cle: data.id, valeurs: versLigneInitiale(entree.table, valeurs).valeurs } };
};

export const supprimerLigne = async (entree: {
  missionId: string;
  table: NomTable;
  cle: string;
}): Promise<Resultat> => {
  await exigerRole("consultant");
  const def = TABLES[entree.table];
  if (!def) return { ok: false, erreur: "Tableau inconnu." };
  if (def.complement) return { ok: false, erreur: "Supprime la ligne dans le tableau principal." };
  const supabase = await createClient();
  let suppr = supabase.from(def.base ?? def.nom).delete().eq(def.cle, entree.cle);
  if (!def.globale) suppr = suppr.eq("mission_id", entree.missionId);
  const { error } = await suppr;
  if (error) return { ok: false, erreur: "La suppression a échoué. Réessaie." };
  revalidatePath(racine(entree.missionId), "layout");
  return { ok: true };
};

/** Paramètres de la mission : période, taux horaire vendu, base d'un temps plein. */
export const enregistrerParametres = async (entree: {
  missionId: string;
  periode_debut: string;
  periode_fin: string;
  taux_horaire_vendu: string;
  heures_mensuelles_etp: string;
}): Promise<Resultat> => {
  const session = await exigerRole("consultant");
  const debut = lireMois(entree.periode_debut);
  const fin = lireMois(entree.periode_fin);
  const taux = lireNombre(entree.taux_horaire_vendu);
  const etp = lireNombre(entree.heures_mensuelles_etp);
  if (debut === "invalide" || fin === "invalide") return { ok: false, erreur: "Période illisible. Exemple : 01/2026." };
  if (Number.isNaN(taux) || (taux !== null && taux <= 0)) return { ok: false, erreur: "Le taux horaire vendu doit être un montant positif." };
  if (Number.isNaN(etp) || etp === null || etp <= 0) return { ok: false, erreur: "La base mensuelle d’un temps plein doit être un nombre d’heures positif." };
  if (debut && fin && fin < debut) return { ok: false, erreur: "La fin de la période est avant son début." };

  const supabase = await createClient();
  const { error } = await supabase.from("st_parametres").upsert({
    mission_id: entree.missionId,
    periode_debut: debut,
    periode_fin: fin,
    taux_horaire_vendu: taux,
    heures_mensuelles_etp: etp,
    updated_at: new Date().toISOString(),
    updated_by: session.utilisateurId,
  });
  if (error) return { ok: false, erreur: "L’enregistrement a échoué. Réessaie." };
  revalidatePath(racine(entree.missionId), "layout");
  return { ok: true };
};

/** Crée un sous-traitant et renvoie son identifiant, pour ouvrir son dossier. */
export const creerSousTraitant = async (entree: {
  missionId: string;
  raison_sociale: string;
  siren: string;
  rang: "1" | "2";
  donneur_id: string;
}): Promise<Resultat<string>> => {
  await exigerRole("consultant");
  const nom = entree.raison_sociale.trim();
  if (!nom) return { ok: false, erreur: "Indique la raison sociale." };
  if (entree.rang === "2" && !entree.donneur_id) {
    return { ok: false, erreur: "Un sous-traitant de rang 2 travaille pour un sous-traitant de rang 1 : choisis lequel." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase
    .from("st_sous_traitants")
    .insert({
      mission_id: entree.missionId,
      raison_sociale: nom,
      siren: entree.siren.replace(/\s/g, "") || null,
      rang: entree.rang === "2" ? 2 : 1,
      donneur_id: entree.rang === "2" ? entree.donneur_id : null,
    })
    .select("id")
    .single<{ id: string }>();
  if (error || !data) return { ok: false, erreur: "La création a échoué. Réessaie." };
  revalidatePath(racine(entree.missionId), "layout");
  return { ok: true, valeur: data.id };
};

const CHAMPS_IDENTITE = ["raison_sociale", "siren", "adresse", "dirigeant", "activite", "debut_relation", "date_conclusion_contrat", "date_fin_contrat", "contrat_ref", "montant_contrat_ht", "note"] as const;

export const enregistrerIdentite = async (entree: {
  missionId: string;
  sousTraitantId: string;
  champs: Partial<Record<(typeof CHAMPS_IDENTITE)[number], string>>;
}): Promise<Resultat> => {
  await exigerRole("consultant");
  const maj: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of CHAMPS_IDENTITE) {
    if (!(k in entree.champs)) continue;
    const brut = String(entree.champs[k] ?? "");
    if (k === "montant_contrat_ht") {
      const n = lireNombre(brut);
      if (Number.isNaN(n)) return { ok: false, erreur: "Le montant du contrat n’est pas un nombre." };
      maj[k] = n;
    } else if (k === "debut_relation" || k === "date_conclusion_contrat" || k === "date_fin_contrat") {
      const d = lireDate(brut);
      if (d === "invalide") return { ok: false, erreur: "Date illisible. Exemple : 01/03/2025." };
      maj[k] = d;
    } else if (k === "raison_sociale") {
      if (!brut.trim()) return { ok: false, erreur: "La raison sociale ne peut pas être vide." };
      maj[k] = brut.trim();
    } else {
      maj[k] = brut.trim() || null;
    }
  }
  const supabase = await createClient();
  const { error } = await supabase
    .from("st_sous_traitants")
    .update(maj)
    .eq("id", entree.sousTraitantId)
    .eq("mission_id", entree.missionId);
  if (error) return { ok: false, erreur: "L’enregistrement a échoué. Réessaie." };
  revalidatePath(racine(entree.missionId), "layout");
  return { ok: true };
};

export const supprimerSousTraitant = async (entree: { missionId: string; sousTraitantId: string }): Promise<Resultat> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  const { error } = await supabase
    .from("st_sous_traitants")
    .delete()
    .eq("id", entree.sousTraitantId)
    .eq("mission_id", entree.missionId);
  if (error) return { ok: false, erreur: "La suppression a échoué. Réessaie." };
  revalidatePath(racine(entree.missionId), "layout");
  return { ok: true };
};
