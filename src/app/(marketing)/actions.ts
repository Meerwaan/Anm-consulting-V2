"use server";

import { createClient } from "@/lib/supabase/server";
import type { EtatLead } from "@/lib/vitrine/lead";

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

  const contexte: string[] = [];
  const telephone = texte(formData, "telephone", 40);
  const sites = texte(formData, "sites", 6);
  const situation = texte(formData, "situation", 40);
  const offre = texte(formData, "offre", 40);
  const urgence = texte(formData, "urgence", 4);
  if (telephone) contexte.push(`Téléphone : ${telephone}`);
  if (sites) contexte.push(`Sites : ${sites}`);
  if (situation) contexte.push(`Situation : ${situation}`);
  if (offre) contexte.push(`Offre : ${offre}`);
  if (urgence) contexte.push("Urgence : contrôle sous 7 jours");
  const corps = texte(formData, "message", 3000);
  const message = [corps, contexte.length ? contexte.join(" · ") : ""].filter(Boolean).join("\n\n") || null;

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
    });
    if (error) throw error;
  } catch {
    return { ok: false, message: null, erreur: "L’envoi a échoué. Réessayez dans un instant, ou écrivez-nous directement." };
  }

  return succes;
};
