import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import RailEtapes from "@/components/portail/RailEtapes";
import TableauPoints from "@/components/portail/TableauPoints";
import ListePieces from "@/components/portail/ListePieces";
import BlocNotes from "@/components/portail/BlocNotes";
import BarreEtape from "@/components/portail/BarreEtape";
import TextesApplicables from "@/components/portail/TextesApplicables";
import { OFFRES } from "@/content/offres";
import {
  lireDomainesEtape, lireEtapes, lireHorsEtape, lireMission, lireNotes,
  lireObjectifEtape, lirePieces, lirePointsDEtape,
} from "@/lib/portail/mission";

export const metadata: Metadata = { robots: { index: false } };

interface Params {
  params: Promise<{ id: string; ordre: string }>;
}

export default async function EtapePage({ params }: Params) {
  const { id, ordre } = await params;

  const [mission, etapes, horsEtape, pieces] = await Promise.all([
    lireMission(id),
    lireEtapes(id),
    lireHorsEtape(id),
    lirePieces(id),
  ]);
  if (!mission || etapes.length === 0) notFound();

  const estHorsEtape = ordre === "hors-etape";
  const etape = estHorsEtape ? null : etapes.find((e) => String(e.sort_order) === ordre);
  if (!estHorsEtape && !etape) notFound();

  const piecesClient = pieces.filter((p) => p.kind === "piece_client");
  const manquantes = piecesClient.filter(
    (p) => p.required && p.received !== "oui" && p.received !== "na",
  ).length;
  const pointsTotal =
    etapes.reduce((n, e) => n + e.points_total, 0) + horsEtape.reduce((n, h) => n + h.points_total, 0);
  const pointsTraites =
    etapes.reduce((n, e) => n + e.points_traites, 0) + horsEtape.reduce((n, h) => n + h.points_traites, 0);

  const [domaines, objectif, notes] = etape
    ? await Promise.all([
        lireDomainesEtape(etape.step_id),
        lireObjectifEtape(etape.step_id),
        lireNotes(id, etape.step_id),
      ])
    : [horsEtape.map((h) => h.domain), null, []];

  const points = await lirePointsDEtape(id, domaines);

  return (
    <div className="grid gap-8 lg:grid-cols-[17rem_1fr]">
      <aside className="flex flex-col gap-5">
        <div className="rounded border border-[var(--anm-hairline)] bg-[var(--anm-paper)] p-4">
          <Link href="/admin" className="font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)] hover:text-[var(--anm-green)]">
            ← Toutes les missions
          </Link>
          <h2 className="mt-2 text-xl">{mission.organisation?.name ?? "Client"}</h2>
          <p className="font-mono text-xs text-[var(--anm-muted)]">
            {mission.reference} · {OFFRES.find((o) => o.id === mission.type)?.nom ?? mission.type}
          </p>
          {mission.control_in_progress ? (
            <p className="mt-2 font-mono text-[0.68rem] uppercase tracking-wide text-[var(--anm-critique)]">
              Contrôle {mission.control_body ?? ""} en cours
              {mission.control_deadline ? ` · échéance ${mission.control_deadline}` : ""}
            </p>
          ) : null}

          <dl className="mt-4 flex flex-col gap-1.5 text-sm">
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--anm-muted)]">Points traités</dt>
              <dd className="font-mono tabular-nums">{pointsTraites} / {pointsTotal}</dd>
            </div>
            <div className="flex justify-between gap-2">
              <dt className="text-[var(--anm-muted)]">Pièces manquantes</dt>
              <dd className="font-mono tabular-nums" style={{ color: manquantes > 0 ? "var(--anm-critique)" : "var(--anm-mineur)" }}>
                {manquantes}
              </dd>
            </div>
          </dl>
        </div>

        <RailEtapes
          missionId={id}
          etapes={etapes}
          ordreActif={estHorsEtape ? -1 : Number(ordre)}
          horsEtape={horsEtape}
        />
      </aside>

      <div className="flex flex-col gap-9">
        {etape ? (
          <BarreEtape missionId={id} ordre={ordre} etape={etape} objectif={objectif} />
        ) : (
          <header className="border-b border-[var(--anm-hairline)] pb-5">
            <p className="font-mono text-xs uppercase tracking-widest text-[var(--anm-majeur)]">
              Points hors étape
            </p>
            <h1 className="mt-2 text-3xl">Ce que la méthode ne couvre pas encore</h1>
            <p className="mt-2 max-w-2xl text-sm text-[var(--anm-muted)]">
              Ces points appartiennent à un domaine qu&apos;aucune des 15 étapes ne prend en charge — les
              15 étapes ont été écrites avant l&apos;ajout du pilier fiscal. Ils sont affichés ici pour
              qu&apos;aucun point ne disparaisse du décompte, en attendant de décider d&apos;une 16ᵉ étape.
            </p>
          </header>
        )}

        {domaines.length > 0 ? <TextesApplicables domaines={domaines} /> : null}

        {points.length > 0 ? <TableauPoints missionId={id} ordre={ordre} points={points} /> : null}

        {etape?.kind === "collecte" ? (
          <ListePieces missionId={id} ordre={ordre} pieces={pieces} />
        ) : null}

        {etape && points.length === 0 && etape.kind !== "collecte" ? (
          <section className="rounded border border-dashed border-[var(--anm-hairline)] p-5 text-sm text-[var(--anm-muted)]">
            Cette étape n&apos;a pas de point de contrôle : elle se travaille en notes, en entretien ou
            en document. Les pièces déposées par le client restent accessibles depuis l&apos;étape 03.
          </section>
        ) : null}

        {etape ? <BlocNotes missionId={id} stepId={etape.step_id} ordre={ordre} notes={notes} /> : null}
      </div>
    </div>
  );
}
