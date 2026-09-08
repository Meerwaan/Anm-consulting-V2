"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";
import type { ResultatPoint, StatutEtape, TypeMission } from "@/lib/types";
import { textesDuDomaine, type DomaineAudit } from "@/content/textes";

const chemin = (missionId: string) => `/admin/missions/${missionId}`;

/**
 * Crée l'organisation cliente si besoin, puis la mission.
 * Le trigger `init_mission` fait le reste : modules, 15 étapes, 7 phases et la
 * checklist des pièces s'initialisent seuls selon le type de mission.
 */
export const creerMission = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const nomClient = String(formData.get("client") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const type = String(formData.get("type") ?? "audit_360") as TypeMission;
  const effectif = Number(formData.get("effectif") ?? 0) || null;
  const sites = Number(formData.get("sites") ?? 0) || null;
  if (!nomClient || !reference) return;

  const { data: org, error: erreurOrg } = await supabase
    .from("organizations")
    .insert({ name: nomClient, headcount: effectif, establishments: sites })
    .select("id")
    .single();
  if (erreurOrg || !org) return;

  const { data: mission } = await supabase
    .from("missions")
    .insert({ org_id: org.id, reference, type })
    .select("id")
    .single();

  revalidatePath("/admin");
  if (mission) redirect(`${chemin(mission.id)}/etapes/1`);
};

/** Résultat d'un point de contrôle. La gravité par défaut reprend le risque initial du référentiel. */
export const definirResultatPoint = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const pointId = Number(formData.get("pointId"));
  const statut = String(formData.get("statut")) as ResultatPoint;
  const ordre = String(formData.get("ordre") ?? "1");
  const risqueInitial = String(formData.get("risqueInitial") ?? "");
  const { data: utilisateur } = await supabase.auth.getUser();

  await supabase.from("mission_control_results").upsert(
    {
      mission_id: missionId,
      control_point_id: pointId,
      status: statut,
      // Un écart hérite du risque initial du référentiel ; elle l'ajuste ensuite.
      severity: statut === "non_conforme" || statut === "partiel" ? risqueInitial : null,
      updated_at: new Date().toISOString(),
      updated_by: utilisateur.user?.id ?? null,
    },
    { onConflict: "mission_id,control_point_id" },
  );

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
};

/**
 * Marque conformes tous les points de l'étape encore à vérifier.
 * Sur une mission 360°, la majorité des points est conforme : les cocher un par
 * un coûte des centaines de clics pour aucune information. On saisit les écarts,
 * pas la normalité.
 */
export const marquerEtapeConforme = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const ordre = String(formData.get("ordre") ?? "1");
  const pointsIds = String(formData.get("pointsIds") ?? "")
    .split(",")
    .map((v) => Number(v))
    .filter((v) => Number.isFinite(v) && v > 0);
  if (pointsIds.length === 0) return;

  const { data: utilisateur } = await supabase.auth.getUser();
  const { data: existants } = await supabase
    .from("mission_control_results")
    .select("control_point_id, status")
    .eq("mission_id", missionId)
    .in("control_point_id", pointsIds);

  const dejaTraites = new Set(
    ((existants as { control_point_id: number; status: string }[] | null) ?? [])
      .filter((r) => r.status !== "a_verifier")
      .map((r) => r.control_point_id),
  );
  const aRemplir = pointsIds.filter((id) => !dejaTraites.has(id));
  if (aRemplir.length === 0) return;

  await supabase.from("mission_control_results").upsert(
    aRemplir.map((id) => ({
      mission_id: missionId,
      control_point_id: id,
      status: "conforme" as ResultatPoint,
      severity: null,
      updated_at: new Date().toISOString(),
      updated_by: utilisateur.user?.id ?? null,
    })),
    { onConflict: "mission_id,control_point_id" },
  );

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
};

/** Avancement d'une étape : à faire / en cours / faite / sans objet. */
export const definirStatutEtape = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const stepId = Number(formData.get("stepId"));
  const statut = String(formData.get("statut")) as StatutEtape;
  const ordre = String(formData.get("ordre") ?? "1");

  await supabase
    .from("mission_step_progress")
    .update({ status: statut, done_at: statut === "done" ? new Date().toISOString() : null })
    .eq("mission_id", missionId)
    .eq("step_id", stepId);

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
};

/** Note de travail rattachée à l'étape. Jamais visible du client (décision 04). */
export const ajouterNote = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const stepId = Number(formData.get("stepId"));
  const ordre = String(formData.get("ordre") ?? "1");
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return;

  const { data: utilisateur } = await supabase.auth.getUser();
  await supabase.from("mission_notes").insert({
    mission_id: missionId,
    step_id: stepId,
    body,
    author_id: utilisateur.user?.id ?? null,
    visible_to_client: false,
  });

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
};

/**
 * Demande en une fois toutes les pièces obligatoires non reçues.
 * C'est le poste de perte de temps numéro un d'une mission : réclamer les
 * pièces une par une multiplie les allers-retours. Une demande par pièce est
 * créée (le client doit pouvoir en déposer une sans attendre les autres), mais
 * en un seul geste, et les relances partent ensuite toutes seules.
 */
export const demanderPiecesManquantes = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const ordre = String(formData.get("ordre") ?? "3");
  const { data: utilisateur } = await supabase.auth.getUser();

  const [{ data: pieces }, { data: demandes }] = await Promise.all([
    supabase
      .from("mission_documents")
      .select("id, module_id, name")
      .eq("mission_id", missionId)
      .eq("required", true)
      .eq("kind", "piece_client")
      .neq("received", "oui"),
    supabase
      .from("document_requests")
      .select("document_id")
      .eq("mission_id", missionId)
      .in("status", ["ouverte", "relancee"]),
  ]);

  const dejaDemandees = new Set(
    ((demandes as { document_id: string | null }[] | null) ?? []).map((d) => d.document_id),
  );
  const aDemander = ((pieces as { id: string; module_id: number | null; name: string }[] | null) ?? [])
    .filter((p) => !dejaDemandees.has(p.id));
  if (aDemander.length === 0) return;

  await supabase.from("document_requests").insert(
    aDemander.map((p) => ({
      mission_id: missionId,
      document_id: p.id,
      module_id: p.module_id,
      requested_by: utilisateur.user?.id ?? null,
      message: `Merci de déposer : ${p.name}`,
    })),
  );
  await supabase
    .from("mission_documents")
    .update({ requested_on: new Date().toISOString().slice(0, 10) })
    .in("id", aDemander.map((p) => p.id));

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
};

/**
 * Date portée par la pièce (ou son échéance quand elle en porte une).
 * C'est cette date qui déclenche le calcul de péremption et l'échéance client.
 */
export const definirDateDocument = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const documentId = String(formData.get("documentId"));
  const ordre = String(formData.get("ordre") ?? "3");
  const champ = String(formData.get("champ")) === "expire_le" ? "expire_le" : "document_date";
  const valeur = String(formData.get("valeur") ?? "").trim() || null;

  await supabase
    .from("mission_documents")
    .update({ [champ]: valeur, received: valeur ? "oui" : "non", received_on: valeur ? new Date().toISOString().slice(0, 10) : null })
    .eq("id", documentId)
    .eq("mission_id", missionId);

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
};

/**
 * Contrôle croisé : deux valeurs qui devraient dire la même chose.
 * Le système calcule l'écart, il ne le qualifie pas — un écart n'est pas un constat.
 */
export const enregistrerRapprochement = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const kind = String(formData.get("kind"));
  const ordre = String(formData.get("ordre") ?? "10");
  const nombre = (n: FormDataEntryValue | null): number | null => {
    const v = String(n ?? "").replace(",", ".").trim();
    return v === "" || Number.isNaN(Number(v)) ? null : Number(v);
  };

  const { data: utilisateur } = await supabase.auth.getUser();
  await supabase.from("mission_reconciliations").upsert(
    {
      mission_id: missionId,
      kind,
      periode: String(formData.get("periode") ?? "").trim() || null,
      valeur_a: nombre(formData.get("valeurA")),
      valeur_b: nombre(formData.get("valeurB")),
      tolerance_pct: nombre(formData.get("tolerance")) ?? 0,
      note: String(formData.get("note") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
      updated_by: utilisateur.user?.id ?? null,
    },
    { onConflict: "mission_id,kind" },
  );

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
};

/** Criticité → priorité du plan d'actions (01 Bible §2 : P1 immédiat, P2 30 j, P3 90 j, P4 amélioration). */
const PRIORITE_PAR_CRITICITE: Record<string, "P1" | "P2" | "P3" | "P4"> = {
  critique: "P1",
  majeur: "P2",
  modere: "P3",
  mineur: "P4",
};

/** Échéance conseillée par priorité, en jours (même source). */
const DELAI_PAR_PRIORITE: Record<string, number> = { P1: 7, P2: 30, P3: 90, P4: 180 };

/**
 * Ouvre un constat depuis un point de contrôle en écart, pré-rempli avec ce que le
 * référentiel sait déjà : le fait à qualifier, la preuve à examiner, le risque initial,
 * et les textes du domaine. Elle ne rédige que ce qui est propre au dossier.
 *
 * Sans ça, chaque écart se retape à la main dans le rapport — sur 184 points, c'est le
 * dernier gros poste de saisie de la mission.
 */
export const creerConstatDepuisPoint = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const pointId = Number(formData.get("pointId"));
  const ordre = String(formData.get("ordre") ?? "11");

  const [{ data: point }, { data: resultat }] = await Promise.all([
    supabase
      .from("control_points")
      .select("id, code, domain, theme, subtheme, question, evidence, initial_risk, module_id")
      .eq("id", pointId)
      .maybeSingle(),
    supabase
      .from("mission_control_results")
      .select("status, severity, note, finding_id")
      .eq("mission_id", missionId)
      .eq("control_point_id", pointId)
      .maybeSingle(),
  ]);
  if (!point || resultat?.finding_id) return;

  const criticite = (resultat?.severity ?? point.initial_risk) as string;
  const textes = textesDuDomaine(point.domain as DomaineAudit)
    .filter((t) => t.role === "principal")
    .map((t) => `${t.texte.nom}${t.texte.portee ? ` (${t.texte.portee})` : ""}`)
    .join(" · ");

  const { data: constat } = await supabase
    .from("findings")
    .insert({
      mission_id: missionId,
      control_point_id: point.id,
      module_id: point.module_id,
      domain: point.domain,
      title: point.subtheme ? `${point.theme} — ${point.subtheme}` : point.theme,
      // Trame de la formule de constat du pack : elle remplace les crochets, elle ne part pas de zéro.
      fact: resultat?.note?.trim()
        ? resultat.note
        : `Sur l'échantillon examiné, [fait précis à compléter]. Point de contrôle ${point.code} : ${point.question}`,
      evidence: point.evidence,
      severity: criticite,
      control_status: resultat?.status ?? "non_conforme",
      // Le texte est proposé, jamais présumé vérifié : c'est la règle d'or du pack.
      reference: textes || null,
      reference_checked: "a_verifier",
      recommendation: null,
      priority: PRIORITE_PAR_CRITICITE[criticite] ?? "P3",
      nature: resultat?.status === "partiel" ? "amelioration" : "risque_controle",
      status: "ouvert",
      visible_to_client: false,
    })
    .select("id")
    .single();

  if (constat) {
    await supabase
      .from("mission_control_results")
      .update({ finding_id: constat.id })
      .eq("mission_id", missionId)
      .eq("control_point_id", pointId);
  }

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
  revalidatePath(`${chemin(missionId)}/etapes/11`);
};

/**
 * Enregistre un constat.
 *
 * Un constat ne peut PAS être publié au client tant que sa référence n'est pas marquée
 * vérifiée : c'est la règle d'or du pack (fait → preuve → risque → référence vérifiée)
 * rendue mécanique plutôt que laissée à la vigilance.
 */
export const enregistrerConstat = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const constatId = String(formData.get("constatId"));
  const ordre = String(formData.get("ordre") ?? "11");
  const referenceVerifiee = formData.get("referenceVerifiee") === "on";
  const publier = formData.get("publier") === "on";
  const severity = String(formData.get("severity"));

  await supabase
    .from("findings")
    .update({
      title: String(formData.get("title") ?? "").trim() || "Constat",
      fact: String(formData.get("fact") ?? "").trim(),
      evidence: String(formData.get("evidence") ?? "").trim() || null,
      severity,
      priority: PRIORITE_PAR_CRITICITE[severity] ?? "P3",
      reference: String(formData.get("reference") ?? "").trim() || null,
      reference_checked: referenceVerifiee ? "oui" : "a_verifier",
      recommendation: String(formData.get("recommendation") ?? "").trim() || null,
      nature: String(formData.get("nature")),
      status: String(formData.get("statut")),
      // Verrou : pas de publication sans référence vérifiée.
      visible_to_client: publier && referenceVerifiee,
    })
    .eq("id", constatId)
    .eq("mission_id", missionId);

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
};

/**
 * Génère une action par constat qui n'en a pas encore, avec la priorité et l'échéance
 * conseillée par la criticité. Elle ajuste ensuite le responsable et la date.
 */
export const genererPlanActions = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const ordre = String(formData.get("ordre") ?? "13");

  const [{ data: constats }, { data: actions }] = await Promise.all([
    supabase
      .from("findings")
      .select("id, domain, title, recommendation, priority, severity")
      .eq("mission_id", missionId),
    supabase.from("actions").select("finding_id").eq("mission_id", missionId),
  ]);

  const dejaCouverts = new Set(
    ((actions as { finding_id: string | null }[] | null) ?? []).map((a) => a.finding_id),
  );
  const aCreer = ((constats as { id: string; domain: string; title: string; recommendation: string | null; priority: string }[] | null) ?? [])
    .filter((c) => !dejaCouverts.has(c.id));
  if (aCreer.length === 0) return;

  const aujourdhui = new Date();
  await supabase.from("actions").insert(
    aCreer.map((c) => {
      const echeance = new Date(aujourdhui);
      echeance.setDate(echeance.getDate() + (DELAI_PAR_PRIORITE[c.priority] ?? 90));
      return {
        mission_id: missionId,
        finding_id: c.id,
        domain: c.domain,
        title: c.recommendation?.trim() || `Traiter : ${c.title}`,
        priority: c.priority,
        due_on: echeance.toISOString().slice(0, 10),
        status: "a_faire" as const,
      };
    }),
  );

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
};

/** Étape 1 — ce que dit le dirigeant : contexte, contrôle en cours, points sensibles. */
export const enregistrerCadrage = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  const missionId = String(formData.get("missionId"));

  await supabase
    .from("missions")
    .update({
      control_in_progress: formData.get("controleEnCours") === "on",
      control_body: String(formData.get("organisme") ?? "").trim() || null,
      control_deadline: String(formData.get("echeance") ?? "").trim() || null,
      initial_hotspots: String(formData.get("pointsSensibles") ?? "").trim() || null,
      intervention_on: String(formData.get("intervention") ?? "").trim() || null,
      restitution_on: String(formData.get("restitution") ?? "").trim() || null,
    })
    .eq("id", missionId);

  revalidatePath(`${chemin(missionId)}/etapes/1`);
};

/** Étape 2 — le périmètre : effectif, établissements, sites clients, ce qui est audité. */
export const enregistrerPerimetre = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  const missionId = String(formData.get("missionId"));
  const orgId = String(formData.get("orgId"));
  const entier = (v: FormDataEntryValue | null): number | null => {
    const n = Number(String(v ?? "").trim());
    return Number.isFinite(n) && n > 0 ? n : null;
  };

  await Promise.all([
    supabase
      .from("organizations")
      .update({
        headcount: entier(formData.get("effectif")),
        establishments: entier(formData.get("etablissements")),
        client_sites: entier(formData.get("sitesClients")),
      })
      .eq("id", orgId),
    supabase
      .from("missions")
      .update({ scope: String(formData.get("perimetre") ?? "").trim() || null })
      .eq("id", missionId),
  ]);

  revalidatePath(`${chemin(missionId)}/etapes/2`);
};
