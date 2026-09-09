import type { Constat } from "@/lib/types";
import { ajouterConstatLibre, enregistrerConstat, supprimerConstat } from "@/app/admin/actions";
import { CRITICITES, DOMAINES, ESCALADES, cequiManque, jour } from "@/content/constat";
import { FORMULE_CONSTAT, REGLE_OR } from "@/content/methode";

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
  // Sur tous les constats, pas seulement les prêts : un constat incomplet resté coché
  // visible existe bel et bien, et sa ligne l'affiche. L'en-tête ne peut pas dire zéro.
  const publies = constats.filter((c) => c.visible_to_client).length;

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
          Le risque encouru — ce que le dirigeant retient <ARemplir si={!rempli(c.risk)} />
        </span>
        <textarea
          name="risk" rows={2} defaultValue={c.risk ?? ""}
          placeholder={FORMULE_CONSTAT.risque}
          className={champ}
        />
        <span className="text-[0.7rem] leading-snug text-[var(--anm-muted)]">
          Requalification, redressement, sanction, retrait d&apos;autorisation… La criticité
          dit dans quel ordre traiter ; le risque dit ce qu&apos;il encourt. Formulé sous
          réserve de confirmation de la règle applicable — la qualification juridique revient
          à l&apos;avocat ou à l&apos;expert-comptable.
        </span>
      </label>

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
          <span className="flex items-baseline gap-2">
            Escalade — qui doit reprendre le sujet
            {c.escalation ? null : (
              <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--anm-muted)]">
                à trancher
              </span>
            )}
          </span>
          <select name="escalation" defaultValue={c.escalation ?? ""} className={champ}>
            <option value="">— pas encore tranché</option>
            {ESCALADES.map((e) => (
              <option key={e.valeur} value={e.valeur}>{e.libelle}</option>
            ))}
          </select>
        </label>
        <label className="flex flex-col gap-1 text-xs">
          Escalade — pourquoi, en une ligne
          <input
            name="escalationNote" defaultValue={c.escalation_note ?? ""}
            placeholder="Ce qui dépasse le périmètre : interprétation, contentieux, requalification…"
            className={champ}
          />
        </label>
      </div>
      <p className="mt-1 text-[0.7rem] leading-snug text-[var(--anm-muted)]">
        Sixième maillon de la chaîne du Manuel de terrain. C&apos;est la frontière de ton
        périmètre : « je ne remplace ni l&apos;avocat ni l&apos;expert-comptable ». Le rapport
        en tire la liste des sujets à faire valider.
      </p>

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

        <span className="font-mono text-[0.66rem] text-[var(--anm-muted)]">
          {c.reference_checked === "oui" && c.reference_checked_on
            ? `référence vérifiée le ${jour(c.reference_checked_on)} · `
            : ""}
          modifié le {jour(c.updated_at)}
        </span>

        {c.reference_checked === "oui" ? (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="publier" defaultChecked={c.visible_to_client} />
            Prêt à montrer au client
            <span className="font-mono text-[0.6rem] uppercase tracking-wider text-[var(--anm-muted)]">
              espace client pas encore ouvert
            </span>
          </label>
        ) : (
          <span className="font-mono text-[0.66rem] text-[var(--anm-muted)]">
            disponible une fois la référence vérifiée
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

  /**
   * La suppression vit hors du formulaire d'édition : deux formulaires imbriqués ne
   * sont pas valides en HTML, et le repli oblige à un second geste volontaire.
   */
  const suppression = (c: Constat) => (
    <details className="mt-2">
      <summary className="cursor-pointer font-mono text-[0.64rem] uppercase tracking-wider text-[var(--anm-muted)]">
        Supprimer ce constat
      </summary>
      <form action={supprimerConstat} className="mt-2 flex flex-wrap items-center gap-3 text-sm">
        <input type="hidden" name="missionId" value={missionId} />
        <input type="hidden" name="ordre" value={ordre} />
        <input type="hidden" name="constatId" value={c.id} />
        <span className="text-[var(--anm-muted)]">
          Le constat et l&apos;action générée depuis lui disparaissent
          {c.control_point_id ? ", et le point de contrôle redevient disponible" : ""}. C&apos;est
          définitif.
        </span>
        <button
          type="submit"
          className="rounded border border-[var(--anm-critique)] px-3 py-1 text-xs"
          style={{ color: "var(--anm-critique)" }}
        >
          Supprimer définitivement
        </button>
      </form>
    </details>
  );

  /**
   * Bandeau d'identification. Le titre n'y figure que si le formulaire est replié :
   * ouvert, c'est le champ « Titre » qui le porte, et l'afficher deux fois donne
   * l'impression de deux constats.
   */
  const enTete = (c: Constat, replieAuDepart = false) => (
    <span className="flex flex-1 flex-wrap items-baseline justify-between gap-2">
      {replieAuDepart ? (
        <span className="flex-1 font-medium group-open:hidden">{c.title}</span>
      ) : (
        <span className="flex-1" aria-hidden />
      )}
      <span className="font-mono text-[0.66rem] text-[var(--anm-muted)]">
        {c.code_point ?? "hors grille"} · {c.domain}
      </span>
      <span
        className="font-mono text-[0.68rem] uppercase tracking-wide"
        style={{ color: COULEUR[c.severity] }}
      >
        {c.severity} · {c.priority}
        {c.visible_to_client ? " · prêt pour le client" : ""}
      </span>
    </span>
  );

  return (
    <section>
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <h2 className="text-xl">Constats</h2>
        {constats.length > 0 ? (
          <p className="font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)]">
            {aFinir.length} à finir · {prets.length} prêts · {publies} pour le client
          </p>
        ) : null}
      </div>
      {/* La règle d'or (01 Bible §1), affichée là où elle s'applique : c'est elle que
          reprend le contrôle de complétude, maillon par maillon. */}
      <p className="mt-1 font-mono text-[0.66rem] uppercase tracking-widest text-[var(--anm-muted)]">
        {REGLE_OR.join(" → ")}
      </p>

      {constats.length === 0 ? (
        <p className="mt-3 rounded border border-dashed border-[var(--anm-hairline)] p-5 text-sm text-[var(--anm-muted)]">
          Aucun constat pour l&apos;instant. La voie normale part des étapes de contrôle :
          marque un point en écart, puis clique « Rédiger le constat » — il arrive ici déjà
          pré-rempli, avec la référence du point. Pour ce que la grille ne prévoit pas, le
          formulaire en bas de page ouvre un constat hors grille.
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
                <div className="mb-1 flex px-1 text-sm">{enTete(c, false)}</div>
                {formulaire(c, manques, true)}
                <div className="px-4">{suppression(c)}</div>
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
              <details key={c.id} className="group border-b border-[var(--anm-hairline)] last:border-b-0">
                <summary className="flex cursor-pointer list-none items-baseline gap-2 py-2.5 text-sm marker:content-none">
                  <span aria-hidden className="mt-1 text-[var(--anm-muted)] group-open:rotate-90">›</span>
                  {enTete(c, true)}
                </summary>
                <div className="pb-3">
                  {formulaire(c, manques, false)}
                  <div className="px-4">{suppression(c)}</div>
                </div>
              </details>
            ))}
          </div>
        </>
      ) : null}

      <details className="mt-8 rounded border border-dashed border-[var(--anm-hairline)] p-4">
        <summary className="cursor-pointer text-sm font-medium">
          Écrire un constat qui ne vient d&apos;aucun point de contrôle
        </summary>
        <p className="mt-1 text-sm text-[var(--anm-muted)]">
          La grille couvre ce qu&apos;on sait chercher. Une pratique observée sur site, une
          organisation, un propos du dirigeant : ça n&apos;a pas de case et ça doit quand même
          entrer au rapport. Le constat s&apos;ouvre vide, à compléter comme les autres.
        </p>
        <form action={ajouterConstatLibre} className="mt-3 grid gap-2 sm:grid-cols-4">
          <input type="hidden" name="missionId" value={missionId} />
          <input type="hidden" name="ordre" value={ordre} />
          <label className="flex flex-col gap-1 text-xs sm:col-span-2">
            L&apos;intitulé du constat
            <input name="title" required placeholder="Ce qu'on a vu, en quelques mots" className={champ} />
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Domaine
            <select name="domaine" defaultValue="operationnel" className={champ}>
              {DOMAINES.map((d) => (
                <option key={d.valeur} value={d.valeur}>{d.libelle}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs">
            Criticité
            <select name="severity" defaultValue="majeur" className={champ}>
              {CRITICITES.map((s) => (
                <option key={s.valeur} value={s.valeur}>{s.label} → {s.priorite}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-xs sm:col-span-3">
            Axe du rapport
            <select name="nature" defaultValue="risque_controle" className={champ}>
              <option value="risque_controle">Risque réel en cas de contrôle</option>
              <option value="amelioration">Axe d&apos;amélioration</option>
            </select>
          </label>
          <button
            type="submit"
            className="self-end rounded bg-[var(--anm-green)] px-3 py-1.5 text-sm font-medium text-[var(--anm-paper)]"
          >
            Ouvrir le constat
          </button>
        </form>
      </details>
    </section>
  );
};

export default Constats;
