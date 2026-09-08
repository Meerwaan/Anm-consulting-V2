import type { Constat } from "@/lib/types";
import { enregistrerConstat } from "@/app/admin/actions";

const CRITICITES: { valeur: string; label: string; priorite: string }[] = [
  { valeur: "critique", label: "Critique", priorite: "P1 · immédiat" },
  { valeur: "majeur", label: "Majeur", priorite: "P2 · 30 jours" },
  { valeur: "modere", label: "Modéré", priorite: "P3 · 90 jours" },
  { valeur: "mineur", label: "Mineur", priorite: "P4 · amélioration" },
];

const COULEUR: Record<string, string> = {
  critique: "var(--anm-critique)",
  majeur: "var(--anm-majeur)",
  modere: "var(--anm-modere)",
  mineur: "var(--anm-mineur)",
};

const champ = "rounded border border-[var(--anm-hairline)] bg-white px-2 py-1.5 text-sm";
const rempli = (v: string | null | undefined): boolean => Boolean(v && v.trim().length > 0);

/** Pastille « à remplir » posée sur l'intitulé du champ concerné. */
const ARemplir = ({ si }: { si: boolean }) =>
  si ? (
    <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--anm-majeur)]">
      à remplir
    </span>
  ) : null;

/** Rappel du référentiel, sous le champ — jamais dedans. */
const Rappel = ({ texte }: { texte: string | null | undefined }) =>
  texte ? <span className="text-[0.7rem] leading-snug text-[var(--anm-muted)]">{texte}</span> : null;

/** Ce qui manque à un constat pour être publiable, dans l'ordre de la chaîne du pack. */
const cequiManque = (c: Constat): string[] => {
  const manques: string[] = [];
  if (!rempli(c.fact) || c.fact.includes("[fait précis")) manques.push("le fait");
  if (!rempli(c.evidence)) manques.push("la preuve");
  if (!rempli(c.reference)) manques.push("la référence");
  else if (c.reference_checked !== "oui") manques.push("la vérification de la référence");
  if (!rempli(c.recommendation)) manques.push("la recommandation");
  return manques;
};

interface Props {
  missionId: string;
  ordre: string;
  constats: Constat[];
}

/**
 * Écriture des constats.
 *
 * Seuls ceux qui demandent encore du travail sont ouverts. Un constat complet se replie
 * sur une ligne : elle voit d'un coup d'œil ce qui lui reste, au lieu de faire défiler
 * vingt formulaires identiques pour retrouver lesquels sont finis.
 */
const Constats = ({ missionId, ordre, constats }: Props) => {
  const analyses = constats.map((c) => ({ c, manques: cequiManque(c) }));
  const aFinir = analyses.filter((a) => a.manques.length > 0);
  const prets = analyses.filter((a) => a.manques.length === 0);
  const publies = prets.filter((a) => a.c.visible_to_client).length;

  const formulaire = (c: Constat, manques: string[], ouvert: boolean) => (
    <form
      action={enregistrerConstat}
      className={`rounded border bg-[var(--anm-paper)] p-4 ${
        ouvert ? "border-[var(--anm-hairline)]" : "border-transparent pt-2"
      }`}
    >
      <input type="hidden" name="missionId" value={missionId} />
      <input type="hidden" name="ordre" value={ordre} />
      <input type="hidden" name="constatId" value={c.id} />

      <label className="flex flex-col gap-1 text-xs">
        Titre
        <input name="title" defaultValue={c.title} className={`${champ} font-medium`} />
      </label>

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs">
          <span className="flex items-baseline gap-2">
            Le fait constaté <ARemplir si={!rempli(c.fact) || c.fact.includes("[fait précis")} />
          </span>
          <textarea
            name="fact" rows={4} defaultValue={c.fact}
            placeholder="Sur l'échantillon examiné, …"
            className={champ}
          />
          <Rappel texte={c.question_point ? `Point vérifié : ${c.question_point}` : null} />
        </label>
        <label className="flex flex-col gap-1 text-xs">
          <span className="flex items-baseline gap-2">
            La preuve <ARemplir si={!rempli(c.evidence)} />
          </span>
          <textarea
            name="evidence" rows={4} defaultValue={c.evidence ?? ""}
            placeholder="Documents, dates, site, salarié…"
            className={champ}
          />
          <Rappel texte={c.preuve_attendue ? `À examiner : ${c.preuve_attendue}` : null} />
        </label>
      </div>

      <label className="mt-3 flex flex-col gap-1 text-xs">
        <span className="flex items-baseline gap-2">
          La référence — texte, article, date de vérification <ARemplir si={!rempli(c.reference)} />
        </span>
        <textarea name="reference" rows={2} defaultValue={c.reference ?? ""} className={champ} />
      </label>

      <label className="mt-3 flex flex-col gap-1 text-xs">
        <span className="flex items-baseline gap-2">
          La recommandation — action, responsable, délai <ARemplir si={!rempli(c.recommendation)} />
        </span>
        <textarea
          name="recommendation" rows={2} defaultValue={c.recommendation ?? ""}
          placeholder="Il est recommandé de …, sous la responsabilité de …, avant le …"
          className={champ}
        />
      </label>

      <div className="mt-3 grid gap-3 sm:grid-cols-2">
        <label className="flex flex-col gap-1 text-xs">
          Criticité — fixe la priorité
          <select name="severity" defaultValue={c.severity} className={champ}>
            {CRITICITES.map((s) => (
              <option key={s.valeur} value={s.valeur}>{s.label} → {s.priorite}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Axe du rapport
          <select name="nature" defaultValue={c.nature} className={champ}>
            <option value="risque_controle">Risque réel en cas de contrôle</option>
            <option value="amelioration">Axe d&apos;amélioration</option>
          </select>
        </label>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-[var(--anm-hairline)] pt-3">
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="referenceVerifiee" defaultChecked={c.reference_checked === "oui"} />
          Référence vérifiée et datée
          <ARemplir si={rempli(c.reference) && c.reference_checked !== "oui"} />
        </label>

        {c.reference_checked === "oui" ? (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="publier" defaultChecked={c.visible_to_client} />
            Publier au client
          </label>
        ) : (
          <span className="font-mono text-[0.66rem] text-[var(--anm-muted)]">
            publication disponible une fois la référence vérifiée
          </span>
        )}

        {manques.length > 0 ? (
          <span className="text-xs text-[var(--anm-majeur)]">
            manque : {manques.join(", ")}
          </span>
        ) : null}

        <button
          type="submit"
          className="ml-auto rounded bg-[var(--anm-green)] px-3 py-1.5 text-sm font-medium text-[var(--anm-paper)]"
        >
          Enregistrer
        </button>
      </div>
    </form>
  );

  const enTete = (c: Constat) => (
    <span className="flex flex-1 flex-wrap items-baseline justify-between gap-2">
      <span className="flex-1 font-medium">{c.title}</span>
      <span className="font-mono text-[0.66rem] text-[var(--anm-muted)]">
        {c.code_point ?? "—"} · {c.domain}
      </span>
      <span
        className="font-mono text-[0.68rem] uppercase tracking-wide"
        style={{ color: COULEUR[c.severity] }}
      >
        {c.severity} · {c.priority}
        {c.visible_to_client ? " · publié" : ""}
      </span>
    </span>
  );

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl">Constats</h2>
        {constats.length > 0 ? (
          <p className="font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)]">
            {aFinir.length} à finir · {prets.length} prêts · {publies} publiés
          </p>
        ) : null}
      </div>

      {constats.length === 0 ? (
        <p className="mt-3 rounded border border-dashed border-[var(--anm-hairline)] p-5 text-sm text-[var(--anm-muted)]">
          Aucun constat pour l&apos;instant. Ils s&apos;ouvrent depuis les étapes de contrôle :
          marque un point en écart, puis clique « Rédiger le constat » — il arrive ici déjà
          pré-rempli.
        </p>
      ) : null}

      {aFinir.length > 0 ? (
        <>
          <p className="mt-5 border-b border-[var(--anm-hairline)] pb-1 font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-majeur)]">
            À finir — {aFinir.length}
          </p>
          <div className="mt-3 flex flex-col gap-4">
            {aFinir.map(({ c, manques }) => (
              <div key={c.id}>
                <div className="mb-1 flex px-1 text-sm">{enTete(c)}</div>
                {formulaire(c, manques, true)}
              </div>
            ))}
          </div>
        </>
      ) : null}

      {prets.length > 0 ? (
        <>
          <p className="mt-8 border-b border-[var(--anm-hairline)] pb-1 font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-mineur)]">
            Prêts — {prets.length}
          </p>
          <div className="mt-1 flex flex-col">
            {prets.map(({ c, manques }) => (
              <details key={c.id} className="border-b border-[var(--anm-hairline)] last:border-b-0">
                <summary className="flex cursor-pointer list-none items-baseline gap-2 py-2.5 text-sm marker:content-none">
                  <span aria-hidden className="mt-1 text-[var(--anm-muted)]">›</span>
                  {enTete(c)}
                </summary>
                <div className="pb-3">{formulaire(c, manques, false)}</div>
              </details>
            ))}
          </div>
        </>
      ) : null}
    </section>
  );
};

export default Constats;
