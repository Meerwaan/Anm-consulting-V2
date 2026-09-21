import { lireFichiersPieces, lireMission, lireValiditePieces } from "@/lib/portail/mission";
import { lireGrilles } from "@/lib/grilles/lecture";
import { lireDonneesST } from "@/lib/sous-traitance/lecture";
import { construireRapport, type ModeleRapport } from "./modele";

/** Rassemble tout ce qu'il faut pour le rapport d'une mission. */
export const chargerRapport = async (missionId: string, auditeur: string): Promise<ModeleRapport | null> => {
  const [mission, d, g, pieces, fichiers] = await Promise.all([
    lireMission(missionId),
    lireDonneesST(missionId),
    lireGrilles(missionId),
    lireValiditePieces(missionId),
    lireFichiersPieces(missionId),
  ]);
  if (!mission) return null;
  const avecFichier = new Set(fichiers.map((f) => f.document_id));
  // Documents examinés : les pièces reçues, qu'elles aient été déposées ou vues sur place.
  const documents = pieces.filter((p) => p.received === "oui" || avecFichier.has(p.id)).map((p) => p.name);
  const org = mission.organisation;
  return construireRapport(
    {
      client: org?.name ?? "Client",
      siren: org?.siren ?? null,
      reference: mission.reference,
      controleEnCours: mission.control_in_progress,
      organisme: mission.control_body,
      echeance: mission.control_deadline,
      auditeur,
    },
    d,
    g,
    documents,
    new Date().toISOString().slice(0, 10),
  );
};
