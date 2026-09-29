import { createClient } from "@/lib/supabase/server";

/**
 * Le résumé de l'entrée « Espace client » du menu d'une mission : accès actifs et messages
 * du client pas encore lus. Deux requêtes légères, avec les droits de la consultante.
 */
export const resumeEspaceClient = async (missionId: string, orgId: string): Promise<string> => {
  const supabase = await createClient();
  const [{ count: acces }, { data: nonLus }] = await Promise.all([
    supabase
      .from("profiles")
      .select("id", { count: "exact", head: true })
      .eq("org_id", orgId)
      .eq("role", "client")
      .is("acces_retire_le", null),
    supabase
      .from("mission_messages")
      .select("author_id, auteur:profiles!mission_messages_author_id_fkey (role)")
      .eq("mission_id", missionId)
      .is("read_at", null),
  ]);
  const messages = ((nonLus ?? []) as unknown as { auteur: { role: string } | null }[]).filter(
    (m) => m.auteur?.role === "client",
  ).length;
  if (messages) return `${messages} message${messages > 1 ? "s" : ""} non lu${messages > 1 ? "s" : ""}`;
  if (!acces) return "aucun accès ouvert";
  return `${acces} accès ouvert${acces > 1 ? "s" : ""}`;
};
