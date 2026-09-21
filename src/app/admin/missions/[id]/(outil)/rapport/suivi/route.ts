import { NextResponse } from "next/server";
import { exigerRole } from "@/lib/supabase/session";
import { lireGrilles } from "@/lib/grilles/lecture";
import { lireDonneesST } from "@/lib/sous-traitance/lecture";
import { lireMission } from "@/lib/portail/mission";
import { NATURES_NC } from "@/content/grilles";

/**
 * Le tableau de suivi des anomalies et actions correctives, pour Excel : l'outil que
 * l'entreprise garde après l'audit (objectif de l'audit, §5). Séparateur « ; » et BOM UTF-8 :
 * Excel en français l'ouvre directement, accents compris.
 */
const cellule = (v: string | null | undefined) => `"${String(v ?? "").replace(/"/g, '""').replace(/\r?\n/g, " ")}"`;
const date = (d: string | null) => (d ? new Date(`${d}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" }) : "");
const STATUT: Record<string, string> = { a_faire: "À faire", en_cours: "En cours", regularise: "Régularisé" };

export const GET = async (_req: Request, { params }: { params: Promise<{ id: string }> }): Promise<NextResponse> => {
  await exigerRole("consultant");
  const { id } = await params;
  const [mission, g, d] = await Promise.all([lireMission(id), lireGrilles(id), lireDonneesST(id)]);
  if (!mission) return new NextResponse("Mission introuvable.", { status: 404 });
  const entetes = ["N°", "Concerne", "Nature", "Constat", "Élément vérifié", "Risque", "Action corrective", "Justificatif à produire", "Responsable", "Échéance", "Statut", "Régularisé le", "Preuve de régularisation"];
  const lignes = g.nonConformites.map((n, i) => [
    String(i + 1),
    d.sousTraitants.find((s) => s.id === n.sous_traitant_id)?.raison_sociale ?? "Entreprise",
    n.nature === "autre" && n.nature_autre ? n.nature_autre : NATURES_NC[n.nature] ?? n.nature,
    n.constat,
    n.element_verifie,
    n.risque,
    n.action,
    n.justificatif,
    n.responsable,
    date(n.echeance),
    STATUT[n.statut] ?? n.statut,
    date(n.date_regularisation),
    n.preuve_regularisation,
  ]);
  const csv = "﻿" + [entetes, ...lignes].map((l) => l.map(cellule).join(";")).join("\r\n");
  const nom = `Suivi-actions-${(mission.organisation?.name ?? "mission").replace(/[^\p{L}\p{N}]+/gu, "-")}.csv`;
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${encodeURIComponent(nom)}"`,
      "Cache-Control": "no-store",
    },
  });
};
