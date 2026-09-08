import { createClient } from "@/lib/supabase/server";
import type {
  AvancementEtape, Mission, PieceMission, PointDeControle, ResultatDePoint,
} from "@/lib/types";

export interface EnTeteMission extends Mission {
  organisation: { id: string; name: string; headcount: number | null; establishments: number | null } | null;
}

export interface HorsEtape {
  domain: string;
  points_total: number;
  points_traites: number;
}

/** Mission + organisation cliente. */
export const lireMission = async (missionId: string): Promise<EnTeteMission | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("missions")
    .select(
      "id, reference, type, status, opened_on, control_in_progress, control_body, control_deadline, intervention_on, scope, org_id, organisation:organizations (id, name, headcount, establishments)",
    )
    .eq("id", missionId)
    .maybeSingle();
  return (data as EnTeteMission | null) ?? null;
};

/** Les 15 étapes de la mission, avec leur avancement (vue mission_step_completeness). */
export const lireEtapes = async (missionId: string): Promise<AvancementEtape[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mission_step_completeness")
    .select("step_id, sort_order, name, kind, phase_id, status, points_total, points_traites")
    .eq("mission_id", missionId)
    .order("sort_order");
  return (data as AvancementEtape[] | null) ?? [];
};

/**
 * Points de contrôle qu'aucune étape ne couvre — aujourd'hui le fiscal, dont les
 * 24 points sont antérieurs aux 15 étapes. Affichés à part pour que la règle
 * « rien ne manque » tienne tant qu'une 16ᵉ étape n'est pas décidée.
 */
export const lireHorsEtape = async (missionId: string): Promise<HorsEtape[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mission_points_hors_etape")
    .select("domain, points_total, points_traites")
    .eq("mission_id", missionId);
  return (data as HorsEtape[] | null) ?? [];
};

/** Identifiants des modules actifs sur la mission — la portée de tout le reste. */
export const lireModulesActifs = async (missionId: string): Promise<number[]> => {
  const supabase = await createClient();
  const { data } = await supabase.from("mission_modules").select("module_id").eq("mission_id", missionId);
  return (data ?? []).map((r) => r.module_id as number);
};

export interface LignePoint extends PointDeControle {
  resultat: ResultatDePoint | null;
}

/**
 * Points de contrôle d'une étape, limités aux modules actifs de la mission.
 * Sans ce filtrage, une mission CNAPS afficherait les 208 points du référentiel.
 * `domaines` vide (étape sans contrôle) renvoie une liste vide.
 */
export const lirePointsDEtape = async (
  missionId: string,
  domaines: string[],
): Promise<LignePoint[]> => {
  if (domaines.length === 0) return [];
  const supabase = await createClient();
  const modules = await lireModulesActifs(missionId);
  if (modules.length === 0) return [];

  const [{ data: points }, { data: resultats }] = await Promise.all([
    supabase
      .from("control_points")
      .select("id, code, domain, theme, subtheme, question, evidence, initial_risk, reference, reference_kind")
      .eq("active", true)
      .in("domain", domaines)
      .in("module_id", modules)
      .order("code"),
    supabase
      .from("mission_control_results")
      .select("control_point_id, status, severity, note")
      .eq("mission_id", missionId),
  ]);

  const parPoint = new Map<number, ResultatDePoint>(
    ((resultats as ResultatDePoint[] | null) ?? []).map((r) => [r.control_point_id, r]),
  );
  return ((points as PointDeControle[] | null) ?? []).map((p) => ({
    ...p,
    resultat: parPoint.get(p.id) ?? null,
  }));
};

/** Les domaines d'une étape, lus sur le référentiel. */
export const lireDomainesEtape = async (stepId: number): Promise<string[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("method_steps")
    .select("domaines, objectif")
    .eq("id", stepId)
    .maybeSingle<{ domaines: string[] | null; objectif: string | null }>();
  return data?.domaines ?? [];
};

export const lireObjectifEtape = async (stepId: number): Promise<string | null> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("method_steps")
    .select("objectif")
    .eq("id", stepId)
    .maybeSingle<{ objectif: string | null }>();
  return data?.objectif ?? null;
};

/** Pièces attendues du client (kind = piece_client) et feuilles de travail. */
export const lirePieces = async (missionId: string): Promise<PieceMission[]> => {
  const supabase = await createClient();
  const { data } = await supabase
    .from("mission_documents")
    .select("id, name, category, required, received, received_on, complete, requested_on, module_id, kind")
    .eq("mission_id", missionId)
    .order("category")
    .order("name");
  return (data as PieceMission[] | null) ?? [];
};

export interface Note {
  id: string;
  created_at: string;
  body: string;
  step_id: number | null;
}

/** Notes de travail. Jamais partagées au client avant le rapport (décision 04). */
export const lireNotes = async (missionId: string, stepId?: number): Promise<Note[]> => {
  const supabase = await createClient();
  let requete = supabase
    .from("mission_notes")
    .select("id, created_at, body, step_id")
    .eq("mission_id", missionId)
    .order("created_at", { ascending: false })
    .limit(50);
  if (stepId !== undefined) requete = requete.eq("step_id", stepId);
  const { data } = await requete;
  return (data as Note[] | null) ?? [];
};
