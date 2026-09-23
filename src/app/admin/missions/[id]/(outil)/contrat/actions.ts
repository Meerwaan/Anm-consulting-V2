"use server";

import { revalidatePath } from "next/cache";
import { renderToBuffer } from "@react-pdf/renderer";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { lireAnnuaire } from "@/lib/facturation/annuaire";
import { DocumentContrat } from "@/lib/facturation/DocumentContrat";
import { DocumentFacture } from "@/lib/facturation/DocumentFacture";
import { contratPropose, facturesPossibles, lireFacturation, manquesFacture, normaliserFacture, aujourdHui, preparerAvoir, preparerFacture, type Facture, type NatureFacture } from "@/lib/facturation/donnees";
import { LIVRABLES } from "@/content/contrat";

export interface EtatFormulaire {
  ok: boolean;
  message: string | null;
}

const chemin = (missionId: string) => `/admin/missions/${missionId}/contrat`;
const texte = (fd: FormData, cle: string) => String(fd.get(cle) ?? "").trim() || null;
const montant = (fd: FormData, cle: string) => {
  const v = String(fd.get(cle) ?? "").replace(/\s/g, "").replace(",", ".");
  return v === "" ? null : Number(v);
};

/**
 * Complète la fiche du client depuis l'annuaire des entreprises, sans écraser ce que Sofia a saisi
 * (sauf demande expresse : `remplacer`). Appelée aussi à la première ouverture de la page.
 */
export const completerDepuisAnnuaire = async (
  orgId: string,
  remplacer = false,
): Promise<EtatFormulaire & { fiche?: Partial<Record<"forme_juridique" | "adresse" | "code_postal" | "ville" | "representant" | "representant_fonction" | "annuaire_le", string | null>> }> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  const { data: org } = await supabase
    .from("organizations")
    .select("siren, forme_juridique, adresse, code_postal, ville, representant, representant_fonction")
    .eq("id", orgId)
    .maybeSingle();
  if (!org?.siren) return { ok: false, message: "Renseigne d’abord le SIREN du client." };
  const fiche = await lireAnnuaire(org.siren);
  if (!fiche) return { ok: false, message: "Ce SIREN est introuvable dans l’annuaire des entreprises, ou l’annuaire ne répond pas. Vérifie le numéro, ou saisis les informations à la main." };
  const garder = (actuel: string | null, nouveau: string | null) => (remplacer ? (nouveau ?? actuel) : (actuel ?? nouveau));
  const maj = {
    forme_juridique: garder(org.forme_juridique, fiche.formeJuridique),
    adresse: garder(org.adresse, fiche.adresse),
    code_postal: garder(org.code_postal, fiche.codePostal),
    ville: garder(org.ville, fiche.ville),
    representant: garder(org.representant, fiche.representant),
    representant_fonction: garder(org.representant_fonction, fiche.representantFonction),
    annuaire_le: new Date().toISOString(),
  };
  await supabase.from("organizations").update(maj).eq("id", orgId);
  return {
    fiche: maj,
    ok: true,
    message: fiche.fermee
      ? `Attention : l’annuaire indique que ${fiche.raisonSociale} est fermée. Vérifie le SIREN avec le client.`
      : `Complété depuis l’annuaire des entreprises : ${fiche.raisonSociale}.`,
  };
};

export const actionAnnuaire = async (missionId: string, orgId: string, _e: EtatFormulaire, _fd: FormData): Promise<EtatFormulaire> => {
  const r = await completerDepuisAnnuaire(orgId, true);
  revalidatePath(chemin(missionId));
  return r;
};

export const enregistrerClient = async (missionId: string, orgId: string, _e: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> => {
  await exigerRole("consultant");
  const siren = (texte(fd, "siren") ?? "").replace(/\s/g, "") || null;
  if (siren && !/^\d{9}(\d{5})?$/.test(siren)) return { ok: false, message: "Le SIREN compte 9 chiffres (14 pour un SIRET)." };
  const supabase = await createClient();
  const { error } = await supabase
    .from("organizations")
    .update({
      name: texte(fd, "name") ?? undefined,
      siren,
      forme_juridique: texte(fd, "forme_juridique"),
      adresse: texte(fd, "adresse"),
      code_postal: texte(fd, "code_postal"),
      ville: texte(fd, "ville"),
      representant: texte(fd, "representant"),
      representant_fonction: texte(fd, "representant_fonction"),
      headcount: montant(fd, "headcount"),
    })
    .eq("id", orgId);
  if (error) return { ok: false, message: "La fiche du client n’a pas pu être enregistrée. Réessaie." };
  revalidatePath(chemin(missionId));
  return { ok: true, message: "Fiche du client enregistrée." };
};

export const enregistrerContrat = async (missionId: string, _e: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> => {
  await exigerRole("consultant");
  const d = await lireFacturation(missionId);
  if (!d) return { ok: false, message: "Mission introuvable." };
  if (d.contrat?.signe_le) return { ok: false, message: "Le contrat est signé : rouvre-le avant de le modifier." };
  const ht = montant(fd, "montant_ht");
  const frais = montant(fd, "frais_ht") ?? 0;
  const pct = montant(fd, "acompte_pct") ?? d.cabinet.acompte_pct;
  if (ht !== null && (Number.isNaN(ht) || ht < 0)) return { ok: false, message: "Le prix HT doit être un montant positif." };
  if (Number.isNaN(frais) || frais < 0) return { ok: false, message: "Les frais doivent être un montant positif." };
  if (Number.isNaN(pct) || pct < 0 || pct > 100) return { ok: false, message: "L’acompte est un pourcentage entre 0 et 100." };
  const intitule = texte(fd, "intitule");
  if (!intitule) return { ok: false, message: "Indique l’intitulé de la prestation." };
  const autre = texte(fd, "livrable_autre");
  const livrables = [...LIVRABLES.filter((l) => fd.getAll("livrables").includes(l)), ...(autre ? [autre] : [])];

  const ligne = {
    mission_id: missionId,
    prestation: d.contrat?.prestation ?? contratPropose(d).prestation,
    intitule,
    description: texte(fd, "description"),
    montant_ht: ht,
    frais_ht: frais,
    acompte_pct: Math.round(pct),
    calendrier: texte(fd, "calendrier"),
    livrables,
    lieu_signature: texte(fd, "lieu_signature"),
    date_contrat: texte(fd, "date_contrat") ?? aujourdHui(),
    maj_le: new Date().toISOString(),
  };
  const supabase = await createClient();
  const { error } = await supabase.from("contrats").upsert(ligne, { onConflict: "mission_id" });
  if (error) return { ok: false, message: "Le contrat n’a pas pu être enregistré. Réessaie." };
  // Le montant de la fiche mission suit le contrat.
  await supabase.from("missions").update({ amount_ht: ht === null ? null : ht + frais }).eq("id", missionId);
  revalidatePath(chemin(missionId));
  return { ok: true, message: "Contrat enregistré. Le PDF est à jour." };
};

/** Le contrat signé est figé et son PDF archivé dans le dossier de la mission. */
export const signerContrat = async (missionId: string, _e: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> => {
  await exigerRole("consultant");
  const d = await lireFacturation(missionId);
  if (!d?.contrat) return { ok: false, message: "Enregistre d’abord le contrat." };
  const date = texte(fd, "signe_le") ?? aujourdHui();
  const supabase = await createClient();
  const pdf = await renderToBuffer(DocumentContrat({ cabinet: d.cabinet, client: d.mission.organisation, mission: d.mission, contrat: d.contrat }));
  const archive = `${missionId}/contrats/contrat-${d.mission.reference}-${Date.now()}.pdf`;
  const { error: e1 } = await supabase.storage.from("pieces").upload(archive, new Uint8Array(pdf), { contentType: "application/pdf", upsert: false });
  if (e1) return { ok: false, message: "Le PDF du contrat n’a pas pu être archivé. Réessaie." };
  await supabase.from("contrats").update({ signe_le: date, archive_path: archive }).eq("mission_id", missionId);
  revalidatePath(chemin(missionId));
  return { ok: true, message: "Contrat marqué comme signé. Sa version est archivée dans la mission." };
};

export const rouvrirContrat = async (missionId: string): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  await supabase.from("contrats").update({ signe_le: null }).eq("mission_id", missionId);
  revalidatePath(chemin(missionId));
};

const archiverFacture = async (f: Facture, iban: string | null, bic: string | null, delai: number, origine: { numero: string; emise_le: string } | null) => {
  const supabase = await createClient();
  const pdf = await renderToBuffer(DocumentFacture({ facture: f, origine, iban, bic, delaiJours: delai }));
  const archive = `${f.mission_id}/factures/${f.numero}.pdf`;
  const { error } = await supabase.storage.from("pieces").upload(archive, new Uint8Array(pdf), { contentType: "application/pdf", upsert: true });
  if (!error) await supabase.from("factures").update({ archive_path: archive }).eq("id", f.id);
};

export const emettreFacture = async (missionId: string, nature: Exclude<NatureFacture, "avoir">): Promise<EtatFormulaire> => {
  await exigerRole("consultant");
  const d = await lireFacturation(missionId);
  if (!d) return { ok: false, message: "Mission introuvable." };
  const manques = manquesFacture(d);
  if (manques.length) return { ok: false, message: `Avant d’émettre une facture, il manque : ${manques.join(", ")}.` };
  if (!facturesPossibles(d).includes(nature)) return { ok: false, message: "Cette facture a déjà été émise." };
  const supabase = await createClient();
  const { data, error } = await supabase.from("factures").insert(preparerFacture(d, nature)).select("*").single();
  if (error || !data) return { ok: false, message: "La facture n’a pas pu être émise. Réessaie." };
  await archiverFacture(normaliserFacture(data as Facture), d.cabinet.iban, d.cabinet.bic, d.cabinet.delai_paiement_jours, null);
  revalidatePath(chemin(missionId));
  revalidatePath("/admin/factures");
  return { ok: true, message: `Facture ${data.numero} émise.` };
};

export const emettreAvoir = async (missionId: string, factureId: string): Promise<EtatFormulaire> => {
  await exigerRole("consultant");
  const d = await lireFacturation(missionId);
  const f = d?.factures.find((x) => x.id === factureId);
  if (!d || !f || f.nature === "avoir") return { ok: false, message: "Facture introuvable." };
  if (d.factures.some((a) => a.nature === "avoir" && a.facture_origine === f.id)) return { ok: false, message: "Cette facture est déjà annulée par un avoir." };
  if (f.nature === "acompte" && d.factures.some((x) => x.nature === "solde" && x.acomptes.some((a) => a.numero === f.numero) && !d.factures.some((a) => a.facture_origine === x.id))) {
    return { ok: false, message: "Cet acompte est déduit de la facture de solde : annule d’abord le solde." };
  }
  const supabase = await createClient();
  const { data, error } = await supabase.from("factures").insert(preparerAvoir(f)).select("*").single();
  if (error || !data) return { ok: false, message: "L’avoir n’a pas pu être émis. Réessaie." };
  await archiverFacture(normaliserFacture(data as Facture), null, null, d.cabinet.delai_paiement_jours, { numero: f.numero, emise_le: f.emise_le });
  revalidatePath(chemin(missionId));
  revalidatePath("/admin/factures");
  return { ok: true, message: `Avoir ${data.numero} émis : la facture ${f.numero} est annulée.` };
};

/** Paiement reçu (ou annulé) : la fiche mission suit (acompte reçu, solde reçu). */
export const marquerPayee = async (missionId: string, factureId: string, payee: boolean): Promise<void> => {
  await exigerRole("consultant");
  const supabase = await createClient();
  const { data: f } = await supabase
    .from("factures")
    .update({ payee_le: payee ? aujourdHui() : null })
    .eq("id", factureId)
    .select("nature")
    .single();
  if (f?.nature === "acompte") await supabase.from("missions").update({ deposit_received: payee }).eq("id", missionId);
  if (f?.nature === "solde" || f?.nature === "totale") {
    await supabase.from("missions").update({ balance_received: payee, ...(f.nature === "totale" ? { deposit_received: payee } : {}) }).eq("id", missionId);
  }
  revalidatePath(chemin(missionId));
  revalidatePath("/admin/factures");
};
