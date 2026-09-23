/**
 * L'annuaire des entreprises de l'État (recherche-entreprises.api.gouv.fr) : à partir d'un SIREN,
 * la forme juridique, le siège et le dirigeant, pour remplir contrat et facture sans rien retaper.
 * API publique, sans clé. Les données INSEE sont en majuscules et sans accents : l'adresse est
 * gardée telle quelle (c'est la norme postale), le prénom est remis en forme, tout reste modifiable.
 */

export interface FicheAnnuaire {
  siren: string;
  raisonSociale: string;
  formeJuridique: string | null;
  adresse: string | null;
  codePostal: string | null;
  ville: string | null;
  representant: string | null;
  representantFonction: string | null;
  fermee: boolean;
}

/** Nomenclature INSEE des catégories juridiques : les formes courantes, puis le premier niveau. */
const FORMES: Record<string, string> = {
  "1000": "Entreprise individuelle",
  "5498": "EURL",
  "5499": "SARL",
  "5710": "SAS",
  "5720": "SASU",
  "5202": "SNC",
  "5599": "SA à conseil d’administration",
  "5699": "SA à directoire",
  "6540": "SCI",
  "9220": "Association déclarée",
};
const FORMES_NIVEAU_2: Record<string, string> = { "54": "SARL", "55": "SA", "56": "SA", "57": "SAS", "65": "Société civile", "92": "Association" };

export const libelleFormeJuridique = (code: string | null | undefined): string | null =>
  code ? (FORMES[code] ?? FORMES_NIVEAU_2[code.slice(0, 2)] ?? null) : null;

/** « JEAN PIERRE » → « Jean », « MARIE-CLAIRE » → « Marie-Claire ». */
const prenomUsuel = (prenoms: string): string =>
  (prenoms.split(/\s+/)[0] ?? "").toLowerCase().replace(/(^|-)(\p{L})/gu, (_, sep: string, l: string) => sep + l.toUpperCase());

interface Dirigeant {
  type_dirigeant?: string;
  nom?: string;
  prenoms?: string;
  denomination?: string;
  qualite?: string;
}

interface Resultat {
  siren: string;
  nom_raison_sociale?: string | null;
  nom_complet?: string;
  nature_juridique?: string | null;
  etat_administratif?: string;
  dirigeants?: Dirigeant[];
  siege?: {
    numero_voie?: string | null;
    indice_repetition?: string | null;
    type_voie?: string | null;
    libelle_voie?: string | null;
    complement_adresse?: string | null;
    code_postal?: string | null;
    libelle_commune?: string | null;
  };
}

/** La fiche d'une entreprise, ou null si le SIREN est inconnu ou l'annuaire injoignable. */
export const lireAnnuaire = async (sirenOuSiret: string): Promise<FicheAnnuaire | null> => {
  const siren = sirenOuSiret.replace(/\s/g, "").slice(0, 9);
  if (!/^\d{9}$/.test(siren)) return null;
  try {
    const rep = await fetch(`https://recherche-entreprises.api.gouv.fr/search?q=${siren}&per_page=1`, {
      signal: AbortSignal.timeout(6000),
      cache: "no-store",
    });
    if (!rep.ok) return null;
    const json = (await rep.json()) as { results?: Resultat[] };
    const r = json.results?.find((x) => x.siren === siren);
    if (!r) return null;
    const s = r.siege ?? {};
    const voie = [s.numero_voie, s.indice_repetition, s.type_voie, s.libelle_voie].filter(Boolean).join(" ");
    const adresse = [s.complement_adresse, voie].filter(Boolean).join(", ") || null;
    const d = r.dirigeants?.find((x) => x.type_dirigeant === "personne physique" && x.nom) ?? r.dirigeants?.[0];
    const representant = d
      ? d.type_dirigeant === "personne physique"
        ? [d.prenoms ? prenomUsuel(d.prenoms) : "", d.nom ?? ""].filter(Boolean).join(" ")
        : (d.denomination ?? null)
      : null;
    return {
      siren,
      raisonSociale: r.nom_raison_sociale ?? r.nom_complet ?? "",
      formeJuridique: libelleFormeJuridique(r.nature_juridique),
      adresse,
      codePostal: s.code_postal ?? null,
      ville: s.libelle_commune ?? null,
      representant,
      representantFonction: d?.qualite ?? null,
      fermee: r.etat_administratif === "F",
    };
  } catch {
    return null;
  }
};

/** Numéro de TVA intracommunautaire français, calculé à partir du SIREN (clé = (12 + 3 × (SIREN mod 97)) mod 97). */
export const tvaIntracom = (siren: string | null | undefined): string | null => {
  if (!siren || !/^\d{9}$/.test(siren)) return null;
  const cle = (12 + 3 * (Number(siren) % 97)) % 97;
  return `FR${String(cle).padStart(2, "0")}${siren}`;
};
