"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { LIVRABLES } from "@/content/contrat";
import { OFFRES, chiffrer } from "@/content/offres";
import { aujourdHui, lireCabinet } from "@/lib/facturation/donnees";
import { calculerDevis, devisPropose, normaliserDevis, type Demande, type Devis } from "@/lib/facturation/devis";
import { completerDepuisAnnuaire, type EtatFormulaire } from "@/app/admin/missions/[id]/(outil)/contrat/actions";

const COMMERCIAL = "/admin/commercial";
const pageDevis = (id: string) => `${COMMERCIAL}/devis/${id}`;
const texte = (fd: FormData, cle: string) => String(fd.get(cle) ?? "").trim() || null;
const nombre = (fd: FormData, cle: string) => {
  const v = String(fd.get(cle) ?? "").replace(/\s/g, "").replace(",", ".");
  return v === "" ? null : Number(v);
};

/** Crée le devis d'un client, pré-rempli par la grille et, s'il y en a une, par la demande du site. */
const creerDevis = async (orgId: string, demande: Demande | null) => {
  const supabase = await createClient();
  const cabinet = await lireCabinet();
  const { data: org } = await supabase.from("organizations").select("headcount, client_sites, establishments").eq("id", orgId).single();
  const p = devisPropose(cabinet, org ?? { headcount: null, client_sites: null, establishments: null }, demande);
  const { data, error } = await supabase
    .from("devis")
    .insert({
      org_id: orgId,
      lead_id: demande?.id ?? null,
      cree_le: p.cree_le,
      valable_jusquau: p.valable_jusquau,
      prestation: p.prestation,
      intitule: p.intitule,
      description: p.description,
      base_ht: p.base_ht,
      effectif: p.effectif,
      sites: p.sites,
      urgence: p.urgence,
      jours_comp: p.jours_comp,
      frais_ht: p.frais_ht,
      ajustement_ht: 0,
      lignes: p.lignes,
      total_ht: p.total_ht,
      taux_tva: p.taux_tva,
      total_ttc: p.total_ttc,
      acompte_pct: p.acompte_pct,
      calendrier: p.calendrier,
      livrables: p.livrables,
      controle_organisme: null,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error("devis");
  return data.id as string;
};

/** La demande reçue du site devient un client et un devis, sans rien retaper. */
export const preparerDevisDepuisDemande = async (demandeId: string): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  const { data } = await supabase.from("leads").select("*").eq("id", demandeId).single();
  const demande = data as Demande;
  let orgId = demande.org_id;
  if (!orgId) {
    const { data: org } = await supabase
      .from("organizations")
      .insert({ name: demande.company || demande.full_name || demande.email, siren: demande.siren, headcount: demande.headcount, client_sites: demande.sites })
      .select("id")
      .single();
    orgId = org!.id as string;
    if (demande.siren) await completerDepuisAnnuaire(orgId);
    // Le contact de la demande devient le représentant, si l'annuaire n'en a pas donné.
    if (demande.full_name) await supabase.from("organizations").update({ representant: demande.full_name }).eq("id", orgId).is("representant", null);
  }
  const devisId = await creerDevis(orgId, demande);
  await supabase.from("leads").update({ statut: "devis", org_id: orgId, maj_le: new Date().toISOString() }).eq("id", demandeId);
  redirect(pageDevis(devisId));
};

/** Un client qui a appelé sans passer par le site : le devis part de son nom et de son SIREN. */
export const nouveauDevis = async (_e: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> => {
  await exigerRole("consultant");
  const nom = texte(fd, "client");
  const siren = (texte(fd, "siren") ?? "").replace(/\s/g, "") || null;
  if (!nom) return { ok: false, message: "Indique le nom du client." };
  if (siren && !/^\d{9}(\d{5})?$/.test(siren)) return { ok: false, message: "Le SIREN compte 9 chiffres (14 pour un SIRET)." };
  const supabase = await createClient();
  const { data: org } = await supabase.from("organizations").insert({ name: nom, siren: siren?.slice(0, 9) ?? null }).select("id").single();
  if (!org) return { ok: false, message: "Le client n’a pas pu être créé. Réessaie." };
  if (siren) await completerDepuisAnnuaire(org.id);
  const devisId = await creerDevis(org.id, null);
  redirect(pageDevis(devisId));
};

export const classerDemande = async (demandeId: string, statut: Demande["statut"]): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  await supabase.from("leads").update({ statut, maj_le: new Date().toISOString() }).eq("id", demandeId);
  revalidatePath(COMMERCIAL);
};

export const enregistrerDevis = async (devisId: string, _e: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  const { data: actuel } = await supabase.from("devis").select("statut").eq("id", devisId).single();
  if (actuel?.statut === "accepte") return { ok: false, message: "Ce devis est accepté : il ne se modifie plus. Le contrat se modifie depuis la mission." };
  const prestation = texte(fd, "prestation") ?? "audit_360";
  if (!OFFRES.some((o) => o.id === prestation)) return { ok: false, message: "Prestation inconnue." };
  const intitule = texte(fd, "intitule");
  if (!intitule) return { ok: false, message: "Indique l’intitulé de la prestation." };
  const base = nombre(fd, "base_ht");
  if (base === null || Number.isNaN(base) || base < 0) return { ok: false, message: "Indique le prix de base HT." };
  const valeurs = [nombre(fd, "effectif"), nombre(fd, "sites"), nombre(fd, "jours_comp"), nombre(fd, "frais_ht"), nombre(fd, "ajustement_ht"), nombre(fd, "acompte_pct")];
  if (valeurs.some((v) => v !== null && Number.isNaN(v))) return { ok: false, message: "Un des montants n’est pas un nombre." };
  const pct = nombre(fd, "acompte_pct") ?? 50;
  if (pct < 0 || pct > 100) return { ok: false, message: "L’acompte est un pourcentage entre 0 et 100." };
  const cabinet = await lireCabinet();
  const p = {
    prestation,
    intitule,
    base_ht: base,
    effectif: nombre(fd, "effectif"),
    sites: nombre(fd, "sites"),
    urgence: fd.get("urgence") === "on",
    jours_comp: nombre(fd, "jours_comp") ?? 0,
    frais_ht: nombre(fd, "frais_ht") ?? 0,
    ajustement_ht: nombre(fd, "ajustement_ht") ?? 0,
    ajustement_libelle: texte(fd, "ajustement_libelle"),
  };
  const autre = texte(fd, "livrable_autre");
  const { error } = await supabase
    .from("devis")
    .update({
      ...p,
      ...calculerDevis(p, cabinet.franchise_tva),
      description: texte(fd, "description"),
      acompte_pct: Math.round(pct),
      calendrier: texte(fd, "calendrier"),
      livrables: [...LIVRABLES.filter((l) => fd.getAll("livrables").includes(l)), ...(autre ? [autre] : [])],
      valable_jusquau: texte(fd, "valable_jusquau") ?? undefined,
      controle_organisme: texte(fd, "controle_organisme"),
      controle_echeance: texte(fd, "controle_echeance"),
      maj_le: new Date().toISOString(),
    })
    .eq("id", devisId);
  if (error) return { ok: false, message: "Le devis n’a pas pu être enregistré. Réessaie." };
  revalidatePath(pageDevis(devisId));
  revalidatePath(COMMERCIAL);
  return { ok: true, message: "Devis enregistré. Le PDF est à jour." };
};

export const changerStatutDevis = async (devisId: string, statut: "brouillon" | "envoye" | "refuse"): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  const { data } = await supabase
    .from("devis")
    .update({ statut, envoye_le: statut === "envoye" ? aujourdHui() : undefined, maj_le: new Date().toISOString() })
    .eq("id", devisId)
    .neq("statut", "accepte")
    .select("lead_id")
    .single();
  if (statut === "refuse" && data?.lead_id) await supabase.from("leads").update({ statut: "sans_suite" }).eq("id", data.lead_id);
  revalidatePath(pageDevis(devisId));
  revalidatePath(COMMERCIAL);
};

/** Référence de mission suivante de l'année : 2026-01, 2026-02… (même règle que « Nouvelle mission »). */
const referenceSuivante = async () => {
  const supabase = await createClient();
  const { data } = await supabase.from("missions").select("reference");
  const annee = Number(aujourdHui().slice(0, 4));
  const n = Math.max(0, ...((data ?? []) as { reference: string }[]).map((m) => Number(m.reference.match(new RegExp(`^${annee}-(\\d+)$`))?.[1] ?? 0)));
  return `${annee}-${String(n + 1).padStart(2, "0")}`;
};

/**
 * Le client a signé le devis : la mission est créée, son contrat pré-rempli avec tout ce que le
 * devis contient (prestation, prix, acompte, calendrier, livrables). Sofia arrive sur le contrat.
 */
export const accepterDevis = async (devisId: string): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  const { data } = await supabase.from("devis").select("*").eq("id", devisId).single();
  const d = normaliserDevis(data as Devis);
  if (d.mission_id) redirect(`/admin/missions/${d.mission_id}/contrat`);
  const cabinet = await lireCabinet();
  const organisme = d.controle_organisme || null;
  const { data: mission, error } = await supabase
    .from("missions")
    .insert({
      org_id: d.org_id,
      reference: await referenceSuivante(),
      type: d.prestation,
      control_in_progress: Boolean(organisme),
      control_body: organisme,
      control_deadline: organisme ? d.controle_echeance : null,
      amount_ht: d.total_ht,
    })
    .select("id")
    .single();
  if (error || !mission) throw new Error("La mission n’a pas pu être créée.");
  if (d.effectif) await supabase.from("organizations").update({ headcount: d.effectif }).eq("id", d.org_id).is("headcount", null);
  await supabase.from("contrats").insert({
    mission_id: mission.id,
    devis_id: d.id,
    prestation: d.prestation,
    intitule: d.intitule,
    description: d.description,
    montant_ht: Math.round((d.total_ht - d.frais_ht) * 100) / 100,
    frais_ht: d.frais_ht,
    acompte_pct: d.acompte_pct,
    calendrier: d.calendrier,
    livrables: d.livrables,
    lieu_signature: cabinet.ville,
    date_contrat: aujourdHui(),
  });
  await supabase.from("devis").update({ statut: "accepte", accepte_le: aujourdHui(), mission_id: mission.id }).eq("id", devisId);
  if (d.lead_id) await supabase.from("leads").update({ statut: "gagnee" }).eq("id", d.lead_id);
  revalidatePath(COMMERCIAL);
  revalidatePath("/admin");
  redirect(`/admin/missions/${mission.id}/contrat`);
};

/* ------------------------------------------------------------------ l'exemple */

/**
 * Un client d'exemple pour découvrir la chaîne sans client réel : une demande arrive comme si elle
 * venait du site. Tout ce qui en découle porte un numéro « EXEMPLE-… », hors des séries réelles.
 */
export const creerExemple = async (): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  await effacerDonneesExemple();
  const { data: org } = await supabase
    .from("organizations")
    .insert({
      name: "Exemple — Garde Sécurité Services",
      exemple: true,
      forme_juridique: "SARL",
      adresse: "12 RUE DE L’EXEMPLE",
      code_postal: "92100",
      ville: "BOULOGNE-BILLANCOURT",
      representant: "Jean EXEMPLE",
      representant_fonction: "Gérant",
      headcount: 38,
      client_sites: 4,
    })
    .select("id")
    .single();
  if (!org) throw new Error("L’exemple n’a pas pu être créé.");
  const offre = OFFRES.find((o) => o.id === "social_urssaf")!;
  await supabase.from("leads").insert({
    exemple: true,
    org_id: org.id,
    source: "contact",
    email: "contact@exemple.invalid",
    full_name: "Jean Exemple",
    company: "Exemple — Garde Sécurité Services",
    telephone: "01 00 00 00 00",
    headcount: 38,
    sites: 4,
    situation: "controle_annonce",
    offre: offre.id,
    urgence: false,
    estimation_ht: chiffrer({ baseHT: offre.baseHT ?? 0, effectif: 38, sites: 4, urgence: false }).totalHT,
    message: "Nous avons reçu un avis de contrôle URSSAF pour le mois prochain. Pouvez-vous nous aider à préparer les pièces et à vérifier notre sous-traitance ?",
  });
  revalidatePath(COMMERCIAL);
  revalidatePath("/admin");
};

/** Efface tout ce qui vient d'un client d'exemple : demande, devis, mission, contrat, factures, PDF. */
const effacerDonneesExemple = async () => {
  const supabase = await createClient();
  const { data: orgs } = await supabase.from("organizations").select("id").eq("exemple", true);
  const orgIds = ((orgs ?? []) as { id: string }[]).map((o) => o.id);
  if (orgIds.length) {
    const { data: missions } = await supabase.from("missions").select("id").in("org_id", orgIds);
    const missionIds = ((missions ?? []) as { id: string }[]).map((m) => m.id);
    if (missionIds.length) {
      const [{ data: f }, { data: c }] = await Promise.all([
        supabase.from("factures").select("archive_path").in("mission_id", missionIds),
        supabase.from("contrats").select("archive_path").in("mission_id", missionIds),
      ]);
      const chemins = [...(f ?? []), ...(c ?? [])].map((x) => (x as { archive_path: string | null }).archive_path).filter(Boolean) as string[];
      if (chemins.length) await supabase.storage.from("pieces").remove(chemins);
      // Les avoirs d'abord : ils pointent vers les factures qu'ils annulent.
      await supabase.from("factures").delete().in("mission_id", missionIds).eq("nature", "avoir");
      await supabase.from("factures").delete().in("mission_id", missionIds);
      await supabase.from("missions").delete().in("id", missionIds);
    }
    await supabase.from("devis").delete().in("org_id", orgIds);
  }
  await supabase.from("leads").delete().eq("exemple", true);
  if (orgIds.length) await supabase.from("organizations").delete().in("id", orgIds);
};

export const effacerExemple = async (): Promise<void> => {
  await exigerRole("consultant");
  await effacerDonneesExemple();
  revalidatePath(COMMERCIAL);
  revalidatePath("/admin");
};
