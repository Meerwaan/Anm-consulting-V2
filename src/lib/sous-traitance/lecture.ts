import { createClient } from "@/lib/supabase/server";
import type { Agent, Attestation, FactureST, Paie, Paiement, ParametresST, Smic, SousTraitant, Vente } from "./types";

export interface DonneesST {
  parametres: ParametresST;
  ventes: Vente[];
  paie: Paie[];
  sousTraitants: SousTraitant[];
  attestations: Attestation[];
  factures: FactureST[];
  paiements: Paiement[];
  agents: Agent[];
  smics: Smic[];
}

const PARAMETRES_PAR_DEFAUT: ParametresST = {
  periode_debut: null,
  periode_fin: null,
  taux_horaire_vendu: null,
  heures_mensuelles_etp: 151.67,
};

/** PostgREST renvoie les numeric en chaînes : on les remet en nombres une fois pour toutes. */
const nombres = <T extends Record<string, unknown>>(lignes: T[] | null, cles: string[]): T[] =>
  (lignes ?? []).map((l) => {
    const copie: Record<string, unknown> = { ...l };
    for (const k of cles) if (copie[k] !== null && copie[k] !== undefined) copie[k] = Number(copie[k]);
    return copie as T;
  });

/** Tout le module sous-traitance d'une mission, en une série de lectures parallèles. */
export const lireDonneesST = async (missionId: string): Promise<DonneesST> => {
  const supabase = await createClient();
  const [p, v, b, s, a, f, pa, sm, ag] = await Promise.all([
    supabase.from("st_parametres").select("periode_debut, periode_fin, taux_horaire_vendu, heures_mensuelles_etp, cout_revient_horaire, cout_revient_source").eq("mission_id", missionId).maybeSingle(),
    supabase.from("st_ventes").select("id, mois, client, bon_commande, heures_commandees, heures_facturees, montant_ht, numero_facture, tva, montant_ttc, montant_regle, date_reglement, note").eq("mission_id", missionId).order("mois").order("created_at"),
    supabase.from("st_paie").select("mois, effectif, heures_realisees, heures_payees, masse_salariale, note").eq("mission_id", missionId).order("mois"),
    supabase.from("st_sous_traitants").select("id, raison_sociale, siren, adresse, dirigeant, activite, debut_relation, date_conclusion_contrat, date_fin_contrat, contrat_ref, montant_contrat_ht, rang, donneur_id, note").eq("mission_id", missionId).order("rang").order("raison_sociale"),
    supabase.from("st_attestations").select("id, sous_traitant_id, date_delivrance, mois_reference, effectif_etp, remunerations, siren_conforme, authentifiee, note").eq("mission_id", missionId).order("date_delivrance", { nullsFirst: false }),
    supabase.from("st_factures").select("id, sous_traitant_id, numero, date_facture, mois, heures, montant_ht, montant_ttc, note").eq("mission_id", missionId).order("mois", { nullsFirst: false }).order("date_facture"),
    supabase.from("st_paiements").select("id, sous_traitant_id, facture_id, date_paiement, montant, reference, compte_au_nom, note").eq("mission_id", missionId).order("date_paiement", { nullsFirst: false }),
    supabase.from("smic_horaire").select("valable_du, taux_brut, source").order("valable_du"),
    supabase.from("st_agents").select("id, sous_traitant_id, nom, employeur, carte_numero, heures, present_documents, carte_valide, carte_activite, dracar, planning, carte_fin, affecte_mission, piece_identite, piece_fin, autorisation_travail, titre_authentifie, type_contrat, date_entree, date_sortie, date_dpae, contrat_signe, registre, visite_medicale, visite_prochaine, note").eq("mission_id", missionId).order("created_at"),
  ]);

  const param = p.data
    ? (nombres([p.data as Record<string, unknown>], ["taux_horaire_vendu", "heures_mensuelles_etp"])[0] as unknown as ParametresST)
    : PARAMETRES_PAR_DEFAUT;

  return {
    parametres: param,
    ventes: nombres(v.data as Record<string, unknown>[] | null, ["heures_commandees", "heures_facturees", "montant_ht", "tva", "montant_ttc", "montant_regle"]) as unknown as Vente[],
    paie: nombres(b.data as Record<string, unknown>[] | null, ["effectif", "heures_realisees", "heures_payees", "masse_salariale"]) as unknown as Paie[],
    sousTraitants: nombres(s.data as Record<string, unknown>[] | null, ["montant_contrat_ht", "rang"]) as unknown as SousTraitant[],
    attestations: nombres(a.data as Record<string, unknown>[] | null, ["effectif_etp", "remunerations"]) as unknown as Attestation[],
    factures: nombres(f.data as Record<string, unknown>[] | null, ["heures", "montant_ht", "montant_ttc"]) as unknown as FactureST[],
    paiements: nombres(pa.data as Record<string, unknown>[] | null, ["montant"]) as unknown as Paiement[],
    agents: nombres(ag.data as Record<string, unknown>[] | null, ["heures"]) as unknown as Agent[],
    smics: nombres(sm.data as Record<string, unknown>[] | null, ["taux_brut"]) as unknown as Smic[],
  };
};
