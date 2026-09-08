import type { AvancementEtape } from "@/lib/types";
import { definirStatutEtape } from "@/app/admin/actions";

const CHOIX: { valeur: string; libelle: string }[] = [
  { valeur: "todo", libelle: "À faire" },
  { valeur: "doing", libelle: "En cours" },
  { valeur: "done", libelle: "Faite" },
  { valeur: "na", libelle: "Sans objet" },
];

interface Props {
  missionId: string;
  ordre: string;
  etape: AvancementEtape;
  objectif: string | null;
}

const BarreEtape = ({ missionId, ordre, etape, objectif }: Props) => (
  <header className="border-b border-[var(--anm-hairline)] pb-5">
    <p className="font-mono text-xs uppercase tracking-widest text-[var(--anm-muted)]">
      Étape {String(etape.sort_order).padStart(2, "0")} sur 15
      {etape.phase_id ? ` · phase ${etape.phase_id}` : ""}
    </p>
    <h1 className="mt-2 text-3xl">{etape.name}</h1>
    {objectif ? <p className="mt-2 max-w-2xl text-sm text-[var(--anm-muted)]">{objectif}</p> : null}

    <div className="mt-4 flex flex-wrap items-center gap-1.5">
      {CHOIX.map((c) => (
        <form key={c.valeur} action={definirStatutEtape}>
          <input type="hidden" name="missionId" value={missionId} />
          <input type="hidden" name="stepId" value={etape.step_id} />
          <input type="hidden" name="ordre" value={ordre} />
          <input type="hidden" name="statut" value={c.valeur} />
          <button
            type="submit"
            aria-pressed={etape.status === c.valeur}
            className={`rounded border px-2.5 py-1 text-xs ${
              etape.status === c.valeur
                ? "border-[var(--anm-green)] bg-[var(--anm-mint)] font-medium"
                : "border-[var(--anm-hairline)] text-[var(--anm-muted)]"
            }`}
          >
            {c.libelle}
          </button>
        </form>
      ))}
    </div>
  </header>
);

export default BarreEtape;
