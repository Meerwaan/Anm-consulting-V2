"use client";

import { useRef, useState } from "react";
import { Check, ClipboardText, Plus, Trash, WarningCircle } from "@phosphor-icons/react";
import { LIBELLES_VERIF, TABLES, type Colonne, type NomTable } from "@/lib/sous-traitance/tables";
import { enregistrerLigne, supprimerLigne } from "@/app/admin/missions/[id]/(outil)/sous-traitance/actions";

/**
 * Tableau de saisie, pensé pour l'iPad.
 *
 * - Chaque ligne s'enregistre seule quand on la quitte : pas de bouton « Enregistrer »
 *   à oublier. L'état de la ligne est affiché (enregistrée, en cours, erreur).
 * - Dates et mois utilisent les sélecteurs natifs de l'iPad.
 * - « Coller depuis Excel » accepte un bloc de lignes copié d'un tableur, dans l'ordre
 *   des colonnes affichées, avec les formats français (1 234,50 · 31/03/2026 · 03/2026).
 */

export interface LigneInitiale {
  /** Clé en base (identifiant, ou mois pour la paie). */
  cle: string;
  valeurs: Record<string, string>;
}

interface Ligne {
  uid: string;
  cle: string | null;
  valeurs: Record<string, string>;
  etat: "propre" | "modifiee" | "enregistrement" | "erreur";
  erreur?: string;
}

interface Props {
  missionId: string;
  table: NomTable;
  sousTraitantId?: string;
  lignes: LigneInitiale[];
  /** Pour une colonne « facture » : les factures du sous-traitant. */
  factures?: { id: string; libelle: string }[];
  titreVide: string;
  libelleAjout?: string;
  /** Vue complémentaire : libellé en lecture seule de chaque ligne, par clé. */
  libelles?: Record<string, string>;
}

let compteur = 0;
const nouvelUid = () => `n${Date.now()}-${compteur++}`;

const Cellule = ({
  colonne,
  valeur,
  onChange,
  onValider,
  factures,
  etiquette,
}: {
  colonne: Colonne;
  valeur: string;
  onChange: (v: string) => void;
  onValider: () => void;
  factures?: { id: string; libelle: string }[];
  etiquette: string;
}) => {
  const base = "h-11 w-full rounded-[4px] border border-filet bg-papier px-2 text-meta text-encre outline-none transition-colors focus:border-vert";
  if (colonne.type === "verif") {
    return (
      <select
        aria-label={etiquette}
        value={valeur}
        onChange={(e) => {
          onChange(e.target.value);
          onValider();
        }}
        className={base}
      >
        <option value="">—</option>
        {["oui", "non", "a_verifier", "na"].map((v) => (
          <option key={v} value={v}>
            {LIBELLES_VERIF[v]}
          </option>
        ))}
      </select>
    );
  }
  if (colonne.type === "choix") {
    return (
      <select
        aria-label={etiquette}
        value={valeur}
        onChange={(e) => {
          onChange(e.target.value);
          onValider();
        }}
        className={base}
      >
        <option value="">—</option>
        {(colonne.options ?? []).map((o) => (
          <option key={o.v} value={o.v}>
            {o.l}
          </option>
        ))}
      </select>
    );
  }
  if (colonne.type === "facture") {
    return (
      <select
        aria-label={etiquette}
        value={valeur}
        onChange={(e) => {
          onChange(e.target.value);
          onValider();
        }}
        className={base}
      >
        <option value="">Aucune</option>
        {(factures ?? []).map((f) => (
          <option key={f.id} value={f.id}>
            {f.libelle}
          </option>
        ))}
      </select>
    );
  }
  const numerique = colonne.type === "heures" || colonne.type === "euros" || colonne.type === "nombre";
  return (
    <input
      aria-label={etiquette}
      type={colonne.type === "mois" ? "month" : colonne.type === "date" ? "date" : "text"}
      inputMode={numerique ? "decimal" : undefined}
      value={valeur}
      onChange={(e) => onChange(e.target.value)}
      onBlur={onValider}
      className={`${base} ${numerique ? "text-right tabular-nums" : ""}`}
    />
  );
};

const TableauSaisie = ({ missionId, table, sousTraitantId, lignes: initiales, factures, titreVide, libelleAjout, libelles }: Props) => {
  const def = TABLES[table];
  const complement = Boolean(def.complement);
  const [lignes, setLignes] = useState<Ligne[]>(() => initiales.map((l) => ({ uid: l.cle, cle: l.cle, valeurs: l.valeurs, etat: "propre" })));
  const [aSupprimer, setASupprimer] = useState<string | null>(null);
  const [collage, setCollage] = useState<string | null>(null);
  const [retourCollage, setRetourCollage] = useState<string | null>(null);
  const courantes = useRef(lignes);
  courantes.current = lignes;
  // Enregistrements d'une même ligne mis en file : sans cela, deux champs quittés coup sur coup
  // sur une ligne neuve partaient avant que la première réponse donne son identifiant, et
  // créaient la ligne deux fois. Chaque modification incrémente une version ; on n'envoie que
  // si la version courante n'est pas déjà enregistrée.
  const file = useRef(new Map<string, Promise<boolean>>());
  const version = useRef(new Map<string, number>());
  const enregistree = useRef(new Map<string, number>());
  const cles = useRef(new Map<string, string | null>(initiales.map((l) => [l.cle, l.cle])));

  const maj = (uid: string, champs: Partial<Ligne>) => setLignes((l) => l.map((x) => (x.uid === uid ? { ...x, ...champs } : x)));

  const enregistrerMaintenant = async (uid: string): Promise<boolean> => {
    // Laisser React appliquer la dernière frappe : un select change la valeur puis enregistre.
    await new Promise((r) => setTimeout(r, 0));
    const v = version.current.get(uid) ?? 0;
    if ((enregistree.current.get(uid) ?? 0) >= v) return true;
    const ligne = courantes.current.find((x) => x.uid === uid);
    if (!ligne) return true;
    if (Object.values(ligne.valeurs).every((x) => !x)) return true;
    maj(uid, { etat: "enregistrement", erreur: undefined });
    const cle = cles.current.get(uid) ?? undefined;
    const res = await enregistrerLigne({ missionId, table, sousTraitantId, cle, ligne: ligne.valeurs });
    if (!res.ok) {
      maj(uid, { etat: "erreur", erreur: res.erreur });
      return false;
    }
    cles.current.set(uid, res.valeur.cle);
    enregistree.current.set(uid, v);
    const aJour = (version.current.get(uid) ?? 0) === v;
    // La ligne revient normalisée : un mois collé « 03/2026 » devient lisible par le sélecteur.
    maj(
      uid,
      aJour
        ? { etat: "propre", cle: res.valeur.cle, valeurs: { ...ligne.valeurs, ...res.valeur.valeurs } }
        : { etat: "modifiee", cle: res.valeur.cle },
    );
    return true;
  };

  const enregistrer = (uid: string): Promise<boolean> => {
    const suivant = (file.current.get(uid) ?? Promise.resolve(true)).then(() => enregistrerMaintenant(uid));
    file.current.set(uid, suivant);
    return suivant;
  };

  const changer = (uid: string, cle: string, v: string) => {
    version.current.set(uid, (version.current.get(uid) ?? 0) + 1);
    setLignes((l) => l.map((x) => (x.uid === uid ? { ...x, valeurs: { ...x.valeurs, [cle]: v }, etat: "modifiee" } : x)));
  };

  const ajouter = () => {
    const valeurs: Record<string, string> = {};
    // Paie : la ligne suivante propose le mois suivant le dernier saisi.
    const colMois = def.colonnes.find((c) => c.type === "mois");
    const dernier = [...lignes].reverse().find((l) => colMois && l.valeurs[colMois.cle]);
    if (colMois && dernier) {
      const [a, m] = dernier.valeurs[colMois.cle].split("-").map(Number);
      const d = new Date(Date.UTC(a, m, 1));
      valeurs[colMois.cle] = d.toISOString().slice(0, 7);
    }
    const uid = nouvelUid();
    version.current.set(uid, 1);
    setLignes((l) => [...l, { uid, cle: null, valeurs, etat: "modifiee" }]);
  };

  const supprimer = async (uid: string) => {
    const ligne = lignes.find((x) => x.uid === uid);
    setASupprimer(null);
    if (!ligne) return;
    // Attendre un enregistrement en cours : sinon la ligne pourrait être créée après sa suppression.
    await (file.current.get(uid) ?? Promise.resolve(true));
    const cle = cles.current.get(uid);
    if (!cle) {
      setLignes((l) => l.filter((x) => x.uid !== uid));
      return;
    }
    maj(uid, { etat: "enregistrement" });
    const res = await supprimerLigne({ missionId, table, cle });
    if (!res.ok) return maj(uid, { etat: "erreur", erreur: res.erreur });
    setLignes((l) => l.filter((x) => x.uid !== uid));
  };

  const collerLignes = async () => {
    if (!collage) return;
    const lignesTexte = collage.split(/\r?\n/).filter((l) => l.trim());
    const nouvelles: Ligne[] = lignesTexte.map((t) => {
      const cellules = t.split("\t");
      const valeurs: Record<string, string> = {};
      def.colonnes.forEach((c, i) => {
        if (c.type !== "facture") valeurs[c.cle] = (cellules[i] ?? "").trim();
      });
      const uid = nouvelUid();
      version.current.set(uid, 1);
      return { uid, cle: null, valeurs, etat: "modifiee" as const };
    });
    setLignes((l) => [...l, ...nouvelles]);
    setCollage(null);
    let erreurs = 0;
    for (const n of nouvelles) {
      courantes.current = [...courantes.current.filter((x) => x.uid !== n.uid), n];
      if (!(await enregistrer(n.uid))) erreurs += 1;
    }
    setRetourCollage(
      erreurs
        ? `${nouvelles.length - erreurs} ligne${nouvelles.length - erreurs > 1 ? "s" : ""} enregistrée${nouvelles.length - erreurs > 1 ? "s" : ""}, ${erreurs} à corriger (en rouge ci-dessus).`
        : `${nouvelles.length} ligne${nouvelles.length > 1 ? "s" : ""} ajoutée${nouvelles.length > 1 ? "s" : ""}.`,
    );
  };

  const largeurTotale = def.colonnes.reduce((t, c) => t + c.largeur, 0) + (complement ? (def.largeurLigne ?? 12) : 5);

  return (
    <div className="grid min-w-0 gap-3">
      {lignes.length === 0 ? (
        <p className="rounded-[5px] border border-dashed border-filet-2 bg-papier px-4 py-5 text-meta text-gris">{titreVide}</p>
      ) : (
        <div className="relative -mx-1 max-w-[calc(100%+0.5rem)] overflow-x-auto px-1">
          <table className="w-full border-separate border-spacing-x-1 border-spacing-y-1" style={{ minWidth: `${largeurTotale}rem` }}>
            <thead>
              <tr>
                {complement ? (
                  <th scope="col" className="px-1 pb-1 text-left align-bottom text-note font-medium text-encre-2" style={{ minWidth: "9rem" }}>
                    {def.titreLigne ?? "Vente"}
                  </th>
                ) : null}
                {def.colonnes.map((c) => (
                  <th
                    key={c.cle}
                    scope="col"
                    className="px-1 pb-1 text-left align-bottom text-note font-medium text-encre-2"
                    style={{ minWidth: `${c.largeur}rem` }}
                  >
                    {c.libelle}
                    {c.aide ? <span className="block font-normal text-gris">{c.aide}</span> : null}
                  </th>
                ))}
                <th scope="col" className="w-20">
                  <span className="sr-only">État et suppression</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((l) => (
                <FragmentLigne key={l.uid}>
                  <tr>
                    {complement ? (
                      <th scope="row" className="px-1 text-left align-middle text-meta font-normal text-encre">
                        {libelles?.[l.cle ?? ""] ?? "—"}
                      </th>
                    ) : null}
                    {def.colonnes.map((c) => (
                      <td key={c.cle}>
                        <Cellule
                          colonne={c}
                          valeur={l.valeurs[c.cle] ?? ""}
                          onChange={(v) => changer(l.uid, c.cle, v)}
                          onValider={() => enregistrer(l.uid)}
                          factures={factures}
                          etiquette={c.libelle}
                        />
                      </td>
                    ))}
                    <td className="whitespace-nowrap">
                      <div className="flex items-center justify-end gap-1">
                        <span className="flex size-6 items-center justify-center" aria-live="polite">
                          {l.etat === "propre" && l.cle ? <Check size={16} className="text-mineur" aria-label="Enregistrée" /> : null}
                          {l.etat === "enregistrement" ? (
                            <span className="size-3 animate-pulse rounded-full bg-brume" aria-label="Enregistrement" />
                          ) : null}
                          {l.etat === "erreur" ? <WarningCircle size={18} className="text-critique" aria-label="Erreur" /> : null}
                        </span>
                        {complement ? null : aSupprimer === l.uid ? (
                          <button type="button" onClick={() => supprimer(l.uid)} className="h-11 px-1 text-note font-medium text-critique">
                            Supprimer ?
                          </button>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setASupprimer(l.uid)}
                            aria-label="Supprimer la ligne"
                            className="flex size-11 items-center justify-center text-gris hover:text-critique"
                          >
                            <Trash size={18} aria-hidden />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                  {l.etat === "erreur" && l.erreur ? (
                    <tr>
                      <td colSpan={def.colonnes.length + (complement ? 2 : 1)} className="px-1 pb-2 text-meta text-critique" role="alert">
                        {l.erreur}
                      </td>
                    </tr>
                  ) : null}
                </FragmentLigne>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {complement ? null : (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={ajouter}
            className="flex min-h-11 items-center gap-2 rounded-[5px] border border-encre px-4 text-meta font-medium text-encre transition-colors hover:bg-encre hover:text-papier"
          >
            <Plus size={16} aria-hidden />
            {libelleAjout}
          </button>
          <button
            type="button"
            onClick={() => {
              setCollage(collage === null ? "" : null);
              setRetourCollage(null);
            }}
            aria-expanded={collage !== null}
            className="flex min-h-11 items-center gap-2 rounded-[5px] px-4 text-meta text-encre-2 underline-offset-4 hover:underline"
          >
            <ClipboardText size={16} aria-hidden />
            Coller depuis Excel
          </button>
        </div>
      )}

      {collage !== null ? (
        <div className="flex flex-col gap-2 rounded-[5px] border border-filet bg-papier p-4">
          <label htmlFor={`coller-${table}-${sousTraitantId ?? ""}`} className="text-meta text-encre">
            Colle ici des lignes copiées d’Excel, colonnes dans cet ordre :{" "}
            <strong className="font-medium">
              {def.colonnes
                .filter((c) => c.type !== "facture")
                .map((c) => c.libelle)
                .join(" · ")}
            </strong>
          </label>
          <textarea
            id={`coller-${table}-${sousTraitantId ?? ""}`}
            value={collage}
            onChange={(e) => setCollage(e.target.value)}
            rows={5}
            className="w-full rounded-[4px] border border-gris/60 bg-fond p-3 font-mono text-note text-encre"
          />
          <div>
            <button
              type="button"
              onClick={collerLignes}
              disabled={!collage.trim()}
              className="min-h-11 rounded-[5px] bg-encre px-5 text-meta font-medium text-papier disabled:opacity-50"
            >
              Ajouter ces lignes
            </button>
          </div>
        </div>
      ) : null}
      {retourCollage ? (
        <p role="status" className="text-meta text-encre-2">
          {retourCollage}
        </p>
      ) : null}
    </div>
  );
};

const FragmentLigne = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export default TableauSaisie;
