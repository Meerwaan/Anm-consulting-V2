import { createClient } from "@/lib/supabase/server";
import { urlSite } from "@/lib/email/messages";
import type { DevisDocument } from "./devis";
import { aujourdHui } from "./donnees";
import type { CabinetDevis, ClientDevis } from "./pdf-devis";

/**
 * Le devis vu par le client, depuis son lien /devis/<jeton>. Il n'a pas de compte : la lecture et
 * l'accord passent par deux fonctions de la base (migration 0047), qui ne répondent qu'au jeton.
 * Serveur uniquement.
 */

export const JETON = /^[0-9a-f]{64}$/;

export const urlDevisPublic = (jeton: string) => urlSite(`/devis/${jeton}`);

export interface DevisPublic {
  /** ouvert : l'accord est attendu ; accepte : il est donné ; expire : validité dépassée sans accord. */
  etat: "ouvert" | "accepte" | "expire";
  /** La version affichée : l'accord ne vaut que pour elle. */
  version: string;
  devis: DevisDocument & { destinataire_nom: string | null };
  client: ClientDevis & { forme_juridique: string | null; exemple: boolean };
  cabinet: CabinetDevis;
}

type Reponse = { etat: "retire" } | (Omit<DevisPublic, "etat"> & { etat: "ouvert" | "accepte" });

/** null : aucun devis derrière ce lien ; "retire" : le devis n'est pas, ou plus, proposé au client. */
export const lireDevisPublic = async (jeton: string): Promise<DevisPublic | "retire" | null> => {
  if (!JETON.test(jeton)) return null;
  const supabase = await createClient();
  const { data, error } = await supabase.rpc("devis_public", { p_jeton: jeton });
  if (error || !data) return null;
  const r = data as Reponse;
  if (r.etat === "retire") return "retire";
  const devis = {
    ...r.devis,
    total_ht: Number(r.devis.total_ht),
    taux_tva: Number(r.devis.taux_tva),
    total_ttc: Number(r.devis.total_ttc),
    accord_total_ttc: r.devis.accord_total_ttc == null ? null : Number(r.devis.accord_total_ttc),
  };
  return {
    etat: r.etat === "ouvert" && devis.valable_jusquau < aujourdHui() ? "expire" : r.etat,
    version: r.version,
    devis,
    client: r.client,
    cabinet: { ...r.cabinet, capital: r.cabinet.capital == null ? null : Number(r.cabinet.capital) },
  };
};
