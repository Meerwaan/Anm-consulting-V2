import { createClient } from "@/lib/supabase/server";

export interface Reponse {
  reponse: "oui" | "non" | "na" | "a_verifier" | null;
  observation: string | null;
}
export interface ValeurConclusion {
  choix: string | null;
  synthese: string | null;
}
export interface NonConformite {
  id: string;
  sous_traitant_id: string | null;
  nature: string;
  nature_autre: string | null;
  constat: string | null;
  element_verifie: string | null;
  action: string | null;
  delai: string | null;
  justificatif: string | null;
  risque: string | null;
  responsable: string | null;
  echeance: string | null;
  statut: "a_faire" | "en_cours" | "regularise";
  date_regularisation: string | null;
  preuve_regularisation: string | null;
}

export interface DonneesGrilles {
  /** Clé : `${grille}|${cible}|${item}` */
  reponses: Record<string, Reponse>;
  /** Clé : `${code de conclusion}|${cible}` */
  conclusions: Record<string, ValeurConclusion>;
  nonConformites: NonConformite[];
  /** Clé : identifiant du texte (ex. « contexte »). */
  textes: Record<string, string>;
}

export const cleReponse = (grille: string, cible: string, item: string) => `${grille}|${cible}|${item}`;
export const cleConclusion = (code: string, cible: string) => `${code}|${cible}`;

export const lireGrilles = async (missionId: string): Promise<DonneesGrilles> => {
  const supabase = await createClient();
  const [r, c, n, t] = await Promise.all([
    supabase.from("grille_reponses").select("grille, cible, item, reponse, observation").eq("mission_id", missionId),
    supabase.from("grille_conclusions").select("grille, cible, choix, synthese").eq("mission_id", missionId),
    supabase
      .from("non_conformites")
      .select("id, sous_traitant_id, nature, nature_autre, constat, element_verifie, action, delai, justificatif, risque, responsable, echeance, statut, date_regularisation, preuve_regularisation")
      .eq("mission_id", missionId)
      .order("created_at"),
    supabase.from("rapport_textes").select("cle, texte").eq("mission_id", missionId),
  ]);
  const reponses: Record<string, Reponse> = {};
  for (const x of (r.data ?? []) as { grille: string; cible: string; item: string; reponse: Reponse["reponse"]; observation: string | null }[]) {
    reponses[cleReponse(x.grille, x.cible, x.item)] = { reponse: x.reponse, observation: x.observation };
  }
  const conclusions: Record<string, ValeurConclusion> = {};
  for (const x of (c.data ?? []) as { grille: string; cible: string; choix: string | null; synthese: string | null }[]) {
    conclusions[cleConclusion(x.grille, x.cible)] = { choix: x.choix, synthese: x.synthese };
  }
  const textes: Record<string, string> = {};
  for (const x of (t.data ?? []) as { cle: string; texte: string | null }[]) if (x.texte) textes[x.cle] = x.texte;
  return { reponses, conclusions, nonConformites: (n.data as NonConformite[] | null) ?? [], textes };
};
