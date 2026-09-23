import { createClient } from "@/lib/supabase/server";
import { OFFRES, chiffrer } from "@/content/offres";
import { LIVRABLES_PAR_PRESTATION } from "@/content/contrat";
import { fmtDate, fmtEuros } from "@/lib/sous-traitance/format";
import { tvaIntracom } from "./annuaire";

/**
 * Contrats et factures : ce que l'outil sait déjà, et ce qu'il en déduit. Tout ce qui peut être
 * rempli l'est : le cabinet (saisi une fois), le client (fiche + annuaire), la prestation et son
 * prix (grille tarifaire), les dates (mission). Sofia n'a qu'à relire et corriger.
 */

export interface Cabinet {
  raison_sociale: string;
  forme_juridique: string;
  capital: number | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  siren: string | null;
  rcs_ville: string | null;
  franchise_tva: boolean;
  representant: string | null;
  fonction: string | null;
  email: string | null;
  telephone: string | null;
  iban: string | null;
  bic: string | null;
  delai_paiement_jours: number;
  acompte_pct: number;
}

export interface ClientFiche {
  id: string;
  name: string;
  siren: string | null;
  headcount: number | null;
  establishments: number | null;
  client_sites: number | null;
  forme_juridique: string | null;
  adresse: string | null;
  code_postal: string | null;
  ville: string | null;
  representant: string | null;
  representant_fonction: string | null;
  annuaire_le: string | null;
}

export interface MissionFacturation {
  id: string;
  reference: string;
  type: string;
  control_in_progress: boolean;
  control_body: string | null;
  control_deadline: string | null;
  intervention_on: string | null;
  restitution_on: string | null;
  organisation: ClientFiche;
}

export interface Contrat {
  id: string;
  mission_id: string;
  prestation: string;
  intitule: string;
  description: string | null;
  montant_ht: number | null;
  frais_ht: number;
  acompte_pct: number;
  calendrier: string | null;
  livrables: string[];
  lieu_signature: string | null;
  date_contrat: string;
  signe_le: string | null;
  archive_path: string | null;
}

export interface LigneFacture {
  designation: string;
  detail?: string;
  quantite: number;
  prix_unitaire_ht: number;
}

export type NatureFacture = "acompte" | "solde" | "totale" | "avoir";

export interface Facture {
  id: string;
  mission_id: string;
  numero: string;
  nature: NatureFacture;
  emise_le: string;
  echeance_le: string;
  lignes: LigneFacture[];
  total_ht: number;
  taux_tva: number;
  total_tva: number;
  total_ttc: number;
  acomptes: { numero: string; emise_le: string; total_ht: number; total_ttc: number }[];
  net_a_payer: number;
  facture_origine: string | null;
  vendeur: PartieFacture;
  client: PartieFacture;
  contrat_du: string | null;
  payee_le: string | null;
  archive_path: string | null;
}

/** Une partie telle qu'elle figure sur une facture, figée à l'émission. */
export interface PartieFacture {
  nom: string;
  lignes: string[];
  siren: string | null;
  tva: string | null;
  mentions?: string;
}

const CHAMPS_CLIENT =
  "id, name, siren, headcount, establishments, client_sites, forme_juridique, adresse, code_postal, ville, representant, representant_fonction, annuaire_le";

export const lireCabinet = async (): Promise<Cabinet> => {
  const supabase = await createClient();
  const { data } = await supabase.from("cabinet").select("*").maybeSingle();
  return data as Cabinet;
};

/** Les colonnes numeric arrivent en texte : on les remet en nombres. */
export const normaliserFacture = (x: Facture): Facture => ({
  ...x,
  total_ht: Number(x.total_ht),
  taux_tva: Number(x.taux_tva),
  total_tva: Number(x.total_tva),
  total_ttc: Number(x.total_ttc),
  net_a_payer: Number(x.net_a_payer),
});

export const lireFacturation = async (missionId: string) => {
  const supabase = await createClient();
  const [cabinet, m, c, f] = await Promise.all([
    lireCabinet(),
    supabase
      .from("missions")
      .select(`id, reference, type, control_in_progress, control_body, control_deadline, intervention_on, restitution_on, organisation:organizations (${CHAMPS_CLIENT})`)
      .eq("id", missionId)
      .maybeSingle(),
    supabase.from("contrats").select("*").eq("mission_id", missionId).maybeSingle(),
    supabase.from("factures").select("*").eq("mission_id", missionId).order("cree_le"),
  ]);
  if (!m.data) return null;
  const nombre = (v: unknown) => (v === null || v === undefined ? null : Number(v));
  const contrat = c.data
    ? ({ ...c.data, montant_ht: nombre(c.data.montant_ht), frais_ht: Number(c.data.frais_ht) } as Contrat)
    : null;
  const factures = ((f.data ?? []) as Facture[]).map(normaliserFacture);
  return { cabinet: { ...cabinet, capital: nombre(cabinet.capital) }, mission: m.data as unknown as MissionFacturation, contrat, factures };
};

export type DonneesFacturation = NonNullable<Awaited<ReturnType<typeof lireFacturation>>>;

/* ------------------------------------------------------------------ propositions */

/** La date du jour à Paris (et non en temps universel : après 22 h, ce serait déjà demain). */
export const aujourdHui = () => new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });

const joursAvant = (date: string | null): number | null =>
  date ? Math.round((new Date(`${date}T12:00:00Z`).getTime() - new Date(`${aujourdHui()}T12:00:00Z`).getTime()) / 86_400_000) : null;

/** Le prix de la grille, avec son détail : base, effectif, sites, urgence (contrôle à moins de 7 jours). */
export const prixPropose = (mission: MissionFacturation) => {
  const offre = OFFRES.find((o) => o.id === mission.type);
  if (!offre || offre.baseHT === null) return null;
  const o = mission.organisation;
  const jours = joursAvant(mission.control_deadline);
  const urgence = mission.control_in_progress && jours !== null && jours < 7;
  const c = chiffrer({ baseHT: offre.baseHT, effectif: o.headcount ?? 0, sites: o.client_sites ?? o.establishments ?? 0, urgence });
  const detail = [
    `base ${offre.nom} ${fmtEuros(c.base)}`,
    c.effectif ? `effectif de ${o.headcount} salariés +${fmtEuros(c.effectif)}` : null,
    c.sites ? `sites +${fmtEuros(c.sites)}` : null,
    c.urgence ? `urgence, contrôle dans ${jours} jours +${fmtEuros(c.urgence)}` : null,
  ].filter(Boolean);
  return { totalHT: c.totalHT, detail: detail.join(" · ") };
};

/** Le calendrier, d'après les dates de la mission et l'échéance du contrôle. */
export const calendrierPropose = (m: MissionFacturation): string => {
  const morceaux = [
    m.intervention_on ? `intervention le ${fmtDate(m.intervention_on)}` : null,
    m.restitution_on ? `restitution le ${fmtDate(m.restitution_on)}` : null,
    m.control_in_progress && m.control_deadline ? `avant l’échéance du contrôle ${m.control_body ?? ""} du ${fmtDate(m.control_deadline)}`.replace("  ", " ") : null,
  ].filter(Boolean) as string[];
  if (!morceaux.length) return "Calendrier arrêté avec le Client lors du cadrage de la mission.";
  const texte = morceaux.join(", ");
  return `${texte.charAt(0).toUpperCase()}${texte.slice(1)}.`;
};

/** Le contrat tel que l'outil le propose quand il n'existe pas encore. */
export const contratPropose = (d: DonneesFacturation): Omit<Contrat, "id" | "mission_id" | "signe_le" | "archive_path"> => {
  const offre = OFFRES.find((o) => o.id === d.mission.type);
  const prix = prixPropose(d.mission);
  const controle = d.mission.control_in_progress && d.mission.control_body ? `, avec préparation au contrôle ${d.mission.control_body} en cours` : "";
  return {
    prestation: d.mission.type,
    intitule: `${offre?.nom ?? "Mission"}${controle}`,
    description: offre ? `${offre.contenu} Format : ${offre.format.replace(/\s*\(à confirmer\)/, "")}.` : null,
    montant_ht: prix?.totalHT ?? null,
    frais_ht: 0,
    acompte_pct: d.cabinet.acompte_pct,
    calendrier: calendrierPropose(d.mission),
    livrables: [...(LIVRABLES_PAR_PRESTATION[d.mission.type] ?? LIVRABLES_PAR_PRESTATION.audit)],
    lieu_signature: d.cabinet.ville,
    date_contrat: aujourdHui(),
  };
};

/* ------------------------------------------------------------------ parties */

const euros = (n: number) => fmtEuros(n).replace(",00", "");

export const partieCabinet = (c: Cabinet): PartieFacture => ({
  nom: c.raison_sociale,
  lignes: [c.adresse, [c.code_postal, c.ville].filter(Boolean).join(" ")].filter(Boolean) as string[],
  siren: c.siren,
  tva: c.franchise_tva ? null : tvaIntracom(c.siren),
  mentions: [
    `${c.forme_juridique}${c.capital ? ` au capital de ${euros(c.capital)}` : ""}`,
    c.siren ? `SIREN ${c.siren.replace(/(\d{3})(\d{3})(\d{3})/, "$1 $2 $3")}${c.rcs_ville ? `, RCS ${c.rcs_ville}` : ""}` : null,
  ]
    .filter(Boolean)
    .join(" · "),
});

export const partieClient = (o: ClientFiche): PartieFacture => ({
  nom: o.name,
  lignes: [o.adresse, [o.code_postal, o.ville].filter(Boolean).join(" ")].filter(Boolean) as string[],
  siren: o.siren,
  tva: tvaIntracom(o.siren),
});

/** Ce qui manque avant de pouvoir émettre une facture (mentions obligatoires). */
export const manquesFacture = (d: DonneesFacturation): string[] => {
  const m: string[] = [];
  if (!d.cabinet.siren) m.push("le SIREN d’ANM Consulting (page Cabinet)");
  if (!d.cabinet.adresse || !d.cabinet.code_postal) m.push("l’adresse d’ANM Consulting (page Cabinet)");
  const o = d.mission.organisation;
  if (!o.adresse || !o.code_postal || !o.ville) m.push("l’adresse du client");
  if (!o.siren || !/^\d{9}$/.test(o.siren.slice(0, 9)) || /^(0{9}|9{9})$/.test(o.siren)) m.push("le SIREN du client");
  if (!d.contrat || d.contrat.montant_ht === null) m.push("le prix de la mission (contrat)");
  return m;
};

/* ------------------------------------------------------------------ factures */

const arrondi = (n: number) => Math.round(n * 100) / 100;

export const tauxTva = (c: Cabinet) => (c.franchise_tva ? 0 : 20);

/** Les factures encore valables : ni avoir, ni annulée par un avoir. */
export const facturesValables = (factures: Facture[]) => {
  const annulees = new Set(factures.filter((f) => f.nature === "avoir").map((f) => f.facture_origine));
  return factures.filter((f) => f.nature !== "avoir" && !annulees.has(f.id));
};

export const estAnnulee = (f: Facture, factures: Facture[]) => factures.some((a) => a.nature === "avoir" && a.facture_origine === f.id);

/** Ce qu'on peut émettre maintenant : acompte ou facture unique au départ, solde après l'acompte. */
export const facturesPossibles = (d: DonneesFacturation): NatureFacture[] => {
  const v = facturesValables(d.factures);
  if (v.some((f) => f.nature === "solde" || f.nature === "totale")) return [];
  if (v.some((f) => f.nature === "acompte")) return ["solde"];
  return d.contrat && d.contrat.acompte_pct > 0 && d.contrat.acompte_pct < 100 ? ["acompte", "totale"] : ["totale"];
};

const ajouterJours = (date: string, jours: number) => {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + jours);
  return d.toISOString().slice(0, 10);
};

/** La facture à émettre, calculée ; la base lui donne son numéro à l'insertion. */
export const preparerFacture = (d: DonneesFacturation, nature: Exclude<NatureFacture, "avoir">) => {
  const c = d.contrat!;
  const emise = aujourdHui();
  const taux = tauxTva(d.cabinet);
  const ref = `mission ${d.mission.reference}, contrat du ${fmtDate(c.date_contrat)}`;
  const base = arrondi((c.montant_ht ?? 0) + c.frais_ht);
  let lignes: LigneFacture[];
  let acomptes: Facture["acomptes"] = [];

  if (nature === "acompte") {
    lignes = [{ designation: `Acompte de ${c.acompte_pct} % à la commande`, detail: `${c.intitule} (${ref})`, quantite: 1, prix_unitaire_ht: arrondi((base * c.acompte_pct) / 100) }];
  } else {
    lignes = [{ designation: c.intitule, detail: ref, quantite: 1, prix_unitaire_ht: c.montant_ht ?? 0 }];
    if (c.frais_ht > 0) lignes.push({ designation: "Frais de déplacement", quantite: 1, prix_unitaire_ht: c.frais_ht });
    if (nature === "solde") {
      const deja = facturesValables(d.factures).filter((f) => f.nature === "acompte");
      acomptes = deja.map((f) => ({ numero: f.numero, emise_le: f.emise_le, total_ht: f.total_ht, total_ttc: f.total_ttc }));
      for (const a of deja) lignes.push({ designation: `Acompte facturé (facture ${a.numero} du ${fmtDate(a.emise_le)})`, quantite: 1, prix_unitaire_ht: -a.total_ht });
    }
  }
  const total_ht = arrondi(lignes.reduce((s, l) => s + l.quantite * l.prix_unitaire_ht, 0));
  const total_tva = arrondi((total_ht * taux) / 100);
  const total_ttc = arrondi(total_ht + total_tva);
  return {
    mission_id: d.mission.id,
    nature,
    emise_le: emise,
    echeance_le: nature === "acompte" ? emise : ajouterJours(emise, d.cabinet.delai_paiement_jours),
    lignes,
    total_ht,
    taux_tva: taux,
    total_tva,
    total_ttc,
    acomptes,
    net_a_payer: total_ttc,
    vendeur: partieCabinet(d.cabinet),
    client: partieClient(d.mission.organisation),
    contrat_du: c.date_contrat,
  };
};

/** L'avoir qui annule une facture : mêmes lignes en négatif, même taux, mêmes parties. */
export const preparerAvoir = (f: Facture) => {
  const emise = aujourdHui();
  return {
    mission_id: f.mission_id,
    nature: "avoir" as const,
    emise_le: emise,
    echeance_le: emise,
    lignes: f.lignes.map((l) => ({ ...l, prix_unitaire_ht: -l.prix_unitaire_ht })),
    total_ht: -f.total_ht,
    taux_tva: f.taux_tva,
    total_tva: -f.total_tva,
    total_ttc: -f.total_ttc,
    acomptes: [],
    net_a_payer: -f.total_ttc,
    facture_origine: f.id,
    vendeur: f.vendeur,
    client: f.client,
    contrat_du: f.contrat_du,
  };
};

export const LIBELLE_NATURE: Record<NatureFacture, string> = {
  acompte: "Facture d’acompte",
  solde: "Facture de solde",
  totale: "Facture",
  avoir: "Avoir",
};
