import type { EnTeteMission } from "@/lib/portail/mission";
import { enregistrerCadrage } from "@/app/admin/actions";

const champ = "rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm";

/**
 * Étape 1 — l'entretien dirigeant. Ce qu'on note ici décide de tout le reste :
 * un contrôle déjà annoncé change l'urgence et l'ordre des étapes.
 */
const FicheCadrage = ({ mission }: { mission: EnTeteMission }) => (
  <section>
    <h2 className="text-xl">Ce que dit le dirigeant</h2>
    <p className="mt-1 text-sm text-[var(--anm-muted)]">
      Contexte, contrôle en cours, ce qui l&apos;inquiète. Ces réponses remontent en haut de
      l&apos;écran pendant toute la mission.
    </p>

    <form action={enregistrerCadrage} className="mt-4 flex flex-col gap-3">
      <input type="hidden" name="missionId" value={mission.id} />

      <label className="flex items-center gap-2 text-sm">
        <input type="checkbox" name="controleEnCours" defaultChecked={mission.control_in_progress} />
        Un contrôle est déjà annoncé ou en cours
      </label>

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs">
          Organisme
          <input name="organisme" defaultValue={mission.control_body ?? ""} placeholder="CNAPS, URSSAF, DGFiP…" className={champ} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Échéance du contrôle
          <input name="echeance" type="date" defaultValue={mission.control_deadline ?? ""} className={champ} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Date d&apos;intervention
          <input name="intervention" type="date" defaultValue={mission.intervention_on ?? ""} className={champ} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs">
        Points sensibles annoncés — ce qu&apos;il craint, ce qu&apos;il sait déjà bancal
        <textarea name="pointsSensibles" rows={3} defaultValue={mission.initial_hotspots ?? ""} className={champ} />
      </label>

      <label className="flex w-full max-w-xs flex-col gap-1 text-xs">
        Date de restitution prévue
        <input name="restitution" type="date" defaultValue={mission.restitution_on ?? ""} className={champ} />
      </label>

      <button type="submit" className="self-start rounded bg-[var(--anm-green)] px-4 py-2 text-sm font-medium text-[var(--anm-paper)]">
        Enregistrer le cadrage
      </button>
    </form>
  </section>
);

export default FicheCadrage;
