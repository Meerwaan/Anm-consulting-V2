"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";
import { GRILLES, NATURES_NC, type CodeGrille } from "@/content/grilles";
import { lireDate } from "@/lib/sous-traitance/tables";

type Resultat<T = undefined> = ({ ok: true } & (T extends undefined ? object : { valeur: T })) | { ok: false; erreur: string };

const rafraichir = (missionId: string) => revalidatePath(`/admin/missions/${missionId}`, "layout");

/** La cible d'une réponse : « mission », ou un sous-traitant de CETTE mission. */
const cibleValide = async (missionId: string, grille: CodeGrille, cible: string): Promise<boolean> => {
  if (GRILLES[grille].portee === "mission") return cible === "mission";
  const supabase = await createClient();
  const { data } = await supabase.from("st_sous_traitants").select("id").eq("id", cible).eq("mission_id", missionId).maybeSingle();
  return Boolean(data);
};

const REPONSES = new Set(["oui", "non", "na", "a_verifier"]);

/** Une case d'une grille : réponse et observation. Seules les questions de la grille sont acceptées. */
export const enregistrerReponse = async (entree: {
  missionId: string;
  grille: CodeGrille;
  cible: string;
  item: string;
  reponse?: string | null;
  observation?: string | null;
}): Promise<Resultat> => {
  const session = await exigerRole("consultant");
  const g = GRILLES[entree.grille];
  if (!g) return { ok: false, erreur: "Grille inconnue." };
  const items = new Set([
    ...g.sections.flatMap((s) => s.items.map((i) => i.code)),
    ...g.conclusions.filter((c) => c.type === "multi").flatMap((c) => (c.choix ?? []).map((_, i) => `${c.code}.${i}`)),
  ]);
  if (!items.has(entree.item)) return { ok: false, erreur: "Question inconnue. Recharge la page." };
  if (entree.reponse && !REPONSES.has(entree.reponse)) return { ok: false, erreur: "Réponse invalide." };
  if (!(await cibleValide(entree.missionId, entree.grille, entree.cible))) return { ok: false, erreur: "Dossier introuvable. Recharge la page." };

  const valeurs: Record<string, unknown> = {
    mission_id: entree.missionId,
    grille: entree.grille,
    cible: entree.cible,
    item: entree.item,
    updated_at: new Date().toISOString(),
    updated_by: session.utilisateurId,
  };
  if (entree.reponse !== undefined) valeurs.reponse = entree.reponse || null;
  if (entree.observation !== undefined) valeurs.observation = entree.observation?.trim() || null;

  const supabase = await createClient();
  const { error } = await supabase.from("grille_reponses").upsert(valeurs, { onConflict: "mission_id,grille,cible,item" });
  if (error) {
    console.error("[grilles] réponse", error.message);
    return { ok: false, erreur: "Non enregistré. Réessaie." };
  }
  rafraichir(entree.missionId);
  return { ok: true };
};

/** Une conclusion : un choix parmi ceux de la grille, ou un texte libre. */
export const enregistrerConclusion = async (entree: {
  missionId: string;
  grille: CodeGrille;
  cible: string;
  code: string;
  choix?: string | null;
  synthese?: string | null;
}): Promise<Resultat> => {
  const session = await exigerRole("consultant");
  const c = GRILLES[entree.grille]?.conclusions.find((x) => x.code === entree.code);
  if (!c) return { ok: false, erreur: "Conclusion inconnue." };
  if (entree.choix && !(c.choix ?? []).includes(entree.choix)) return { ok: false, erreur: "Choix invalide." };
  if (!(await cibleValide(entree.missionId, entree.grille, entree.cible))) return { ok: false, erreur: "Dossier introuvable. Recharge la page." };

  const valeurs: Record<string, unknown> = {
    mission_id: entree.missionId,
    grille: entree.code,
    cible: entree.cible,
    updated_at: new Date().toISOString(),
    updated_by: session.utilisateurId,
  };
  if (entree.choix !== undefined) valeurs.choix = entree.choix || null;
  if (entree.synthese !== undefined) valeurs.synthese = entree.synthese?.trim() || null;
  const supabase = await createClient();
  const { error } = await supabase.from("grille_conclusions").upsert(valeurs, { onConflict: "mission_id,grille,cible" });
  if (error) {
    console.error("[grilles] conclusion", error.message);
    return { ok: false, erreur: "Non enregistré. Réessaie." };
  }
  rafraichir(entree.missionId);
  return { ok: true };
};

// ——— Non-conformités (grille 02 §11) ————————————————————————————————————————

const CHAMPS_NC = [
  "sous_traitant_id", "nature", "nature_autre", "constat", "element_verifie", "action", "delai", "justificatif",
  "risque", "responsable", "echeance", "statut", "date_regularisation", "preuve_regularisation",
] as const;
const STATUTS = new Set(["a_faire", "en_cours", "regularise"]);

export const enregistrerNonConformite = async (entree: {
  missionId: string;
  id?: string;
  champs: Partial<Record<(typeof CHAMPS_NC)[number], string>>;
}): Promise<Resultat<string>> => {
  await exigerRole("consultant");
  const valeurs: Record<string, unknown> = { updated_at: new Date().toISOString() };
  for (const k of CHAMPS_NC) {
    if (!(k in entree.champs)) continue;
    const v = String(entree.champs[k] ?? "").trim();
    if (k === "nature") {
      if (!(v in NATURES_NC)) return { ok: false, erreur: "Nature de non-conformité inconnue." };
      valeurs[k] = v;
    } else if (k === "sous_traitant_id") {
      valeurs[k] = /^[0-9a-f-]{36}$/.test(v) ? v : null;
    } else if (k === "statut") {
      if (!STATUTS.has(v)) return { ok: false, erreur: "Statut inconnu." };
      valeurs[k] = v;
    } else if (k === "echeance" || k === "date_regularisation") {
      const d = lireDate(v);
      if (d === "invalide") return { ok: false, erreur: "Date illisible. Exemple : 31/10/2026." };
      valeurs[k] = d;
    } else {
      valeurs[k] = v || null;
    }
  }
  const supabase = await createClient();
  if (typeof valeurs.sous_traitant_id === "string") {
    const { data } = await supabase.from("st_sous_traitants").select("id").eq("id", valeurs.sous_traitant_id).eq("mission_id", entree.missionId).maybeSingle();
    if (!data) return { ok: false, erreur: "Sous-traitant introuvable." };
  }
  if (entree.id) {
    const { error } = await supabase.from("non_conformites").update(valeurs).eq("id", entree.id).eq("mission_id", entree.missionId);
    if (error) return { ok: false, erreur: "Non enregistré. Réessaie." };
    rafraichir(entree.missionId);
    return { ok: true, valeur: entree.id };
  }
  if (!valeurs.nature) valeurs.nature = "autre";
  const { data, error } = await supabase
    .from("non_conformites")
    .insert({ ...valeurs, mission_id: entree.missionId })
    .select("id")
    .single<{ id: string }>();
  if (error || !data) return { ok: false, erreur: "La création a échoué. Réessaie." };
  rafraichir(entree.missionId);
  return { ok: true, valeur: data.id };
};

export const supprimerNonConformite = async (entree: { missionId: string; id: string }): Promise<Resultat> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  const { error } = await supabase.from("non_conformites").delete().eq("id", entree.id).eq("mission_id", entree.missionId);
  if (error) return { ok: false, erreur: "La suppression a échoué. Réessaie." };
  rafraichir(entree.missionId);
  return { ok: true };
};

// ——— Textes du rapport ————————————————————————————————————————————————————————

const CLES_TEXTE = /^(contexte|synthese|conclusion|limites)$/;

export const enregistrerTexte = async (entree: { missionId: string; cle: string; texte: string }): Promise<Resultat> => {
  const session = await exigerRole("consultant");
  if (!CLES_TEXTE.test(entree.cle)) return { ok: false, erreur: "Texte inconnu." };
  const supabase = await createClient();
  const { error } = await supabase.from("rapport_textes").upsert(
    {
      mission_id: entree.missionId,
      cle: entree.cle,
      texte: entree.texte.trim() || null,
      updated_at: new Date().toISOString(),
      updated_by: session.utilisateurId,
    },
    { onConflict: "mission_id,cle" },
  );
  if (error) return { ok: false, erreur: "Non enregistré. Réessaie." };
  rafraichir(entree.missionId);
  return { ok: true };
};
