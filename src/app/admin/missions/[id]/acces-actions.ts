"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { exigerRole } from "@/lib/supabase/session";
import { clientAdmin, MESSAGE_CLE_ABSENTE } from "@/lib/supabase/admin";
import { genererLien, trouverCompte } from "@/lib/espace-client/acces";
import type { StatutMission } from "@/lib/types";

/**
 * Accès du client à son espace, depuis la mission.
 *
 * Aucun e-mail ne part : l'outil crée le compte (rôle client, société de la mission) et
 * produit un lien que la consultante transmet elle-même, par e-mail ou SMS. Le client y
 * choisit son mot de passe. Retirer un accès bloque le compte sans rien supprimer.
 */

export type ResultatAcces =
  | { ok: true; message: string; lien?: { url: string; email: string; nom: string | null; expireLe: string } }
  | { ok: false; erreur: string };

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const BAN_PERMANENT = "876000h"; // cent ans : le blocage « sans fin » de Supabase Auth

const origine = async (): Promise<string> => {
  const h = await headers();
  const hote = h.get("x-forwarded-host") ?? h.get("host");
  const proto = h.get("x-forwarded-proto") ?? (hote?.startsWith("localhost") ? "http" : "https");
  if (hote) return `${proto}://${hote}`;
  return (process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000").replace(/\/$/, "");
};

const rafraichir = (missionId: string) => revalidatePath(`/admin/missions/${missionId}/client`);

/** Société de la mission, lue avec les droits de la consultante. */
const orgDeLaMission = async (missionId: string): Promise<string | null> => {
  const supabase = await createClient();
  const { data } = await supabase.from("missions").select("org_id").eq("id", missionId).maybeSingle<{ org_id: string }>();
  return data?.org_id ?? null;
};

/** Un accès client de cette mission, ou une erreur lisible. */
const accesDeLaMission = async (missionId: string, utilisateurId: string) => {
  const admin = clientAdmin();
  if (!admin) return { erreur: MESSAGE_CLE_ABSENTE } as const;
  const org = await orgDeLaMission(missionId);
  const { data: profil } = await admin
    .from("profiles")
    .select("id, role, org_id, full_name, acces_retire_le")
    .eq("id", utilisateurId)
    .maybeSingle<{ id: string; role: string; org_id: string | null; full_name: string | null; acces_retire_le: string | null }>();
  if (!org || !profil || profil.role !== "client" || profil.org_id !== org) {
    return { erreur: "Cet accès n’appartient pas à la société de la mission. Rechargez la page." } as const;
  }
  const { data } = await admin.auth.admin.getUserById(utilisateurId);
  if (!data.user?.email) return { erreur: "Compte introuvable dans Supabase. Rechargez la page." } as const;
  return { admin, profil, email: data.user.email } as const;
};

export const inviterClient = async (_etat: ResultatAcces | null, formData: FormData): Promise<ResultatAcces> => {
  const session = await exigerRole("consultant");
  const missionId = String(formData.get("missionId") ?? "");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const nom = String(formData.get("nom") ?? "").trim().replace(/\s+/g, " ");

  if (!EMAIL.test(email)) return { ok: false, erreur: "Cette adresse e-mail n’est pas valide." };
  if (nom.length < 2) return { ok: false, erreur: "Indiquez le prénom et le nom de la personne : ils s’affichent dans son espace." };

  const admin = clientAdmin();
  if (!admin) return { ok: false, erreur: MESSAGE_CLE_ABSENTE };
  const org = await orgDeLaMission(missionId);
  if (!org) return { ok: false, erreur: "Mission introuvable. Rechargez la page." };

  let existant;
  try {
    existant = await trouverCompte(admin, email);
  } catch (e) {
    console.error("[acces] recherche du compte", { message: (e as Error).message });
    return { ok: false, erreur: "Supabase n’a pas répondu. Réessayez dans un instant." };
  }

  let message: string;
  if (existant) {
    const { data: profil } = await admin
      .from("profiles")
      .select("role, org_id, acces_retire_le")
      .eq("id", existant.id)
      .maybeSingle<{ role: string; org_id: string | null; acces_retire_le: string | null }>();
    if (!profil || profil.role !== "client") {
      return {
        ok: false,
        erreur:
          profil?.role === "consultant"
            ? "Cette adresse est celle d’un compte de l’équipe ANM Consulting. Un accès client doit utiliser une autre adresse."
            : "Cette adresse est déjà utilisée par un compte qui n’est pas un accès client. Utilisez une autre adresse.",
      };
    }
    if (profil.org_id !== org) {
      return {
        ok: false,
        erreur: profil.org_id
          ? "Cette adresse a déjà un accès client, rattaché à une autre société. Un compte ne peut suivre qu’une société : utilisez une autre adresse."
          : "Cette adresse a un compte sans société rattachée. Prévenez Merwan pour qu’il le rattache ou le supprime.",
      };
    }
    if (profil.acces_retire_le) {
      const { error: errProfil } = await admin.from("profiles").update({ acces_retire_le: null }).eq("id", existant.id);
      const { error: errBan } = await admin.auth.admin.updateUserById(existant.id, { ban_duration: "none" });
      if (errProfil || errBan) return { ok: false, erreur: "L’accès n’a pas pu être rétabli. Réessayez." };
      message = "Cette personne avait un accès retiré : il est rétabli. Voici un nouveau lien pour choisir son mot de passe.";
    } else {
      message = "Cette personne a déjà un accès. Voici un nouveau lien ; le précédent ne fonctionne plus.";
    }
  } else {
    // L'invitation porte le rôle, la société et le nom : le déclencheur handle_new_user les
    // lit à la création du compte. Une invitation restée sans suite pour cette adresse est remplacée.
    await admin.from("invitations").delete().eq("email", email).is("accepted_at", null);
    const { error: errInv } = await admin
      .from("invitations")
      .insert({ email, role: "client", org_id: org, full_name: nom, invited_by: session.utilisateurId });
    if (errInv) {
      console.error("[acces] invitation", { message: errInv.message });
      return { ok: false, erreur: "L’invitation n’a pas pu être enregistrée. Réessayez." };
    }
    const { data: cree, error: errCreation } = await admin.auth.admin.createUser({
      email,
      email_confirm: true,
      user_metadata: { full_name: nom },
    });
    if (errCreation || !cree.user) {
      console.error("[acces] création du compte", { message: errCreation?.message });
      await admin.from("invitations").delete().eq("email", email).is("accepted_at", null);
      return { ok: false, erreur: "Le compte n’a pas pu être créé. Réessayez dans un instant." };
    }
    // Contrôle : le profil doit être client et rattaché à la société de la mission.
    const { data: profil } = await admin
      .from("profiles")
      .select("role, org_id")
      .eq("id", cree.user.id)
      .maybeSingle<{ role: string; org_id: string | null }>();
    if (!profil || profil.role !== "client" || profil.org_id !== org) {
      await admin.from("profiles").upsert({ id: cree.user.id, role: "client", org_id: org, full_name: nom });
    }
    message = "Accès créé. Transmettez ce lien à la personne : elle y choisira son mot de passe.";
  }

  const lien = await genererLien(admin, email, await origine());
  rafraichir(missionId);
  if (!lien.ok) {
    return { ok: false, erreur: "L’accès est enregistré, mais le lien n’a pas pu être produit. Utilisez « Nouveau lien » dans la liste des accès." };
  }
  return { ok: true, message, lien: { url: lien.lien, email, nom, expireLe: lien.expireLe } };
};

export const regenererLien = async (missionId: string, utilisateurId: string): Promise<ResultatAcces> => {
  await exigerRole("consultant");
  const a = await accesDeLaMission(missionId, utilisateurId);
  if ("erreur" in a) return { ok: false, erreur: a.erreur ?? "Erreur inconnue." };
  if (a.profil.acces_retire_le) return { ok: false, erreur: "Cet accès est retiré. Rétablissez-le d’abord." };
  const lien = await genererLien(a.admin, a.email, await origine());
  if (!lien.ok) return lien;
  return {
    ok: true,
    message: "Nouveau lien créé ; le précédent ne fonctionne plus. Le mot de passe actuel reste valable tant que la personne n’en choisit pas un autre.",
    lien: { url: lien.lien, email: a.email, nom: a.profil.full_name, expireLe: lien.expireLe },
  };
};

export const retirerAcces = async (missionId: string, utilisateurId: string): Promise<ResultatAcces> => {
  await exigerRole("consultant");
  const a = await accesDeLaMission(missionId, utilisateurId);
  if ("erreur" in a) return { ok: false, erreur: a.erreur ?? "Erreur inconnue." };
  // Deux verrous : la RLS se ferme (current_role() et current_org() renvoient null) et
  // Supabase refuse toute nouvelle connexion ou tout renouvellement de session.
  const { error: errProfil } = await a.admin.from("profiles").update({ acces_retire_le: new Date().toISOString() }).eq("id", utilisateurId);
  if (errProfil) return { ok: false, erreur: "L’accès n’a pas pu être retiré. Réessayez." };
  const { error: errBan } = await a.admin.auth.admin.updateUserById(utilisateurId, { ban_duration: BAN_PERMANENT });
  if (errBan) console.error("[acces] blocage du compte", { message: errBan.message });
  rafraichir(missionId);
  return {
    ok: true,
    message: `Accès de ${a.profil.full_name ?? a.email} retiré. Ses dépôts et ses messages restent dans le dossier.`,
  };
};

export const retablirAcces = async (missionId: string, utilisateurId: string): Promise<ResultatAcces> => {
  await exigerRole("consultant");
  const a = await accesDeLaMission(missionId, utilisateurId);
  if ("erreur" in a) return { ok: false, erreur: a.erreur ?? "Erreur inconnue." };
  const { error: errProfil } = await a.admin.from("profiles").update({ acces_retire_le: null }).eq("id", utilisateurId);
  const { error: errBan } = await a.admin.auth.admin.updateUserById(utilisateurId, { ban_duration: "none" });
  if (errProfil || errBan) return { ok: false, erreur: "L’accès n’a pas pu être rétabli. Réessayez." };
  rafraichir(missionId);
  return { ok: true, message: `Accès de ${a.profil.full_name ?? a.email} rétabli, avec son mot de passe actuel.` };
};

const STATUTS: StatutMission[] = ["qualification", "documents_en_attente", "analyse", "sur_site", "rapport", "restitution", "clos"];

/** L'étape que le client voit dans son espace. Elle ne suit pas l'outil : Sofia la fait avancer. */
export const changerEtapeClient = async (missionId: string, statut: StatutMission): Promise<ResultatAcces> => {
  await exigerRole("consultant");
  if (!STATUTS.includes(statut)) return { ok: false, erreur: "Étape inconnue." };
  const supabase = await createClient();
  const { error } = await supabase.from("missions").update({ status: statut }).eq("id", missionId);
  if (error) return { ok: false, erreur: "L’étape n’a pas pu être enregistrée. Réessayez." };
  rafraichir(missionId);
  revalidatePath("/app", "layout");
  return { ok: true, message: "Étape mise à jour dans l’espace client." };
};
