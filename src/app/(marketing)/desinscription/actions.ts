"use server";

import { redirect } from "next/navigation";
import { desinscrire } from "@/lib/email/desinscription";

/** Confirme la désinscription (bouton de la page), puis affiche le résultat réel. */
export const confirmerDesinscription = async (formData: FormData) => {
  const jeton = String(formData.get("jeton") ?? "");
  const resultat = await desinscrire(jeton);
  redirect(`/desinscription?jeton=${encodeURIComponent(jeton)}&etat=${resultat}`);
};
