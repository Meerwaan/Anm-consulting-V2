import { textesDesDomaines, VERIFIE_LE } from "@/content/textes";

interface Props {
  domaines: string[];
}

/**
 * Les textes qui fondent les points de contrôle de l'étape.
 * Affichés pendant la saisie, là où la référence se choisit — pas relégués en annexe :
 * la règle du pack veut une référence vérifiée dans chaque constat.
 */
const TextesApplicables = ({ domaines }: Props) => {
  const textes = textesDesDomaines(domaines);
  if (textes.length === 0) return null;

  return (
    <section>
      <h2 className="text-xl">Textes applicables</h2>
      <p className="mt-1 text-sm text-[var(--anm-muted)]">
        Ce qui fonde les points de cette étape. Vérifié sur Légifrance le{" "}
        {new Date(VERIFIE_LE).toLocaleDateString("fr-FR")} — la numérotation des articles change,
        redate la référence avant de publier un constat.
      </p>

      <ul className="mt-4 flex flex-col">
        {textes.map(({ texte, role }) => (
          <li
            key={texte.code}
            className="border-b border-[var(--anm-hairline)] py-3 last:border-b-0"
          >
            <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
              <a
                href={texte.url}
                target="_blank"
                rel="noreferrer noopener"
                className="font-medium underline decoration-[var(--anm-hairline)] underline-offset-2 hover:text-[var(--anm-green)]"
              >
                {texte.nom}
              </a>
              {texte.portee ? (
                <span className="font-mono text-[0.68rem] text-[var(--anm-muted)]">{texte.portee}</span>
              ) : null}
              {role === "complementaire" ? (
                <span className="font-mono text-[0.62rem] uppercase tracking-wider text-[var(--anm-muted)]">
                  complémentaire
                </span>
              ) : null}
            </div>
            <p className="mt-1 text-sm text-[var(--anm-muted)]">{texte.usage}</p>
          </li>
        ))}
      </ul>
    </section>
  );
};

export default TextesApplicables;
