import type { NatureEtape } from "@/lib/types";

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
    quoi: "Ce que tu choisis ici décide de ce que valent les contrôles croisés de l'étape 10.",
    points: [
      "Salariés : couvrir les temps partiels, les nuits, les remplaçants, les derniers embauchés",
      "Sites : au moins un site à effectif tournant et un site isolé",
      "Sous-traitants : ceux facturés sur la période auditée, pas seulement ceux sous contrat",
      "Période : celle qui sera croisée entre planning, pointage, paie et facturation",
    ],
    suite: "Note ton échantillon ci-dessous : c'est lui que tu reporteras à l'étape 10.",
  },
  rapport: {
    titre: "Le rapport",
    quoi: "Deux axes pour le dirigeant, puis le détail classé par criticité (décision 05).",
    points: [
      "Les 5 constats prioritaires viennent du classement de l'étape 12",
      "Chaque constat publié porte sa référence vérifiée — sinon il ne sort pas",
      "Le plan d'actions P1 → P4 est repris depuis l'étape 13",
    ],
    suite: "La génération du PDF reste à construire. En attendant, le contenu est prêt dans les étapes 11 à 13.",
  },
  restitution: {
    titre: "La réunion de restitution",
    quoi: "45 à 60 minutes avec le dirigeant, en face à face.",
    points: [
      "Ouvrir sur les 5 constats prioritaires, pas sur la liste complète",
      "Séparer ce qui l'expose vraiment de ce qui rendra l'entreprise plus solide",
      "Repartir avec le plan d'actions daté et un responsable par ligne",
      "Proposer le suivi conformité si les échéances le justifient",
    ],
    suite: "Note ici ce qui a été dit et ce qui a été accepté.",
  },
};

const EtapeGuidee = ({ kind }: { kind: NatureEtape }) => {
  const g = GUIDES[kind];
  if (!g) return null;

  return (
    <section className="rounded border border-[var(--anm-hairline)] bg-[var(--anm-paper)] p-5">
      <h2 className="text-xl">{g.titre}</h2>
      <p className="mt-1 text-sm text-[var(--anm-muted)]">{g.quoi}</p>
      <ul className="mt-3 flex flex-col gap-1.5 text-sm">
        {g.points.map((p) => (
          <li key={p} className="flex gap-2">
            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-[var(--anm-green)]" />
            {p}
          </li>
        ))}
      </ul>
      {g.suite ? <p className="mt-3 text-sm text-[var(--anm-muted)]">{g.suite}</p> : null}
    </section>
  );
};

export default EtapeGuidee;
