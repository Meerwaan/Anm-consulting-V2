"use server";

import { revalidatePath } from "next/cache";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import type { EtatFormulaire } from "@/app/admin/missions/[id]/(outil)/contrat/actions";

const texte = (fd: FormData, cle: string) => String(fd.get(cle) ?? "").trim() || null;

/** Les informations d'ANM Consulting, reprises sur chaque contrat et chaque facture. */
export const enregistrerCabinet = async (_e: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> => {
  await exigerRole("consultant");
  const siren = (texte(fd, "siren") ?? "").replace(/\s/g, "") || null;
  if (siren && !/^\d{9}$/.test(siren)) return { ok: false, message: "Le SIREN compte 9 chiffres." };
  const capital = Number((texte(fd, "capital") ?? "").replace(/\s/g, "").replace(",", ".")) || null;
  const delai = Number(texte(fd, "delai_paiement_jours") ?? 30);
  const acompte = Number(texte(fd, "acompte_pct") ?? 50);
  if (!(delai >= 0 && delai <= 60)) return { ok: false, message: "Le délai de paiement entre professionnels est de 60 jours au plus." };
  if (!(acompte >= 0 && acompte <= 100)) return { ok: false, message: "L’acompte est un pourcentage entre 0 et 100." };
  const iban = (texte(fd, "iban") ?? "").replace(/\s/g, "").toUpperCase() || null;
  const supabase = await createClient();
  const { error } = await supabase
    .from("cabinet")
    .update({
      raison_sociale: texte(fd, "raison_sociale") ?? "ANM Consulting",
      forme_juridique: texte(fd, "forme_juridique") ?? "EURL",
      capital,
      adresse: texte(fd, "adresse"),
      code_postal: texte(fd, "code_postal"),
      ville: texte(fd, "ville"),
      siren,
      rcs_ville: texte(fd, "rcs_ville"),
      franchise_tva: fd.get("franchise_tva") === "oui",
      representant: texte(fd, "representant"),
      fonction: texte(fd, "fonction"),
      email: texte(fd, "email"),
      telephone: texte(fd, "telephone"),
      iban: iban ? iban.replace(/(.{4})/g, "$1 ").trim() : null,
      bic: texte(fd, "bic")?.toUpperCase() ?? null,
      delai_paiement_jours: Math.round(delai),
      acompte_pct: Math.round(acompte),
      updated_at: new Date().toISOString(),
    })
    .eq("id", true);
  if (error) return { ok: false, message: "Les informations n’ont pas pu être enregistrées. Réessaie." };
  revalidatePath("/admin/cabinet");
  return { ok: true, message: "Enregistré. Les prochains contrats et factures reprennent ces informations." };
};
