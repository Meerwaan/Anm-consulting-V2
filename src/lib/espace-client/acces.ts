import type { SupabaseClient, User } from "@supabase/supabase-js";
import { createClient } from "@/lib/supabase/server";
import { clientAdmin } from "@/lib/supabase/admin";

/**
 * Accès des clients à leur espace (/app) : lecture, recherche d'un compte, lien d'activation.
 * Serveur uniquement.
 */

/**
 * Durée de validité d'un lien de définition du mot de passe, en minutes.
 *
 * Elle ne se lit pas par l'API : c'est le réglage « Email OTP Expiration » du projet Supabase
 * (Authentication → Sign In / Providers → Email), 3 600 secondes par défaut, 86 400 au plus.
 * Si le réglage change dans Supabase, reporter la valeur dans SUPABASE_LIEN_VALIDITE_MINUTES.
 */
export const VALIDITE_LIEN_MINUTES = (() => {
  const n = Number(process.env.SUPABASE_LIEN_VALIDITE_MINUTES);
  return Number.isFinite(n) && n > 0 ? Math.round(n) : 60;
})();

export const dureeLisible = (minutes: number): string => {
  if (minutes % 1440 === 0) return minutes === 1440 ? "24 heures" : `${minutes / 1440} jours`;
  if (minutes % 60 === 0) return minutes === 60 ? "1 heure" : `${minutes / 60} heures`;
  return `${minutes} minutes`;
};

export interface AccesClient {
  id: string;
  nom: string | null;
  email: string | null;
  retireLe: string | null;
  creeLe: string;
  /** Dernière connexion ; null tant que le client n'a jamais choisi son mot de passe. */
  derniereConnexion: string | null;
}

export interface EtatAcces {
  cleDisponible: boolean;
  orgId: string | null;
  orgNom: string | null;
  acces: AccesClient[];
}

/** Les accès rattachés à la société de la mission. Les e-mails viennent de l'API admin. */
export const lireAccesMission = async (missionId: string): Promise<EtatAcces> => {
  const supabase = await createClient();
  const { data: mission } = await supabase
    .from("missions")
    .select("org_id, organisation:organizations (name)")
    .eq("id", missionId)
    .maybeSingle<{ org_id: string; organisation: { name: string } | null }>();
  const admin = clientAdmin();
  if (!mission) return { cleDisponible: Boolean(admin), orgId: null, orgNom: null, acces: [] };

  const { data: profils } = await supabase
    .from("profiles")
    .select("id, full_name, acces_retire_le, created_at")
    .eq("org_id", mission.org_id)
    .eq("role", "client")
    .order("created_at", { ascending: true });

  const lignes = (profils ?? []) as { id: string; full_name: string | null; acces_retire_le: string | null; created_at: string }[];
  const comptes = admin
    ? await Promise.all(lignes.map(async (p) => (await admin.auth.admin.getUserById(p.id)).data.user ?? null))
    : lignes.map(() => null);

  return {
    cleDisponible: Boolean(admin),
    orgId: mission.org_id,
    orgNom: mission.organisation?.name ?? null,
    acces: lignes.map((p, i) => ({
      id: p.id,
      nom: p.full_name,
      email: comptes[i]?.email ?? null,
      retireLe: p.acces_retire_le,
      creeLe: p.created_at,
      derniereConnexion: comptes[i]?.last_sign_in_at ?? null,
    })),
  };
};

/** Compte existant pour une adresse. L'API admin ne cherche pas par e-mail : on parcourt les pages. */
export const trouverCompte = async (admin: SupabaseClient, email: string): Promise<User | null> => {
  for (let page = 1; page < 50; page += 1) {
    const { data, error } = await admin.auth.admin.listUsers({ page, perPage: 200 });
    if (error) throw error;
    const u = data.users.find((x) => x.email?.toLowerCase() === email);
    if (u) return u;
    if (data.users.length < 200) return null;
  }
  return null;
};

/**
 * Lien de définition du mot de passe.
 *
 * On ne donne pas le lien Supabase tel quel : il consomme le jeton dès la première ouverture,
 * et les aperçus de liens (iMessage, WhatsApp, antivirus de messagerie) l'ouvrent avant le
 * client. Le lien mène à /activer, une page qui ne vérifie le jeton qu'à l'envoi du formulaire.
 * Chaque nouveau lien annule le précédent.
 */
export const genererLien = async (
  admin: SupabaseClient,
  email: string,
  origine: string,
): Promise<{ ok: true; lien: string; expireLe: string } | { ok: false; erreur: string }> => {
  const { data, error } = await admin.auth.admin.generateLink({ type: "recovery", email });
  if (error || !data?.properties?.hashed_token) {
    console.error("[acces] generateLink", { message: error?.message, status: error?.status });
    return { ok: false, erreur: "Supabase n’a pas produit le lien. Réessayez dans une minute." };
  }
  const lien = `${origine}/activer?jeton=${encodeURIComponent(data.properties.hashed_token)}`;
  const expireLe = new Date(Date.now() + VALIDITE_LIEN_MINUTES * 60_000).toISOString();
  return { ok: true, lien, expireLe };
};
