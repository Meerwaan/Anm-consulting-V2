"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";
import type { ResultatPoint, StatutEtape, TypeMission } from "@/lib/types";
import { textesDuDomaine, type DomaineAudit } from "@/content/textes";
import { axeParDefaut } from "@/content/vision";
import {
  DELAI_PAR_PRIORITE,
  PRIORITE_PAR_CRITICITE,
  TRAITEMENT_PAR_PRIORITE,
  cequiManque,
} from "@/content/constat";

const chemin = (missionId: string) => `/admin/missions/${missionId}`;

/**
 * Retour à l'écran avec un message.
 *
 * Aucune écriture ne doit échouer en silence : sur un outil qui sert à préparer un
 * contrôle, croire qu'on a enregistré alors que non est le pire des défauts.
 */
type Retour = (missionId: string, ordre: string, params: Record<string, string>) => never;
// Le type est porté par la constante, pas seulement par la flèche : c'est ce qui
// permet à TypeScript de savoir qu'un appel à `retour` interrompt la suite, et donc
// de comprendre qu'après « si le point est introuvable, retour », le point existe.
const retour: Retour = (missionId, ordre, params) => {
  const q = new URLSearchParams(params).toString();
  redirect(`${chemin(missionId)}/etapes/${ordre}${q ? `?${q}` : ""}`);
};

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
  const ligneId = String(formData.get("ligneId") ?? "").trim();
  const nombre = (n: FormDataEntryValue | null): number | null => {
    const v = String(n ?? "").replace(",", ".").trim();
    return v === "" || Number.isNaN(Number(v)) ? null : Number(v);
  };

  const { data: utilisateur } = await supabase.auth.getUser();
  const valeurs = {
    // La procédure §7 dit « prendre un site client et un mois représentatif » : un
    // croisement sans site ni période ne dit pas sur quoi il a porté, et le rapport ne
    // peut pas le reprendre.
    site: String(formData.get("site") ?? "").trim() || null,
    periode: String(formData.get("periode") ?? "").trim() || null,
    valeur_a: nombre(formData.get("valeurA")),
    valeur_b: nombre(formData.get("valeurB")),
    tolerance_pct: nombre(formData.get("tolerance")) ?? 0,
    note: String(formData.get("note") ?? "").trim() || null,
    updated_at: new Date().toISOString(),
    updated_by: utilisateur.user?.id ?? null,
  };

  /**
   * Mise à jour par identifiant de ligne, insertion sinon.
   *
   * L'ancienne version faisait un upsert sur (mission, type de croisement) : saisir un
   * second site écrasait silencieusement les chiffres du premier, alors que la méthode
   * demande justement d'élargir quand une anomalie sérieuse apparaît.
   */
  const { error } = ligneId
    ? await supabase
        .from("mission_reconciliations")
        .update(valeurs)
        .eq("id", ligneId)
        .eq("mission_id", missionId)
    : await supabase
        .from("mission_reconciliations")
        .insert({ mission_id: missionId, kind, ...valeurs });

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
  retour(missionId, ordre, error
    ? { erreur: error.message.includes("portee_uniq")
        ? "Ce croisement existe déjà pour ce site et cette période — modifie la ligne existante."
        : error.message }
    : { ok: ligneId ? "Croisement mis à jour." : "Croisement ajouté." });
};

/** Étape 10 — retirer un croisement saisi par erreur. */
export const supprimerRapprochement = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  const missionId = String(formData.get("missionId"));
  const ordre = String(formData.get("ordre") ?? "10");
  const { error } = await supabase
    .from("mission_reconciliations")
    .delete()
    .eq("id", String(formData.get("ligneId")))
    .eq("mission_id", missionId);
  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
  retour(missionId, ordre, error ? { erreur: error.message } : { ok: "Croisement supprimé." });
};

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
      .select("id, code, domain, theme, subtheme, question, evidence, initial_risk, module_id, reference, reference_kind")
      .eq("id", pointId)
      .maybeSingle(),
    supabase
      .from("mission_control_results")
      .select("status, severity, note, finding_id")
      .eq("mission_id", missionId)
      .eq("control_point_id", pointId)
      .maybeSingle(),
  ]);
  if (!point) retour(missionId, ordre, { erreur: "Point de contrôle introuvable." });
  if (resultat?.finding_id) {
    // Ce n'est pas une erreur : le constat existe déjà. On y renvoie au lieu de
    // laisser le clic sans effet visible.
    retour(missionId, ordre, { ok: "Ce point a déjà son constat, il est plus bas dans la liste." });
  }

  const criticite = (resultat?.severity ?? point.initial_risk) as string;

  /**
   * La référence proposée part du plus précis vers le plus général : l'article porté
   * par le point de contrôle lui-même quand il en a un (`reference_kind = 'source'`),
   * puis les textes du domaine en complément. Ne servir que les textes du domaine
   * revenait à proposer « Code du travail » là où le point disait déjà « L8221-1 ».
   */
  const textesDomaine = textesDuDomaine(point.domain as DomaineAudit)
    .filter((t) => t.role === "principal")
    .map((t) => `${t.texte.nom}${t.texte.portee ? ` (${t.texte.portee})` : ""}`);
  const referencePoint =
    point.reference_kind === "source" && point.reference?.trim() ? point.reference.trim() : null;
  const textes = [referencePoint, ...textesDomaine].filter(Boolean).join(" · ");

  const { data: constat, error } = await supabase
    .from("findings")
    .insert({
      mission_id: missionId,
      control_point_id: point.id,
      module_id: point.module_id,
      domain: point.domain,
      title: point.subtheme ? `${point.theme} — ${point.subtheme}` : point.theme,
      // La note de saisie si elle existe, sinon vide : un champ pré-rempli d'une trame
      // à trous compte comme rempli à l'œil et bloque le contrôle de complétude.
      // Ce que dit le référentiel est affiché SOUS le champ, pas dedans.
      fact: resultat?.note?.trim() ?? "",
      evidence: "",
      risk: null,
      severity: criticite,
      control_status: resultat?.status ?? "non_conforme",
      // Le texte est proposé, jamais présumé vérifié : c'est la règle d'or du pack.
      reference: textes || null,
      reference_checked: "a_verifier",
      recommendation: null,
      priority: PRIORITE_PAR_CRITICITE[criticite] ?? "P3",
      nature: axeParDefaut(resultat?.status, criticite),
      status: "ouvert",
      visible_to_client: false,
    })
    .select("id")
    .single();

  // L'index unique (mission, point) peut refuser si un constat existe déjà sans que le
  // résultat ait été relié : on rattache l'existant au lieu de laisser un écran muet.
  let constatId = constat?.id ?? null;
  if (!constatId) {
    const { data: existant } = await supabase
      .from("findings")
      .select("id")
      .eq("mission_id", missionId)
      .eq("control_point_id", pointId)
      .maybeSingle();
    constatId = existant?.id ?? null;
    if (!constatId) {
      retour(missionId, ordre, { erreur: error?.message ?? "Le constat n'a pas pu être créé." });
    }
  }

  await supabase
    .from("mission_control_results")
    .update({ finding_id: constatId })
    .eq("mission_id", missionId)
    .eq("control_point_id", pointId);

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
  revalidatePath(`${chemin(missionId)}/etapes/11`);
  retour(missionId, "11", { ok: `Constat ouvert depuis ${point.code}. Complète-le ici.` });
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

  const fait = String(formData.get("fact") ?? "").trim();
  const preuve = String(formData.get("evidence") ?? "").trim();
  const risque = String(formData.get("risk") ?? "").trim();
  const reference = String(formData.get("reference") ?? "").trim();
  const reco = String(formData.get("recommendation") ?? "").trim();

  /**
   * Un constat ne se publie que COMPLET. Vérifier la seule référence ne suffit pas :
   * un constat a déjà été publié avec la trame « [fait précis à compléter] » dedans.
   * La chaîne du pack est indivisible — fait, preuve, risque, référence, action.
   */
  const manques = cequiManque({
    fact: fait,
    evidence: preuve,
    risk: risque,
    reference,
    reference_checked: referenceVerifiee ? "oui" : "a_verifier",
    recommendation: reco,
  });
  const complet = manques.length === 0;

  // On ne réécrit pas une date de vérification déjà posée : c'est le jour où elle a
  // ouvert le texte, pas celui de la dernière retouche du constat.
  const { data: avant } = await supabase
    .from("findings")
    .select("reference_checked_on, reference")
    .eq("id", constatId)
    .eq("mission_id", missionId)
    .maybeSingle();
  // La date ne suit que la référence qu'elle a réellement ouverte : si le texte change,
  // elle repart. Sinon une nouvelle référence hériterait de la vérification de l'ancienne,
  // et l'écran afficherait « vérifiée le … » pour un article jamais lu.
  const referenceInchangee = (avant?.reference ?? "").trim() === reference;
  const dateVerifieeExistante = referenceInchangee
    ? ((avant?.reference_checked_on as string | null) ?? null)
    : null;

  const { error } = await supabase
    .from("findings")
    .update({
      title: String(formData.get("title") ?? "").trim() || "Constat",
      fact: fait,
      evidence: preuve || null,
      risk: risque || null,
      severity,
      priority: PRIORITE_PAR_CRITICITE[severity] ?? "P3",
      reference: reference || null,
      reference_checked: referenceVerifiee ? "oui" : "a_verifier",
      // Le pack demande une référence « vérifiée ET datée » : la date est celle du
      // jour où elle coche, et elle repart si elle décoche — une date de vérification
      // qui survit à son propre décochage ne vaut rien dans un dossier.
      reference_checked_on: referenceVerifiee
        ? (dateVerifieeExistante ?? new Date().toISOString().slice(0, 10))
        : null,
      recommendation: reco || null,
      // Sixième maillon : le spécialiste à saisir si le sujet dépasse le périmètre.
      escalation: String(formData.get("escalation") ?? "") || null,
      escalation_note: String(formData.get("escalationNote") ?? "").trim() || null,
      nature: String(formData.get("nature")),
      // Le statut cessait d'être vrai : tous les constats restaient « ouvert ».
      status: complet ? "valide" : "ouvert",
      // Verrou : publication réservée aux constats complets, et retirée dès qu'un
      // constat publié redevient incomplet.
      visible_to_client: publier && complet,
    })
    .eq("id", constatId)
    .eq("mission_id", missionId);

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
  if (error) retour(missionId, ordre, { erreur: error.message });
  if (publier && !complet) {
    retour(missionId, ordre, {
      erreur: `Constat enregistré, mais NON publié : il manque ${manques.join(", ")}.`,
    });
  }
  retour(missionId, ordre, {
    ok: complet
      ? `Constat enregistré${publier ? " et publié au client" : ""}.`
      : `Constat enregistré. Il reste : ${manques.join(", ")}.`,
  });
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
  const { error } = await supabase.from("actions").insert(
    aCreer.map((c) => {
      /**
       * P1 est « immédiat » : l'échéance est le jour même, pas J+7. P4 est
       * « amélioration continue » : pas de date du tout — en inventer une créerait une
       * échéance que personne n'a décidée et qui déclencherait des relances.
       */
      const jours = DELAI_PAR_PRIORITE[c.priority];
      let echeance: string | null = null;
      if (jours !== null && jours !== undefined) {
        const d = new Date(aujourdhui);
        d.setDate(d.getDate() + jours);
        echeance = d.toISOString().slice(0, 10);
      }
      return {
        mission_id: missionId,
        finding_id: c.id,
        domain: c.domain,
        title: c.recommendation?.trim() || `Traiter : ${c.title}`,
        priority: c.priority,
        due_on: echeance,
        status: "a_faire" as const,
      };
    }),
  );

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
  retour(missionId, ordre, error
    ? { erreur: error.message }
    : { ok: `${aCreer.length} action${aCreer.length > 1 ? "s" : ""} générée${aCreer.length > 1 ? "s" : ""}.` });
};

/** Étape 1 — ce que dit le dirigeant : contexte, contrôle en cours, points sensibles. */
export const enregistrerCadrage = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  const missionId = String(formData.get("missionId"));

  const { error } = await supabase
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
  retour(missionId, "1", error ? { erreur: error.message } : { ok: "Cadrage enregistré." });
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

  const [{ error: erreurOrg }, { error: erreurMission }] = await Promise.all([
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
  const souci = erreurOrg ?? erreurMission;
  retour(missionId, "2", souci ? { erreur: souci.message } : { ok: "Périmètre enregistré." });
};

/**
 * Étape 12 — la mise en avant dans la synthèse dirigeant.
 *
 * Le rapport contient TOUS les constats : c'est un dossier complet, rien ne s'en exclut.
 * Ce rang ne décide donc pas d'une inclusion, seulement de ce qui ouvre la synthèse
 * (« les 5 constats prioritaires » du modèle 07). Le reste suit, classé par criticité.
 */
export const definirPlaceDansRapport = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const constatId = String(formData.get("constatId"));
  const rangBrut = String(formData.get("rang") ?? "").trim();
  const rang = rangBrut === "" ? null : Number(rangBrut);
  // Aucun plafond : le modèle 07 dessine cinq blocs de constats prioritaires comme il
  // dessine dix lignes de plan d'actions — c'est un gabarit de page, pas une règle.

  /**
   * Une place n'appartient qu'à un constat. L'échange se fait en base, dans
   * une seule transaction : écrit d'ici en trois requêtes, une coupure entre deux
   * laissait un rang perdu et l'écran annonçait quand même « rangs échangés ».
   */
  const { data, error } = await supabase.rpc("definir_rang_constat", {
    p_mission: missionId,
    p_constat: constatId,
    p_rang: rang,
  });

  revalidatePath(`${chemin(missionId)}/etapes/12`);
  revalidatePath(`${chemin(missionId)}/etapes/14`);
  retour(missionId, "12", error ? { erreur: error.message } : { ok: String(data) });
};

/** Étape 13 — planifier une action : qui la fait, pour quand, où elle en est. */
export const enregistrerAction = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const actionId = String(formData.get("actionId"));

  const { error } = await supabase
    .from("actions")
    .update({
      title: String(formData.get("title") ?? "").trim() || "Action",
      client_owner: String(formData.get("responsable") ?? "").trim() || null,
      due_on: String(formData.get("echeance") ?? "").trim() || null,
      priority: String(formData.get("priorite")),
      status: String(formData.get("statut")),
      comment: String(formData.get("commentaire") ?? "").trim() || null,
    })
    .eq("id", actionId)
    .eq("mission_id", missionId);

  revalidatePath(`${chemin(missionId)}/etapes/13`);
  retour(missionId, "13", error ? { erreur: error.message } : { ok: "Action mise à jour." });
};

/** Étape 13 — ajouter une action qui ne vient d'aucun constat (organisation, procédure). */
export const ajouterAction = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const titre = String(formData.get("title") ?? "").trim();
  if (!titre) retour(missionId, "13", { erreur: "Une action a besoin d'un intitulé." });

  const { error } = await supabase.from("actions").insert({
    mission_id: missionId,
    domain: String(formData.get("domaine") || "operationnel"),
    title: titre,
    client_owner: String(formData.get("responsable") ?? "").trim() || null,
    due_on: String(formData.get("echeance") ?? "").trim() || null,
    priority: String(formData.get("priorite") || "P3"),
    status: "a_faire",
  });

  revalidatePath(`${chemin(missionId)}/etapes/13`);
  retour(missionId, "13", error ? { erreur: error.message } : { ok: "Action ajoutée." });
};

/**
 * Étape 11 — écrire un constat qui ne vient d'aucun point de contrôle.
 *
 * Les 208 points couvrent ce qu'on sait chercher. Un audit sur site fait remonter
 * autre chose : une pratique, une organisation, un propos du dirigeant. Sans cette
 * porte, ce constat-là finit sur un carnet et ne rentre jamais dans le rapport.
 */
export const ajouterConstatLibre = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const ordre = String(formData.get("ordre") ?? "11");
  const titre = String(formData.get("title") ?? "").trim();
  if (!titre) retour(missionId, ordre, { erreur: "Un constat a besoin d'un intitulé." });

  const criticite = String(formData.get("severity") || "majeur");
  const { error } = await supabase.from("findings").insert({
    mission_id: missionId,
    control_point_id: null,
    module_id: null,
    domain: String(formData.get("domaine") || "operationnel"),
    title: titre,
    fact: "",
    evidence: null,
    risk: null,
    severity: criticite,
    control_status: null,
    reference: null,
    reference_checked: "a_verifier",
    recommendation: null,
    priority: PRIORITE_PAR_CRITICITE[criticite] ?? "P3",
    nature: String(formData.get("nature") || "risque_controle"),
    status: "ouvert",
    visible_to_client: false,
  });

  revalidatePath(`${chemin(missionId)}/etapes/${ordre}`);
  retour(
    missionId,
    ordre,
    error
      ? { erreur: error.message }
      : { ok: "Constat ajouté. Il est dans « à finir » : fait, preuve, référence, recommandation." },
  );
};

/**
 * Étape 11 — supprimer un constat.
 *
 * Un clic sur le mauvais point crée un constat définitif qui fausse ensuite tous les
 * compteurs des étapes 12, 13 et 14. On efface aussi l'action générée depuis lui :
 * la laisser en ferait une action orpheline dont plus personne ne sait d'où elle vient.
 * Le point de contrôle est délié automatiquement (clé étrangère à null).
 */
export const supprimerConstat = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const constatId = String(formData.get("constatId"));
  const ordre = String(formData.get("ordre") ?? "11");

  // Le constat et son action partent ensemble ou pas du tout : une action seule,
  // sans le constat qui l'a produite, est une ligne de plan dont plus personne ne
  // sait d'où elle vient.
  const { data, error } = await supabase.rpc("supprimer_constat", {
    p_mission: missionId,
    p_constat: constatId,
  });

  for (const etape of [ordre, "11", "12", "13", "14"]) {
    revalidatePath(`${chemin(missionId)}/etapes/${etape}`);
  }
  if (error) retour(missionId, ordre, { erreur: error.message });

  const bilan = (Array.isArray(data) ? data[0] : data) as
    | { titre: string; actions_supprimees: number; avait_ete_negocie: boolean }
    | undefined;
  const n = bilan?.actions_supprimees ?? 0;
  retour(missionId, ordre, {
    ok:
      `Constat « ${bilan?.titre ?? ""} » supprimé` +
      (n > 0 ? `, avec ${n} action${n > 1 ? "s" : ""} du plan` : "") +
      (bilan?.avait_ete_negocie ? " — dont une avec responsable ou échéance déjà fixés" : "") +
      ". Le point de contrôle redevient disponible.",
  });
};

/**
 * Étape 13 — remettre une action à la priorité de son constat.
 *
 * La criticité d'un constat peut changer après la génération du plan : l'action garde
 * alors une priorité qui ne correspond plus à rien. On réaligne la priorité seulement.
 * L'échéance, elle, a pu être négociée avec le dirigeant en restitution — la réécrire
 * effacerait un engagement pris.
 */
export const realignerAction = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const actionId = String(formData.get("actionId"));

  const { data: action } = await supabase
    .from("actions")
    .select("finding_id")
    .eq("id", actionId)
    .eq("mission_id", missionId)
    .maybeSingle();
  if (!action?.finding_id) retour(missionId, "13", { erreur: "Cette action ne vient d'aucun constat." });

  const { data: constat } = await supabase
    .from("findings")
    .select("priority")
    .eq("id", action?.finding_id as string)
    .maybeSingle();
  if (!constat) retour(missionId, "13", { erreur: "Constat introuvable." });

  const { error } = await supabase
    .from("actions")
    .update({ priority: constat?.priority })
    .eq("id", actionId)
    .eq("mission_id", missionId);

  revalidatePath(`${chemin(missionId)}/etapes/13`);
  retour(
    missionId,
    "13",
    error
      ? { erreur: error.message }
      : {
          ok: `Action repassée en ${constat?.priority} (${
            TRAITEMENT_PAR_PRIORITE[constat?.priority as string] ?? "à fixer"
          }). L'échéance n'a pas été touchée.`,
        },
  );
};

/**
 * Étape 01 — enregistrer une réponse du questionnaire d'entretien du dirigeant (06 §4).
 *
 * Le pack fait de cet entretien le pivot de la mission : ce qu'il répond sur la
 * vérification des titres, sur le document qui fait foi pour les heures ou sur la
 * sous-traitance de second rang oriente l'échantillon et les contrôles croisés. Le
 * questionnaire n'existait nulle part — il se menait de mémoire, hors de l'outil.
 */
export const enregistrerReponseEntretien = async (formData: FormData): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();

  const missionId = String(formData.get("missionId"));
  const code = String(formData.get("questionCode"));
  const { data: utilisateur } = await supabase.auth.getUser();

  const { error } = await supabase.from("mission_entretien_reponses").upsert(
    {
      mission_id: missionId,
      question_code: code,
      reponse: String(formData.get("reponse") ?? "").trim() || null,
      preuve: String(formData.get("preuve") ?? "").trim() || null,
      updated_at: new Date().toISOString(),
      updated_by: utilisateur.user?.id ?? null,
    },
    { onConflict: "mission_id,question_code" },
  );

  revalidatePath(`${chemin(missionId)}/etapes/1`);
  retour(missionId, "1", error ? { erreur: error.message } : { ok: "Réponse enregistrée." });
};
