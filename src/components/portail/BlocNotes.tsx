import type { Note } from "@/lib/portail/mission";
import { ajouterNote } from "@/app/admin/actions";

interface Props {
  missionId: string;
  stepId: number;
  ordre: string;
  notes: Note[];
}

/** Notes de travail de l'étape. Elles ne sortent jamais au client avant le rapport (décision 04). */
const BlocNotes = ({ missionId, stepId, ordre, notes }: Props) => (
  <section>
    <h2 className="text-xl">Notes de travail</h2>
    <p className="mt-1 text-sm text-[var(--anm-muted)]">
      Pour toi seule. Le client ne les verra pas — le compte rendu final fera foi.
    </p>

    <form action={ajouterNote} className="mt-3 flex flex-col gap-2">
      <input type="hidden" name="missionId" value={missionId} />
      <input type="hidden" name="stepId" value={stepId} />
      <input type="hidden" name="ordre" value={ordre} />
      <textarea
        name="body"
        rows={3}
        required
        placeholder="Ce que tu as constaté, qui tu as vu, ce qu'il reste à vérifier…"
        className="rounded border border-[var(--anm-hairline)] bg-white px-3 py-2 text-sm"
      />
      <button
        type="submit"
        className="self-start rounded border border-[var(--anm-green)] px-3 py-1.5 text-sm text-[var(--anm-green)]"
      >
        Enregistrer la note
      </button>
    </form>

    <ul className="mt-4 flex flex-col gap-2">
      {notes.map((n) => (
        <li key={n.id} className="border-l-2 border-[var(--anm-green)] bg-[var(--anm-mint)] px-3 py-2 text-sm">
          <span className="block font-mono text-[0.66rem] text-[var(--anm-muted)]">
            {new Date(n.created_at).toLocaleString("fr-FR")}
          </span>
          {n.body}
        </li>
      ))}
    </ul>
  </section>
);

export default BlocNotes;
