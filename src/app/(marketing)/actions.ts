"use server";

import { createClient } from "@/lib/supabase/server";
import type { EtatLead } from "@/lib/vitrine/lead";
import { OFFRES, chiffrer } from "@/content/offres";

const CHECKLISTS: Record<string, string> = {
  "checklist-cnaps": "CNAPS",
  "checklist-urssaf": "URSSAF",
  "checklist-inspection": "Inspection du travail",
  "checklist-fiscal": "DGFiP",
};
const SOURCES = new Set(["contact", "formation", "abonnement", ...Object.keys(CHECKLISTS)]);
const EMAIL = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

const texte = (formData: FormData, cle: string, max = 400) =>
  String(formData.get(cle) ?? "")
    .trim()
    .slice(0, max);

/**
 * Enregistre un lead (formulaire de contact, checklist, liste d'attente formation).
 * La table `leads` (migration 0001) n'a que quelques colonnes : les champs de contexte
 * (téléphone, sites, situation, offre) sont repliés dans `message`, lisibles tels quels.
 *
 * Le champ `site_web` est un pot de miel : rempli par un robot, jamais par un humain.
 * On répond alors comme si tout allait bien, sans rien écrire.
 */
export const envoyerLead = async (_etat: EtatLead, formData: FormData): Promise<EtatLead> => {
  const source = texte(formData, "source", 40);
  if (!SOURCES.has(source)) return { ok: false, message: null, erreur: "Formulaire inconnu." };

  const email = texte(formData, "email", 200).toLowerCase();
  if (!EMAIL.test(email)) return { ok: false, message: null, erreur: "Cette adresse email n’est pas valide." };

  const succes: EtatLead = {
    ok: true,
    erreur: null,
    message:
      source === "contact"
        ? "C’est noté. Vous recevez un accusé de réception, puis un appel sous 48 h ouvrées."
        : source in CHECKLISTS
          ? `C’est noté. La checklist ${CHECKLISTS[source]} vous sera envoyée par email.`
          : "C’est noté. Vous serez prévenu à l’ouverture.",
  };

  if (texte(formData, "site_web", 10)) return succes;

  const nom = texte(formData, "nom", 120) || null;
  const societe = texte(formData, "societe", 160) || null;
  const effectifBrut = Number.parseInt(texte(formData, "effectif", 6), 10);
  const effectif = Number.isFinite(effectifBrut) && effectifBrut > 0 ? effectifBrut : null;

  // Le contexte en colonnes : il alimente directement le devis dans l'outil (page Commercial).
  const telephone = texte(formData, "telephone", 40) || null;
  const sitesBrut = Number.parseInt(texte(formData, "sites", 6), 10);
  const sites = Number.isFinite(sitesBrut) && sitesBrut > 0 ? sitesBrut : null;
  const situation = texte(formData, "situation", 40) || null;
  const offre = OFFRES.find((o) => o.id === texte(formData, "offre", 40)) ?? null;
  // Urgence = contrôle sous 7 jours, cochée dans l'estimateur ; un contrôle annoncé ne l'est pas forcément.
  const urgence = texte(formData, "urgence", 4) === "1";
  const siren = texte(formData, "siren", 20).replace(/\s/g, "") || null;
  const estimation =
    offre?.baseHT != null && offre.id !== "suivi_conformite"
      ? chiffrer({ baseHT: offre.baseHT, effectif: effectif ?? 0, sites: sites ?? 0, urgence }).totalHT
      : null;
  const message = texte(formData, "message", 3000) || null;

  if (source === "contact" && !nom) return { ok: false, message: null, erreur: "Indiquez votre nom." };

  try {
    const supabase = await createClient();
    const { error } = await supabase.from("leads").insert({
      email,
      full_name: nom,
      company: societe,
      headcount: effectif,
      source,
      message,
      telephone,
      sites,
      situation,
      offre: offre?.id ?? null,
      urgence,
      siren: siren && /^\d{9}(\d{5})?$/.test(siren) ? siren.slice(0, 9) : null,
      estimation_ht: estimation,
    });
    if (error) throw error;
  } catch {
    return { ok: false, message: null, erreur: "L’envoi a échoué. Réessayez dans un instant, ou écrivez-nous directement." };
  }

  return succes;
};
