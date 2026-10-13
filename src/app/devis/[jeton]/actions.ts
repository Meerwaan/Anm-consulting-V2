"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import { envoyerEmail } from "@/lib/email/envoi";
import { confirmationAccordDevis, notificationAccordDevis } from "@/lib/email/messages";
import { JETON, lireDevisPublic } from "@/lib/facturation/devis-public";
import { nomPdfDevis, produirePdfDevis } from "@/lib/facturation/pdf-devis";

export interface EtatAccord {
  ok: boolean;
  erreur: string | null;
  /** L'adresse à laquelle la confirmation est réellement partie (null : aucun email n'est parti). */
  confirmationA: string | null;
}

const echec = (erreur: string): EtatAccord => ({ ok: false, erreur, confirmationA: null });

/**
 * Le « Bon pour accord » du client, donné depuis son lien. La base vérifie tout (devis encore
 * proposé, validité, version affichée) et enregistre qui, quand, d'où. ANM est prévenue par email et
 * le client reçoit le devis portant la mention de son accord ; l'accord, lui, ne dépend d'aucun email.
 */
export const donnerAccord = async (jeton: string, _e: EtatAccord, fd: FormData): Promise<EtatAccord> => {
  if (!JETON.test(jeton)) return echec("Ce lien n’ouvre aucun devis.");
  const nom = String(fd.get("nom") ?? "").trim().replace(/\s+/g, " ");
  const fonction = String(fd.get("fonction") ?? "").trim().replace(/\s+/g, " ");
  if (nom.length < 3 || nom.length > 120) return echec("Indiquez votre prénom et votre nom.");
  if (!fonction || fonction.length > 120) return echec("Indiquez en quelle qualité vous engagez la société : gérant, président, directeur…");
  if (fd.get("accord") !== "on") return echec("Cochez la case pour confirmer que vous acceptez ce devis.");

  const h = await headers();
  const ip = (h.get("x-forwarded-for") ?? "").split(",")[0].trim() || h.get("x-real-ip") || "";
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("devis_donner_accord", {
    p_jeton: jeton,
    p_version: String(fd.get("version") ?? "") || null,
    p_nom: nom,
    p_fonction: fonction,
    p_ip: ip,
    p_agent: h.get("user-agent") ?? "",
  });
  const r = (error ? null : data) as { code: string; id?: string; destinataire_email?: string | null } | null;
  const page = `/devis/${jeton}`;

  switch (r?.code) {
    case "ok":
      break;
    case "deja":
      revalidatePath(page);
      return { ok: true, erreur: null, confirmationA: null };
    case "modifie":
      revalidatePath(page);
      return echec("Ce devis vient d’être mis à jour par ANM Consulting. Relisez-le ci-dessus, puis donnez votre accord.");
    case "expire":
      revalidatePath(page);
      return echec("La validité de ce devis est dépassée : il ne peut plus être accepté en ligne. Écrivez-nous pour le renouveler.");
    case "retire":
      revalidatePath(page);
      return echec("Ce devis n’est plus proposé. Écrivez-nous si vous souhaitez le reprendre.");
    case "nom":
      return echec("Indiquez votre prénom et votre nom.");
    default:
      if (error) console.error("[devis] accord", error.message);
      return echec("Votre accord n’a pas pu être enregistré. Réessayez dans un instant, ou répondez à l’email qui vous a transmis ce devis.");
  }

  // L'accord est enregistré. Les emails suivent ; aucun de leurs échecs ne le remet en cause.
  let confirmationA: string | null = null;
  const d = await lireDevisPublic(jeton);
  if (d && d !== "retire" && d.devis.accord_le && r.id) {
    const commun = {
      numero: d.devis.numero,
      client: d.client.name,
      intitule: d.devis.intitule,
      totalHT: d.devis.total_ht,
      totalTTC: d.devis.total_ttc,
      franchise: d.devis.taux_tva === 0,
      mensuel: d.devis.prestation === "suivi_conformite",
      acomptePct: d.devis.acompte_pct,
      exemple: d.client.exemple,
      accord: { nom, fonction, le: d.devis.accord_le },
    };
    const emailClient = r.destinataire_email ?? null;
    const confirmer = async (): Promise<boolean> => {
      if (!emailClient) return false;
      try {
        const pdf = await produirePdfDevis(d.devis, d.cabinet, d.client);
        const envoi = await envoyerEmail(
          confirmationAccordDevis({ ...commun, email: emailClient, pdf: { filename: nomPdfDevis(d.devis.numero, d.client.name), content: pdf } }),
          `confirmation accord devis ${d.devis.numero}`,
        );
        return envoi.ok;
      } catch (e) {
        console.error("[devis] PDF de confirmation", (e as Error).stack);
        return false;
      }
    };
    const [, confirme] = await Promise.all([
      envoyerEmail(notificationAccordDevis({ ...commun, id: r.id, emailClient }), `notification accord devis ${d.devis.numero}`),
      confirmer(),
    ]);
    if (confirme) confirmationA = emailClient;
  }
  revalidatePath(page);
  return { ok: true, erreur: null, confirmationA };
};
