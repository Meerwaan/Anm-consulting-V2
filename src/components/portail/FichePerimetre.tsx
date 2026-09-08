import type { EnTeteMission } from "@/lib/portail/mission";
import { enregistrerPerimetre } from "@/app/admin/actions";

const champ = "rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm";

/**
 * Étape 2 — le périmètre.
 * L'effectif n'est pas décoratif : il décide de règles réelles, comme la mise à jour
 * annuelle du DUERP qui ne s'impose qu'à partir de onze salariés.
 */
const FichePerimetre = ({ mission }: { mission: EnTeteMission }) => (
  <section>
    <h2 className="text-xl">Le périmètre audité</h2>
    <p className="mt-1 text-sm text-[var(--anm-muted)]">
      L&apos;effectif commande des règles réelles — le DUERP annuel, par exemple, ne s&apos;impose
      qu&apos;à partir de onze salariés. Le renseigner évite des alertes fausses.
    </p>

    <form action={enregistrerPerimetre} className="mt-4 flex flex-col gap-3">
      <input type="hidden" name="missionId" value={mission.id} />
      <input type="hidden" name="orgId" value={mission.organisation?.id ?? mission.org_id} />

      <div className="grid gap-3 sm:grid-cols-3">
        <label className="flex flex-col gap-1 text-xs">
          Effectif
          <input name="effectif" type="number" min={0} defaultValue={mission.organisation?.headcount ?? ""} className={champ} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Établissements
          <input name="etablissements" type="number" min={0} defaultValue={mission.organisation?.establishments ?? ""} className={champ} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Sites clients gardés
          <input name="sitesClients" type="number" min={0} defaultValue={mission.organisation?.client_sites ?? ""} className={champ} />
        </label>
      </div>

      <label className="flex flex-col gap-1 text-xs">
        Périmètre retenu — période auditée, ce qui est inclus, ce qui est explicitement exclu
        <textarea name="perimetre" rows={3} defaultValue={mission.scope ?? ""} className={champ} />
      </label>

      <button type="submit" className="self-start rounded bg-[var(--anm-green)] px-4 py-2 text-sm font-medium text-[var(--anm-paper)]">
        Enregistrer le périmètre
      </button>
    </form>
  </section>
);

export default FichePerimetre;
