import type { Metadata } from "next";
import ListePieces from "@/components/portail/ListePieces";
import { lireFichiersPieces, lireValiditePieces } from "@/lib/portail/mission";

export const metadata: Metadata = { title: "Pièces — ANM Consulting", robots: { index: false } };

/** Les pièces justificatives de la mission, déposées depuis l'iPad. */
export default async function PiecesPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [pieces, fichiers] = await Promise.all([lireValiditePieces(id), lireFichiersPieces(id)]);
  return <ListePieces missionId={id} ordre="3" pieces={pieces} fichiers={fichiers} />;
}
