import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { FileText, Image as IconeImage } from "@phosphor-icons/react/dist/ssr";
import { lireSession } from "@/lib/supabase/session";
import { aDeposer, lireFichiers, lireMaMission, lirePieces, type FichierClient, type PieceClient } from "@/lib/espace-client/lecture";
import { CATEGORIES_PIECES, dateClient } from "@/content/espace-client";
import { tailleLisible } from "@/lib/portail/fichiers";
import DepotPiece from "@/components/espace-client/DepotPiece";

export const metadata: Metadata = { title: "Pièces — ANM Consulting", robots: { index: false, follow: false } };

const MESSAGE_PAR_DEFAUT = /^Merci de déposer\s?:/;

const Fichiers = ({ missionId, fichiers }: { missionId: string; fichiers: FichierClient[] }) =>
  fichiers.length ? (
    <ul className="flex flex-col gap-2">
      {fichiers.map((f) => {
        const Icone = f.content_type?.startsWith("image/") ? IconeImage : FileText;
        return (
          <li key={f.id}>
            <a
              href={`/app/missions/${missionId}/pieces/${f.id}`}
              target="_blank"
              rel="noopener"
              className="flex min-h-12 items-center gap-3 rounded-[5px] border border-filet bg-papier px-3 py-2 text-meta text-encre underline-offset-4 hover:underline"
            >
              <Icone size={20} className="shrink-0 text-vert" aria-hidden />
              <span className="min-w-0 flex-1 truncate">{f.file_name}</span>
              <span className="shrink-0 text-note text-gris">
                {tailleLisible(f.file_size)} · {dateClient(f.uploaded_at, false)}
              </span>
            </a>
          </li>
        );
      })}
    </ul>
  ) : null;

const Piece = ({ missionId, p, fichiers }: { missionId: string; p: PieceClient; fichiers: FichierClient[] }) => {
  const attendue = aDeposer(p);
  return (
    <li className="flex flex-col gap-4 py-6">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-1">
        <div className="min-w-0 flex-1">
          <h3 className="text-corps font-medium text-encre">{p.nom}</h3>
          <p className="text-note text-gris">{CATEGORIES_PIECES[p.categorie] ?? p.categorie}</p>
        </div>
        <p className={`flex shrink-0 items-center gap-2 text-meta font-medium ${attendue ? "text-majeur" : "text-mineur"}`}>
          <span className={`size-2 rounded-full ${attendue ? "bg-majeur" : "bg-mineur"}`} aria-hidden />
          {attendue ? "À déposer" : `Reçue${p.recue_le ? ` le ${dateClient(p.recue_le, false)}` : ""}`}
        </p>
      </div>
      {attendue && (p.a_rendre_le || (p.message && !MESSAGE_PAR_DEFAUT.test(p.message))) ? (
        <div className="flex flex-col gap-1 text-meta text-encre-2">
          {p.a_rendre_le ? <p>À transmettre avant le {dateClient(p.a_rendre_le)}.</p> : null}
          {p.message && !MESSAGE_PAR_DEFAUT.test(p.message) ? <p className="whitespace-pre-wrap">{p.message}</p> : null}
        </div>
      ) : null}
      <Fichiers missionId={missionId} fichiers={fichiers} />
      <DepotPiece missionId={missionId} documentId={p.id} nomPiece={p.nom} dejaDes={fichiers.length > 0} />
    </li>
  );
};

/** Les pièces demandées par la consultante, et celles déjà reçues. */
export default async function PiecesClientPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [session, mission] = await Promise.all([lireSession(), lireMaMission(id)]);
  if (!mission || !session) notFound();
  const [pieces, fichiers] = await Promise.all([lirePieces(id), lireFichiers(id, session.utilisateurId)]);

  const parPiece = new Map<string, FichierClient[]>();
  for (const f of fichiers) parPiece.set(f.document_id, [...(parPiece.get(f.document_id) ?? []), f]);
  const attendues = pieces.filter(aDeposer);
  const recues = pieces.filter((p) => !aDeposer(p));

  return (
    <div className="flex flex-col gap-12">
      <div className="flex max-w-2xl flex-col gap-2">
        <h2 className="font-display text-t3 text-encre">Pièces</h2>
        <p className="text-corps text-encre-2">
          Déposez ici les documents demandés : PDF, photo ou tableur, plusieurs fichiers par pièce si besoin (50 Mo au plus chacun). Chaque dépôt nous est signalé.
        </p>
      </div>

      <section aria-labelledby="a-deposer" className="flex flex-col gap-2">
        <h3 id="a-deposer" className="font-display text-t4 text-encre">
          À déposer {attendues.length ? `(${attendues.length})` : ""}
        </h3>
        {attendues.length ? (
          <ul className="flex flex-col divide-y divide-filet border-y border-filet">
            {attendues.map((p) => (
              <Piece key={p.id} missionId={id} p={p} fichiers={parPiece.get(p.id) ?? []} />
            ))}
          </ul>
        ) : (
          <p className="text-corps text-encre-2">Aucune pièce en attente. Nous vous préviendrons ici si un document nous manque.</p>
        )}
      </section>

      {recues.length ? (
        <section aria-labelledby="recues" className="flex flex-col gap-2">
          <h3 id="recues" className="font-display text-t4 text-encre">Reçues ({recues.length})</h3>
          <ul className="flex flex-col divide-y divide-filet border-y border-filet">
            {recues.map((p) => (
              <Piece key={p.id} missionId={id} p={p} fichiers={parPiece.get(p.id) ?? []} />
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
