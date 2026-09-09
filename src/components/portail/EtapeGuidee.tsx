import type { NatureEtape } from "@/lib/types";
import { RESTITUTION_MINUTES, ORDRE_DU_JOUR_RESTITUTION, TRANCHES_ECHANTILLON, PROFILS_ECHANTILLON } from "@/content/methode";

interface Guide {
  titre: string;
  quoi: string;
  points: string[];
  suite?: string;
}

/**
 * Étapes qui n'ont pas encore de surface propre.
 * Chacune dit ce qu'on y fait et ce qu'elle alimente — plutôt qu'un même encadré vide
 * répété d'une étape à l'autre.
 */
const GUIDES: Partial<Record<NatureEtape, Guide>> = {
  echantillon: {
    titre: "Choisir l'échantillon",
    quoi: "Ce que tu choisis ici décide de ce que valent les contrôles croisés de l'étape 10, et c'est ce qui donne au diagnostic sa valeur probante.",
    points: [
      "Sous-traitants : ceux facturés sur la période auditée, pas seulement ceux sous contrat",
      "Période : celle qui sera croisée entre planning, pointage, paie et facturation",
      "Si une anomalie sérieuse apparaît, élargir l'échantillon jusqu'à comprendre si elle est isolée ou systémique",
    ],
    suite: "Note ci-dessous ton échantillon ET la justification de ta sélection : la procédure demande de la conserver au dossier de mission.",
  },
  rapport: {
    titre: "Le rapport",
    quoi: "Deux axes pour le dirigeant, puis le détail classé par criticité (décision 05).",
    points: [
      "Les constats mis en avant viennent du classement de l'étape 12",
      "Chaque constat publié porte sa référence vérifiée — sinon il ne sort pas",
      "Le plan d'actions P1 → P4 est repris depuis l'étape 13",
    ],
    suite: "La génération du PDF reste à construire. En attendant, le contenu est prêt dans les étapes 11 à 13.",
  },
  restitution: {
    titre: "La réunion de restitution",
    quoi: `${RESTITUTION_MINUTES.min} à ${RESTITUTION_MINUTES.max} minutes avec le dirigeant, en face à face.`,
    points: [],
    suite: "Note ici ce qui a été dit et ce qui a été accepté.",
  },
};

interface Props {
  kind: NatureEtape;
  /** Effectif de l'entreprise, saisi à l'étape 2. Sert à situer la taille d'échantillon. */
  effectif?: number | null;
}

const puce = (
  <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--anm-green)]" />
);

const EtapeGuidee = ({ kind, effectif = null }: Props) => {
  const g = GUIDES[kind];
  if (!g) return null;

  return (
    <section className="rounded border border-[var(--anm-hairline)] bg-[var(--anm-paper)] p-5">
      <h2 className="text-xl">{g.titre}</h2>
      <p className="mt-1 text-sm text-[var(--anm-muted)]">{g.quoi}</p>

      {kind === "echantillon" ? (
        <>
          {/*
            Les tailles par tranche d'effectif de la procédure §5. Elles étaient absentes
            de l'écran alors que l'effectif est saisi à l'étape 2 : sur une mission à 60
            salariés, rien ne disait qu'il en faut 12 à 20. On AFFICHE la règle du pack et
            on met en évidence la tranche correspondante — on ne calcule pas un nombre à sa
            place, et surtout on ne borne pas « très petite entreprise », que le pack ne
            chiffre pas.
          */}
          <p className="mt-5 border-b border-[var(--anm-hairline)] pb-1 font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)]">
            Combien de dossiers salariés — procédure §5
            {effectif ? ` · effectif enregistré : ${effectif}` : ""}
          </p>
          <ul className="mt-1 flex flex-col">
            {TRANCHES_ECHANTILLON.map((t) => {
              const concernee =
                effectif !== null &&
                t.min !== null &&
                effectif >= t.min &&
                (t.max === null || effectif <= t.max);
              return (
                <li
                  key={t.libelle}
                  className={`border-b border-[var(--anm-hairline)] py-1.5 text-sm last:border-b-0 ${
                    concernee ? "font-medium" : "text-[var(--anm-muted)]"
                  }`}
                >
                  {t.libelle} : {t.cible}
                  {concernee ? (
                    <span className="ml-2 font-mono text-[0.64rem] uppercase tracking-wide text-[var(--anm-green)]">
                      ta tranche
                    </span>
                  ) : null}
                </li>
              );
            })}
          </ul>
          {effectif === null ? (
            <p className="mt-2 text-[0.7rem] text-[var(--anm-muted)]">
              L&apos;effectif n&apos;est pas renseigné — il se saisit à l&apos;étape 2.
            </p>
          ) : null}

          <p className="mt-5 border-b border-[var(--anm-hairline)] pb-1 font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)]">
            À inclure dans tous les cas — {PROFILS_ECHANTILLON.length} profils
          </p>
          <ul className="mt-1 flex flex-col gap-1 text-sm">
            {PROFILS_ECHANTILLON.map((p) => (
              <li key={p} className="flex gap-2">{puce}{p}</li>
            ))}
          </ul>
        </>
      ) : null}

      {kind === "restitution" ? (
        <>
          {/* L'ordre du jour minuté de la procédure §11, qui n'était nulle part. */}
          <ul className="mt-4 flex flex-col">
            {ORDRE_DU_JOUR_RESTITUTION.map((b) => (
              <li
                key={b.quoi}
                className="flex gap-3 border-b border-[var(--anm-hairline)] py-1.5 text-sm last:border-b-0"
              >
                <span className="w-14 shrink-0 font-mono text-[0.7rem] tabular-nums text-[var(--anm-muted)]">
                  {b.minutes} min
                </span>
                <span>{b.quoi}</span>
              </li>
            ))}
          </ul>
        </>
      ) : null}

      {g.points.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-1.5 text-sm">
          {g.points.map((p) => (
            <li key={p} className="flex gap-2">{puce}{p}</li>
          ))}
        </ul>
      ) : null}

      {g.suite ? <p className="mt-3 text-sm text-[var(--anm-muted)]">{g.suite}</p> : null}
    </section>
  );
};

export default EtapeGuidee;
