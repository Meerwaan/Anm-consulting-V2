import type { EnTeteMission } from "@/lib/portail/mission";
import type { ReponseEntretien } from "@/lib/types";
import { QUESTIONNAIRE_DIRIGEANT } from "@/content/methode";
import { enregistrerCadrage, enregistrerReponseEntretien } from "@/app/admin/actions";

const champ = "rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm";

/**
 * Étape 1 — l'entretien dirigeant. Ce qu'on note ici décide de tout le reste :
 * un contrôle déjà annoncé change l'urgence et l'ordre des étapes.
 */
interface Props {
  mission: EnTeteMission;
  /** Réponses déjà saisies au questionnaire du pack (06 §4). */
  reponses: ReponseEntretien[];
}

const FicheCadrage = ({ mission, reponses }: Props) => {
  const parCode = new Map(reponses.map((r) => [r.question_code, r]));
  const repondues = QUESTIONNAIRE_DIRIGEANT.filter((q) => parCode.get(q.code)?.reponse).length;

  return (
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

    {/*
      Le questionnaire de la procédure §4, mot pour mot. Il n'existait nulle part : la
      consultante le menait de mémoire ou sur papier, et rien n'en revenait dans l'outil.
      Or ces réponses orientent l'échantillon (étape 5) et les contrôles croisés
      (étape 10) — « quel document fait foi pour les heures ? » décide de ce qu'on croise.
      Chaque question a sa propre ligne d'enregistrement : elle répond dans l'ordre où le
      dirigeant parle, pas dans l'ordre du formulaire.
    */}
    <div className="mt-10 flex flex-wrap items-baseline justify-between gap-3">
      <h2 className="text-xl">Questionnaire d&apos;entretien — procédure §4</h2>
      <p className="font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)]">
        {repondues} / {QUESTIONNAIRE_DIRIGEANT.length} répondues
      </p>
    </div>
    <p className="mt-1 text-sm text-[var(--anm-muted)]">
      Ce qu&apos;il répond ici oriente l&apos;échantillon de l&apos;étape 5 et les contrôles
      croisés de l&apos;étape 10. La colonne de droite sert à noter la pièce à réclamer
      derrière la réponse.
    </p>

    <div className="mt-4 flex flex-col">
      {QUESTIONNAIRE_DIRIGEANT.map((q) => {
        const r = parCode.get(q.code);
        return (
          <form
            key={q.code}
            action={enregistrerReponseEntretien}
            className="border-b border-[var(--anm-hairline)] py-3 last:border-b-0"
          >
            <input type="hidden" name="missionId" value={mission.id} />
            <input type="hidden" name="questionCode" value={q.code} />

            <div className="flex items-baseline gap-2">
              <span className="w-24 shrink-0 font-mono text-[0.64rem] uppercase tracking-wide text-[var(--anm-muted)]">
                {q.theme}
              </span>
              <span className="flex-1 text-sm">{q.question}</span>
              {r?.reponse ? null : (
                <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--anm-muted)]">
                  sans réponse
                </span>
              )}
            </div>

            <div className="mt-2 flex flex-wrap items-end gap-3 pl-0 sm:pl-[6.5rem]">
              <label className="flex min-w-[18rem] flex-[2] flex-col gap-1 text-xs">
                Ce qu&apos;il répond
                <textarea name="reponse" rows={2} defaultValue={r?.reponse ?? ""} className={champ} />
              </label>
              <label className="flex min-w-[12rem] flex-1 flex-col gap-1 text-xs">
                Preuve à demander
                <input
                  name="preuve" defaultValue={r?.preuve ?? ""}
                  placeholder="La pièce qui confirmera"
                  className={champ}
                />
              </label>
              <button
                type="submit"
                className="rounded border border-[var(--anm-green)] px-3 py-1.5 text-sm text-[var(--anm-green)]"
              >
                Enregistrer
              </button>
            </div>
          </form>
        );
      })}
    </div>
  </section>
  );
};

export default FicheCadrage;
