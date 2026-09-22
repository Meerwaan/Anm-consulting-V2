import EtapePage from "@/components/portail/EtapePage";
import type { FichierPiece, ValiditePiece } from "@/lib/types";
import LignePiece from "./LignePiece";
import CopierPiecesManquantes from "./CopierPiecesManquantes";

/**
 * Checklist des pièces, avec leurs fichiers et leur validité.
 *
 * « Rien ne manque » ne suffit pas : une attestation de vigilance de sept mois ne vaut
 * rien le jour du contrôle. Chaque pièce dont la durée est connue affiche son échéance.
 * « Sans objet » ne veut dire qu'une chose : ce document ne s'applique pas à cette
 * entreprise (seuil d'effectif, ou décision de la consultante).
 */

const CATEGORIES: Record<string, string> = {
  entreprise: "Entreprise",
  cnaps: "CNAPS",
  social: "Social",
  paie: "Paie",
  temps: "Temps de travail",
  sst: "Santé et sécurité au travail",
  cse: "CSE",
  fiscal: "Fiscal",
  sous_traitance: "Sous-traitance",
};

const RECUES = new Set(["recue", "valide", "bientot_perimee", "perimee", "date_manquante"]);

interface Props {
  missionId: string;
  ordre: string;
  pieces: ValiditePiece[];
  fichiers: FichierPiece[];
}

const ListePieces = ({ missionId, ordre, pieces, fichiers }: Props) => {
  const manquantes = pieces.filter((p) => p.required && p.etat === "non_recue");
  const perimees = pieces.filter((p) => p.etat === "perimee" || p.etat === "bientot_perimee");
  const recues = pieces.filter((p) => RECUES.has(p.etat)).length;
  const applicables = pieces.filter((p) => p.etat !== "sans_objet").length;

  const groupes = new Map<string, ValiditePiece[]>();
  for (const p of pieces) groupes.set(p.category, [...(groupes.get(p.category) ?? []), p]);
  const fichiersDe = (id: string) => fichiers.filter((f) => f.document_id === id);

  return (
    <section className="flex flex-col gap-8">
      <header className="flex flex-col gap-5 border-b border-filet pb-6">
        <div className="flex flex-col gap-3">
          <EtapePage chemin="pieces" />
          <h2 className="font-display text-t3 text-encre">Pièces justificatives</h2>
        </div>
        <p className="text-corps text-encre-2">
          <strong className="font-medium text-encre">{recues}</strong> reçue{recues > 1 ? "s" : ""} sur {applicables}
          {manquantes.length > 0 ? (
            <>
              {" · "}
              <strong className="font-medium text-critique">{manquantes.length}</strong> manquante{manquantes.length > 1 ? "s" : ""}
            </>
          ) : null}
          {perimees.length > 0 ? (
            <>
              {" · "}
              <strong className="font-medium text-majeur">{perimees.length}</strong> périmée{perimees.length > 1 ? "s" : ""} ou bientôt
            </>
          ) : null}
        </p>
        {manquantes.length > 0 ? (
          <CopierPiecesManquantes missionId={missionId} ordre={ordre} noms={manquantes.map((p) => p.name)} />
        ) : (
          <p className="text-meta font-medium text-mineur">Toutes les pièces obligatoires sont reçues.</p>
        )}
        {perimees.length > 0 ? (
          <p className="rounded-[5px] border border-majeur/30 bg-majeur-l/50 px-4 py-3 text-meta text-encre">
            Une pièce reçue mais dépassée ne vaut rien le jour du contrôle : redemande la version à jour.
          </p>
        ) : null}
      </header>

      {[...groupes.entries()].map(([categorie, liste]) => {
        const n = liste.filter((p) => RECUES.has(p.etat)).length;
        const app = liste.filter((p) => p.etat !== "sans_objet").length;
        return (
          <section key={categorie} aria-labelledby={`cat-${categorie}`}>
            <div className="flex items-baseline justify-between gap-4 border-b-[1.5px] border-encre pb-2">
              <h3 id={`cat-${categorie}`} className="font-display text-t4 text-encre">
                {CATEGORIES[categorie] ?? categorie}
              </h3>
              <span className="text-meta tabular-nums text-gris">
                {n} / {app}
              </span>
            </div>
            <ul>
              {liste.map((p) => (
                <LignePiece key={p.id} missionId={missionId} ordre={ordre} piece={p} fichiers={fichiersDe(p.id)} />
              ))}
            </ul>
          </section>
        );
      })}
    </section>
  );
};

export default ListePieces;
