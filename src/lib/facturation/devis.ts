import { createClient } from "@/lib/supabase/server";
import { OFFRES } from "@/content/offres";
import { calculerDevis, type ParametresDevis } from "./calcul-devis";
import { LIVRABLES_PAR_PRESTATION } from "@/content/contrat";
import { SITUATIONS_CONTACT } from "@/content/vitrine";
import { aujourdHui, lireCabinet, normaliserFacture, type Cabinet, type ClientFiche, type Facture, type LigneFacture } from "./donnees";

/**
 * Le suivi commercial : la demande reçue du site, le devis, puis la mission et son contrat.
 * Chaque étape part de la précédente : la demande donne le client et le forfait, le devis
 * reprend la grille tarifaire, le devis accepté donne la mission et le contrat.
 */

export interface Demande {
  id: string;
  created_at: string;
  email: string;
  full_name: string | null;
  company: string | null;
  headcount: number | null;
  source: string | null;
  message: string | null;
  telephone: string | null;
  sites: number | null;
  situation: string | null;
  offre: string | null;
  urgence: boolean;
  estimation_ht: number | null;
  siren: string | null;
  statut: "nouvelle" | "en_cours" | "devis" | "gagnee" | "sans_suite";
  org_id: string | null;
  exemple: boolean;
}

export interface Devis {
  id: string;
  numero: string;
  org_id: string;
  lead_id: string | null;
  mission_id: string | null;
  cree_le: string;
  valable_jusquau: string;
  statut: "brouillon" | "envoye" | "accepte" | "refuse";
  envoye_le: string | null;
  accepte_le: string | null;
  prestation: string;
  intitule: string;
  description: string | null;
  base_ht: number;
  effectif: number | null;
  sites: number | null;
  urgence: boolean;
  jours_comp: number;
  frais_ht: number;
  ajustement_ht: number;
  ajustement_libelle: string | null;
  lignes: LigneFacture[];
  total_ht: number;
  taux_tva: number;
  total_ttc: number;
  acompte_pct: number;
  calendrier: string | null;
  livrables: string[];
  controle_organisme: string | null;
  controle_echeance: string | null;
}

export const LIBELLE_SITUATION = Object.fromEntries(SITUATIONS_CONTACT.map((s) => [s.valeur, s.label])) as Record<string, string>;

export const LIBELLE_STATUT_DEVIS: Record<Devis["statut"], string> = {
  brouillon: "Brouillon",
  envoye: "Envoyé, en attente",
  accepte: "Accepté",
  refuse: "Refusé",
};

export const normaliserDevis = (d: Devis): Devis => ({
  ...d,
  base_ht: Number(d.base_ht),
  jours_comp: Number(d.jours_comp),
  frais_ht: Number(d.frais_ht),
  ajustement_ht: Number(d.ajustement_ht),
  total_ht: Number(d.total_ht),
  taux_tva: Number(d.taux_tva),
  total_ttc: Number(d.total_ttc),
});

export { calculerDevis, type ParametresDevis } from "./calcul-devis";

const ajouterJours = (date: string, jours: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + jours);
  return d.toISOString().slice(0, 10);
};

/** Le devis que l'outil propose à partir d'une demande du site (ou d'un client saisi à la main). */
export const devisPropose = (
  cabinet: Cabinet,
  client: Pick<ClientFiche, "headcount" | "client_sites" | "establishments">,
  demande?: Pick<Demande, "offre" | "urgence" | "sites" | "headcount" | "situation"> | null,
) => {
  const offre = OFFRES.find((o) => o.id === demande?.offre) ?? OFFRES.find((o) => o.id === "audit_360")!;
  const controle = demande?.situation === "controle_annonce";
  const p: ParametresDevis = {
    prestation: offre.id,
    intitule: `${offre.nom}${controle ? ", avec préparation au contrôle annoncé" : ""}`,
    base_ht: offre.baseHT ?? 0,
    effectif: demande?.headcount ?? client.headcount ?? null,
    sites: demande?.sites ?? client.client_sites ?? client.establishments ?? null,
    urgence: Boolean(demande?.urgence),
    jours_comp: 0,
    frais_ht: 0,
    ajustement_ht: 0,
    ajustement_libelle: null,
  };
  const cree = aujourdHui();
  return {
    ...p,
    ...calculerDevis(p, cabinet.franchise_tva),
    description: `${offre.contenu} Format : ${offre.format.replace(/\s*\(à confirmer\)/, "")}.`,
    cree_le: cree,
    valable_jusquau: ajouterJours(cree, 30),
    acompte_pct: cabinet.acompte_pct,
    calendrier: controle ? "Avant l’échéance du contrôle annoncé, à préciser lors du cadrage." : "Calendrier arrêté avec le Client lors du cadrage de la mission.",
    livrables: [...(LIVRABLES_PAR_PRESTATION[offre.id] ?? LIVRABLES_PAR_PRESTATION.audit)],
  };
};

/* ------------------------------------------------------------------ lecture de la page Commercial */

export interface LigneContratASigner {
  mission_id: string;
  reference: string;
  client: string;
  date_contrat: string;
  montant_ht: number | null;
}

export const lireCommercial = async () => {
  const supabase = await createClient();
  const [cabinet, leads, devis, contrats, factures] = await Promise.all([
    lireCabinet(),
    supabase.from("leads").select("*").order("created_at", { ascending: false }),
    supabase.from("devis").select("*, organisation:organizations (name, exemple)").order("cree_le", { ascending: false }).order("numero", { ascending: false }),
    supabase.from("contrats").select("mission_id, date_contrat, montant_ht, frais_ht, signe_le, mission:missions (reference, organisation:organizations (name))").is("signe_le", null),
    supabase.from("factures").select("*, mission:missions (id, reference)").order("numero", { ascending: false }),
  ]);
  return {
    cabinet,
    demandes: ((leads.data ?? []) as Demande[]).map((d) => ({ ...d, estimation_ht: d.estimation_ht === null ? null : Number(d.estimation_ht) })),
    devis: ((devis.data ?? []) as (Devis & { organisation: { name: string; exemple: boolean } | null })[]).map((d) => ({
      ...normaliserDevis(d),
      client: d.organisation?.name ?? "Client",
      exemple: Boolean(d.organisation?.exemple),
    })),
    contratsASigner: ((contrats.data ?? []) as unknown as { mission_id: string; date_contrat: string; montant_ht: string | null; frais_ht: string; mission: { reference: string; organisation: { name: string } | null } | null }[]).map(
      (c): LigneContratASigner => ({
        mission_id: c.mission_id,
        reference: c.mission?.reference ?? "",
        client: c.mission?.organisation?.name ?? "Client",
        date_contrat: c.date_contrat,
        montant_ht: c.montant_ht === null ? null : Number(c.montant_ht) + Number(c.frais_ht),
      }),
    ),
    factures: ((factures.data ?? []) as (Facture & { mission: { id: string; reference: string } })[]).map((f) => ({ ...normaliserFacture(f), mission: f.mission })),
  };
};
