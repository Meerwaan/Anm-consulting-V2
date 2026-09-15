import type { EtatValidite, ValiditePiece } from "@/lib/types";
import { definirDateDocument, demanderPiecesManquantes } from "@/app/admin/actions";

/**
 * « Sans objet » disait « Reçue », en vert, pour toute pièce dépourvue de durée de
 * péremption — soit 29 modèles sur 37. Sur la mission Secu 91, 23 pièces jamais reçues
 * s'affichaient ainsi et l'en-tête annonçait 4 manquantes au lieu de 27.
 * « Sans objet » ne veut dire qu'une chose : ce document ne s'applique pas à cette
 * entreprise (seuil d'effectif). Ne pas avoir de date de péremption n'est pas une
 * dispense de réception.
 */
const ETAT: Record<EtatValidite, { texte: string; couleur: string }> = {
  perimee:         { texte: "Périmée",       couleur: "var(--anm-critique)" },
  bientot_perimee: { texte: "Bientôt",       couleur: "var(--anm-majeur)" },
  date_manquante:  { texte: "Date à saisir", couleur: "var(--anm-majeur)" },
  non_recue:       { texte: "Manquante",     couleur: "var(--anm-critique)" },
  valide:          { texte: "À jour",        couleur: "var(--anm-mineur)" },
  recue:           { texte: "Reçue",         couleur: "var(--anm-mineur)" },
  sans_objet:      { texte: "Sans objet",    couleur: "var(--anm-muted)" },
};

const jour = (d: string | null): string => (d ? new Date(d).toLocaleDateString("fr-FR") : "");

interface Props {
  missionId: string;
  ordre: string;
  pieces: ValiditePiece[];
}

/**
 * Checklist des pièces, avec leur validité.
 *
 * « Rien ne manque » ne suffit pas : une attestation de vigilance de sept mois ne vaut
 * rien le jour du contrôle. Chaque pièce dont la durée est connue affiche son échéance,
 * et la nature de cette durée — un texte l'impose, ou l'usage l'exige.
 */
const ListePieces = ({ missionId, ordre, pieces }: Props) => {
  const manquantes = pieces.filter((p) => p.required && p.etat === "non_recue");
  const perimees = pieces.filter((p) => p.etat === "perimee" || p.etat === "bientot_perimee");

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl">Pièces et validité</h2>
        {manquantes.length > 0 ? (
          <form action={demanderPiecesManquantes}>
            <input type="hidden" name="missionId" value={missionId} />
            <input type="hidden" name="ordre" value={ordre} />
            <button
              type="submit"
              className="rounded bg-[var(--anm-green)] px-3 py-1.5 text-sm font-medium text-[var(--anm-paper)]"
            >
              Demander les {manquantes.length} pièces manquantes
            </button>
          </form>
        ) : (
          <p className="font-mono text-xs uppercase tracking-widest text-[var(--anm-mineur)]">
            Rien ne manque
          </p>
        )}
      </div>

      {perimees.length > 0 ? (
        <p className="mt-3 border-l-2 border-[var(--anm-majeur)] bg-[var(--anm-mint)] px-3 py-2 text-sm">
          {perimees.length} pièce{perimees.length > 1 ? "s" : ""} périmée
          {perimees.length > 1 ? "s" : ""} ou sur le point de l&apos;être. Une pièce reçue mais
          dépassée ne vaut rien le jour du contrôle.
        </p>
      ) : null}

      <ul className="mt-4 flex flex-col">
        {pieces.map((p) => {
          const etat = ETAT[p.etat];
          const parLeDocument = p.validite_nature === "date_du_document";
          const suitUneDuree = p.validite_nature === "texte" || p.validite_nature === "pratique";
          return (
            <li key={p.id} className="border-b border-[var(--anm-hairline)] py-3 last:border-b-0">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <span className="font-medium">{p.name}</span>
                <span
                  className="shrink-0 font-mono text-[0.68rem] uppercase tracking-wide"
                  style={{ color: etat.couleur }}
                >
                  {etat.texte}
                  {p.echeance ? ` · ${jour(p.echeance)}` : ""}
                </span>
              </div>

              {p.validite_note ? (
                <p className="mt-1 max-w-3xl text-xs text-[var(--anm-muted)]">
                  {suitUneDuree ? (
                    <span className="font-mono uppercase tracking-wide">
                      {p.validite_nature === "texte" ? "texte · " : "usage · "}
                      {p.validite_jours} j —{" "}
                    </span>
                  ) : null}
                  {p.validite_note}
                </p>
              ) : null}

              {p.validite_nature && p.validite_nature !== "indefinie" ? (
                <form action={definirDateDocument} className="mt-2 flex flex-wrap items-end gap-2">
                  <input type="hidden" name="missionId" value={missionId} />
                  <input type="hidden" name="ordre" value={ordre} />
                  <input type="hidden" name="documentId" value={p.id} />
                  <input type="hidden" name="champ" value={parLeDocument ? "expire_le" : "document_date"} />
                  <label className="flex flex-col gap-1 text-xs">
                    {parLeDocument ? "Échéance portée par la pièce" : "Date de la pièce"}
                    <input
                      name="valeur"
                      type="date"
                      defaultValue={(parLeDocument ? p.echeance : p.document_date) ?? ""}
                      className="rounded border border-[var(--anm-hairline)] bg-white px-2 py-1 text-sm"
                    />
                  </label>
                  <button
                    type="submit"
                    className="rounded border border-[var(--anm-hairline)] px-2.5 py-1.5 text-xs hover:border-[var(--anm-green)]"
                  >
                    Enregistrer
                  </button>
                </form>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
};

export default ListePieces;
