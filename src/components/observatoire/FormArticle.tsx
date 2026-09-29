"use client";

import { useActionState, useMemo, useState } from "react";
import Link from "next/link";
import { enregistrerArticle } from "@/app/admin/observatoire/actions";
import { Message } from "@/components/facturation/FicheClient";
import { boutonPrincipal, boutonSecondaire, champ, zone } from "@/components/facturation/styles";
import { BLOCS_FICHE, QUESTIONS_DIFFUSION, STADES, TERRITOIRES, type CleQuestion } from "@/content/observatoire";
import {
  LIMITE_DESCRIPTION,
  LIMITE_TITRE_SEO,
  bloquantsPublication,
  descriptionSeo,
  slugifier,
  slugValide,
  titreSeo,
  type Article,
  type TypeArticle,
} from "@/lib/observatoire/article";
import { typographie } from "@/lib/observatoire/typographie";

/** Ce que le formulaire édite : l’article sans ses dates techniques. */
export type Brouillon = Omit<Article, "id" | "created_at" | "updated_at" | "publie_le" | "mis_a_jour_le"> & { id: string | null };

export const brouillonVide = (type: TypeArticle): Brouillon => ({
  id: null,
  slug: "",
  statut: "brouillon",
  type,
  territoire: "cnaps",
  titre: "",
  titre_seo: null,
  meta_description: null,
  accroche: null,
  faits: null,
  reproches: null,
  defense: null,
  decision: null,
  point_anm: null,
  question: null,
  juridiction: null,
  decision_date: null,
  decision_numero: null,
  decision_url: null,
  stade_procedure: null,
  stade_precision: null,
  corps: null,
  sources: null,
  q_concerne_dirigeant: false,
  q_source_verifiable: false,
  q_analyse: false,
  q_sans_methode: false,
  q_utilite_anm: false,
});

const SITE = (process.env.NEXT_PUBLIC_SITE_URL ?? "https://anm-consulting.fr").replace(/^https?:\/\//, "").replace(/\/$/, "");

type CleTexte = { [K in keyof Brouillon]: Brouillon[K] extends string | null ? K : never }[keyof Brouillon];

/** Les aides citent les consignes de Sofia : même typographie que sur le site. */
const ty = (n: React.ReactNode): React.ReactNode =>
  typeof n === "string" ? typographie(n) : Array.isArray(n) ? n.map((x) => (typeof x === "string" ? typographie(x) : x)) : n;

function Aide({ children }: { children: React.ReactNode }) {
  return <span className="text-note text-gris">{ty(children)}</span>;
}

function Compteur({ n, max }: { n: number; max: number }) {
  return (
    <span className={`font-mono text-note ${n > max ? "text-critique" : n > max * 0.9 ? "text-majeur" : "text-gris"}`} aria-live="polite">
      {n} / {max}
    </span>
  );
}

function Groupe({ n, titre, sous, children }: { n?: string; titre: string; sous?: string; children: React.ReactNode }) {
  return (
    <fieldset className="flex flex-col gap-5 border-t-[1.5px] border-encre pt-6">
      <legend className="contents">
        <span className="flex flex-col gap-1">
          {n ? <span className="font-mono text-note text-gris">{n}</span> : null}
          <span className="font-display text-t3 text-encre">{titre}</span>
          {sous ? <span className="max-w-2xl text-meta text-encre-2">{typographie(sous)}</span> : null}
        </span>
      </legend>
      {children}
    </fieldset>
  );
}

function ZoneTexte({
  nom,
  valeur,
  onChange,
  libelle,
  aide,
  lignes = 6,
  obligatoire = false,
}: {
  nom: string;
  valeur: string;
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
  libelle: string;
  aide: string;
  lignes?: number;
  obligatoire?: boolean;
}) {
  return (
    <label className="flex flex-col gap-2">
      <span className="text-meta font-medium text-encre">
        {libelle}
        {obligatoire ? <span className="font-normal text-gris"> · obligatoire pour publier</span> : null}
      </span>
      <textarea name={nom} value={valeur} onChange={onChange} rows={lignes} className={`${zone} leading-relaxed`} />
      <Aide>{aide}</Aide>
    </label>
  );
}

export default function FormArticle({ initial, enLigne }: { initial: Brouillon; enLigne: boolean }) {
  const [etat, action, enCours] = useActionState(enregistrerArticle, { ok: false, message: null });
  const [a, setA] = useState<Brouillon>(initial);
  // L'adresse suit le titre tant qu'on ne l'a pas touchée et que l'article n'a jamais été publié.
  const [slugLibre, setSlugLibre] = useState(!initial.id && !initial.slug);

  const maj = <K extends keyof Brouillon>(cle: K, valeur: Brouillon[K]) =>
    setA((p) => {
      const suivant = { ...p, [cle]: valeur };
      if (cle === "titre" && slugLibre) suivant.slug = slugifier(String(valeur ?? ""));
      return suivant;
    });

  const val = (cle: CleTexte) => (a[cle] as string | null) ?? "";
  const surTexte = (cle: CleTexte) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    maj(cle, (e.target.value || null) as never);

  const manques = useMemo(() => bloquantsPublication({ ...a, titre: a.titre ?? "" }), [a]);
  const titreGoogle = titreSeo({ titre: a.titre || "Titre de la publication", titre_seo: a.titre_seo });
  const descriptionGoogle = descriptionSeo(a) || "L’accroche apparaîtra ici.";
  const longueurDescription = (a.meta_description?.trim() || a.accroche?.trim() || "").replace(/\s+/g, " ").length;

  return (
    <form action={action} className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-14">
      <input type="hidden" name="id" value={a.id ?? ""} />
      <input type="hidden" name="type" value={a.type} />

      <div className="flex min-w-0 flex-col gap-12">
        <p className="-mb-6 text-meta text-encre-2">
          Un doute sur un bloc, le bouton Publier grisé ?{" "}
          <Link href="/admin/aide#observatoire" className="text-vert underline underline-offset-4 hover:text-encre">
            Le mode d’emploi
          </Link>
        </p>
        <Groupe titre="Le sujet">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <span className="text-meta font-medium text-encre">Type de publication</span>
              <div className="grid grid-cols-2 gap-2" role="radiogroup" aria-label="Type de publication">
                {(["fiche", "dossier"] as const).map((t) => (
                  <button
                    key={t}
                    type="button"
                    role="radio"
                    aria-checked={a.type === t}
                    onClick={() => maj("type", t)}
                    className={`min-h-12 rounded-[5px] border px-3 text-meta font-medium transition-colors ${a.type === t ? "border-encre bg-encre text-papier" : "border-gris/60 bg-papier text-encre hover:border-encre"}`}
                  >
                    {t === "fiche" ? "Fiche (une décision)" : "Dossier (permanent)"}
                  </button>
                ))}
              </div>
              <Aide>
                {a.type === "fiche"
                  ? "Le décryptage d’une décision, d’une sanction ou d’un contrôle, dans l’ordre de la note méthodologique."
                  : "Un contenu qui reste valable : « Contrôle CNAPS : quels éléments sont vérifiés ? », « Attestation de vigilance : quelles limites ? »…"}
              </Aide>
            </div>
            <label className="flex flex-col gap-2">
              <span className="text-meta font-medium text-encre">Territoire</span>
              <select name="territoire" value={a.territoire} onChange={(e) => maj("territoire", e.target.value as Brouillon["territoire"])} className={champ}>
                {TERRITOIRES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nomLong}
                  </option>
                ))}
              </select>
              <Aide>Angle ANM : {TERRITOIRES.find((t) => t.id === a.territoire)?.angle}</Aide>
            </label>
          </div>
          <label className="flex flex-col gap-2">
            <span className="text-meta font-medium text-encre">Titre</span>
            <input name="titre" value={a.titre} onChange={(e) => maj("titre", e.target.value)} required className={champ} />
            <Aide>Direct, compréhensible par un dirigeant. Ni « Attention ! », ni dramatisation : « Voici ce qu’un contrôleur pourrait constater. »</Aide>
          </label>
          <ZoneTexte
            nom="accroche"
            valeur={val("accroche")}
            onChange={surTexte("accroche")}
            libelle="L’accroche"
            lignes={3}
            obligatoire
            aide="Deux ou trois lignes maximum, directe, immédiatement compréhensible. Exemple : « Votre sous-traitant vous transmet son attestation de vigilance. Vous pensez être protégé ? »"
          />
          <label className="flex flex-col gap-2">
            <span className="text-meta font-medium text-encre">Adresse de la page</span>
            <div className="flex flex-col gap-2 sm:flex-row">
              <span className="flex h-12 items-center rounded-[5px] bg-fond px-3 font-mono text-note text-gris">/observatoire/</span>
              <input
                name="slug"
                value={a.slug}
                onChange={(e) => {
                  setSlugLibre(false);
                  maj("slug", slugifier(e.target.value.replace(/\s/g, "-")) + (e.target.value.endsWith("-") ? "-" : ""));
                }}
                onBlur={() => maj("slug", slugifier(a.slug))}
                className={`${champ} font-mono`}
                autoCapitalize="none"
                spellCheck={false}
              />
              <button type="button" onClick={() => { setSlugLibre(true); maj("slug", slugifier(a.titre)); }} className={`${boutonSecondaire} shrink-0`}>
                Reprendre le titre
              </button>
            </div>
            <Aide>
              {a.slug && !slugValide(a.slug)
                ? "Cette adresse n’est pas utilisable (réservée ou mal formée)."
                : enLigne
                  ? "La page est en ligne : changer l’adresse casse les liens déjà partagés."
                  : "Générée depuis le titre, sans accents. Modifiable jusqu’à la publication ; ensuite, ne plus y toucher."}
            </Aide>
          </label>
        </Groupe>

        {a.type === "fiche" ? (
          <>
            <Groupe
              titre="La fiche, dans l’ordre de la note"
              sous="Six blocs, dans l’ordre où le lecteur les découvre. Distinguer strictement les faits, les griefs de l’administration, les arguments de l’entreprise et ce qui a été jugé."
            >
              {BLOCS_FICHE.map((b, i) => (
                <ZoneTexte
                  key={b.cle}
                  nom={b.cle}
                  valeur={val(b.cle)}
                  onChange={surTexte(b.cle)}
                  libelle={`${String(i + 1).padStart(2, "0")} · ${b.titre}${b.libelle !== b.titre ? ` — ${b.libelle.charAt(0).toLowerCase()}${b.libelle.slice(1)}` : ""}`}
                  aide={b.aide}
                  lignes={b.cle === "question" ? 3 : 7}
                  obligatoire={b.obligatoire}
                />
              ))}
            </Groupe>

            <Groupe
              titre="La référence de la décision"
              sous="Juridiction, date, numéro et stade de la procédure sont obligatoires pour publier : le lecteur doit pouvoir retrouver la décision."
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-meta font-medium text-encre">Juridiction ou autorité</span>
                  <input name="juridiction" value={val("juridiction")} onChange={surTexte("juridiction")} className={champ} placeholder="Conseil d’État, CAA de Paris, CNAPS…" />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-meta font-medium text-encre">Date de la décision</span>
                  <input type="date" name="decision_date" value={val("decision_date")} onChange={surTexte("decision_date")} className={champ} />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-meta font-medium text-encre">Numéro</span>
                  <input name="decision_numero" value={val("decision_numero")} onChange={surTexte("decision_numero")} className={champ} placeholder="n° de requête, de pourvoi, de délibération" />
                </label>
                <label className="flex flex-col gap-2 sm:col-span-2">
                  <span className="text-meta font-medium text-encre">Lien vers le texte intégral</span>
                  <input type="url" name="decision_url" value={val("decision_url")} onChange={surTexte("decision_url")} className={champ} placeholder="https://www.legifrance.gouv.fr/…" />
                  <Aide>Légifrance, Conseil d’État, juridiction, CNAPS… La presse peut signaler une affaire, elle ne remplace pas la décision lorsqu’elle est accessible.</Aide>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-meta font-medium text-encre">Stade de la procédure</span>
                  <select name="stade_procedure" value={val("stade_procedure")} onChange={surTexte("stade_procedure")} className={champ}>
                    <option value="">À choisir</option>
                    {STADES.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.libelle}
                      </option>
                    ))}
                  </select>
                  <Aide>{STADES.find((s) => s.id === a.stade_procedure)?.portee ?? "Toujours précisé : un référé n’est jamais présenté comme une décision définitive."}</Aide>
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-meta font-medium text-encre">Précision sur la suite</span>
                  <input name="stade_precision" value={val("stade_precision")} onChange={surTexte("stade_precision")} className={champ} placeholder="Facultatif" />
                  <Aide>Ce que l’on sait de la suite : appel formé, pourvoi pendant, renvoi…</Aide>
                </label>
              </div>
            </Groupe>
          </>
        ) : (
          <Groupe titre="Le corps du dossier" sous="Expliquer le risque, le mécanisme, ce que l’administration regarde, ce que la jurisprudence retient. Jamais la grille complète, les méthodes de rapprochement ni la procédure corrective.">
            <ZoneTexte
              nom="corps"
              valeur={val("corps")}
              onChange={surTexte("corps")}
              libelle="Texte"
              lignes={22}
              obligatoire
              aide="Une section par intertitre commençant par « ## » (le sommaire se construit tout seul). Listes avec « - », gras avec **mot**, lien avec [texte](https://…). Une ligne vide sépare deux paragraphes."
            />
          </Groupe>
        )}

        <Groupe titre="Sources" sous="Facultatif pour une fiche (la référence suffit), recommandé pour un dossier.">
          <ZoneTexte
            nom="sources"
            valeur={val("sources")}
            onChange={surTexte("sources")}
            libelle="Une source par ligne"
            lignes={4}
            aide="Le libellé, puis l’adresse : « Code de la sécurité intérieure, art. L. 612-5 https://www.legifrance.gouv.fr/… ». Source officielle et vérifiable en priorité."
          />
        </Groupe>

        <Groupe titre="Référencement Google" sous="Facultatif : à défaut, Google reçoit le titre et l’accroche. À remplir quand ils sont trop longs.">
          <label className="flex flex-col gap-2">
            <span className="flex items-baseline justify-between gap-4 text-meta font-medium text-encre">
              Titre pour Google <Compteur n={titreGoogle.length} max={LIMITE_TITRE_SEO} />
            </span>
            <input name="titre_seo" value={val("titre_seo")} onChange={surTexte("titre_seo")} className={champ} placeholder={a.titre || "Repris du titre"} />
            <Aide>{LIMITE_TITRE_SEO} caractères au plus, mots importants au début (« Contrôle CNAPS », « sous-traitance », « URSSAF »).</Aide>
          </label>
          <label className="flex flex-col gap-2">
            <span className="flex items-baseline justify-between gap-4 text-meta font-medium text-encre">
              Description pour Google <Compteur n={longueurDescription} max={LIMITE_DESCRIPTION} />
            </span>
            <textarea name="meta_description" value={val("meta_description")} onChange={surTexte("meta_description")} rows={3} className={zone} placeholder={a.accroche ?? "Reprise de l’accroche"} />
            <Aide>{LIMITE_DESCRIPTION} caractères au plus. Au-delà, l’accroche est coupée au dernier mot entier.</Aide>
          </label>
          <div className="flex flex-col gap-1 rounded-[5px] border border-filet bg-papier p-5" aria-label="Aperçu du résultat Google">
            <span className="etiquette mb-2">Aperçu dans Google</span>
            <span className="truncate text-note text-encre-2">
              {SITE} › observatoire › {a.slug || "adresse"}
            </span>
            <span className="text-chapo text-vert-2">{titreGoogle.length > LIMITE_TITRE_SEO ? `${titreGoogle.slice(0, LIMITE_TITRE_SEO - 1)}…` : titreGoogle}</span>
            <span className="text-meta text-encre-2">{descriptionGoogle}</span>
          </div>
        </Groupe>

        <Groupe titre="Les cinq questions avant diffusion" sous="Si les cinq réponses sont positives, le contenu peut être publié. Tant qu’une case reste vide, le bouton Publier est bloqué.">
          <ul className="flex flex-col border-t border-filet">
            {QUESTIONS_DIFFUSION.map((q, i) => (
              <li key={q.cle} className="border-b border-filet">
                <label className="flex min-h-14 cursor-pointer items-start gap-4 py-3">
                  <input
                    type="checkbox"
                    name={q.cle}
                    value="oui"
                    checked={a[q.cle as CleQuestion]}
                    onChange={(e) => maj(q.cle as CleQuestion, e.target.checked)}
                    className="mt-0.5 size-6 shrink-0 accent-vert"
                  />
                  <span className="text-corps text-encre">
                    <span className="mr-2 font-mono text-note text-gris">{i + 1}</span>
                    {typographie(q.texte)}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </Groupe>
      </div>

      {/* PUBLICATION */}
      <aside className="flex flex-col gap-5 lg:sticky lg:top-6 lg:self-start">
        <div className="flex flex-col gap-5 rounded-[5px] border border-filet bg-papier p-6">
          <div className="flex items-center justify-between gap-3">
            <span className="etiquette">Publication</span>
            <span className={`rounded-full px-3 py-1 text-note font-medium ${enLigne ? "bg-menthe text-vert" : "bg-fond text-encre-2 ring-1 ring-filet"}`}>
              {enLigne ? "En ligne" : "Brouillon"}
            </span>
          </div>
          {manques.length ? (
            <div className="flex flex-col gap-2">
              <p className="text-meta font-medium text-encre">{enLigne ? "Pour enregistrer la page en ligne, il manque :" : "Pour publier, il manque :"}</p>
              <ul className="flex flex-col gap-1 pl-4 text-meta text-encre-2 [list-style:disc]">
                {manques.map((m) => (
                  <li key={m}>{m}</li>
                ))}
              </ul>
            </div>
          ) : (
            <p className="text-meta text-vert">Tout est en place : {enLigne ? "la page en ligne peut être mise à jour." : "la publication peut partir."}</p>
          )}
          {enLigne ? (
            <label className="flex items-start gap-3 text-meta text-encre-2">
              <input type="checkbox" name="signaler_maj" value="oui" className="mt-0.5 size-5 shrink-0 accent-vert" />
              <span>{typographie("Mise à jour de fond : afficher « Mis à jour le » aux lecteurs (pas pour une coquille).")}</span>
            </label>
          ) : null}
          <div className="flex flex-col gap-3">
            {enLigne ? (
              <>
                <button type="submit" name="intention" value="enregistrer" disabled={enCours || manques.length > 0} className={boutonPrincipal}>
                  {enCours ? "Enregistrement…" : "Enregistrer la page en ligne"}
                </button>
                <button type="submit" name="intention" value="depublier" disabled={enCours} className={boutonSecondaire}>
                  Retirer du site
                </button>
              </>
            ) : (
              <>
                <button type="submit" name="intention" value="publier" disabled={enCours || manques.length > 0} className={boutonPrincipal}>
                  {enCours ? "Envoi…" : "Publier"}
                </button>
                <button type="submit" name="intention" value="enregistrer" disabled={enCours} className={boutonSecondaire}>
                  Enregistrer le brouillon
                </button>
              </>
            )}
          </div>
          <Message etat={etat} />
        </div>
        <p className="text-note text-gris">
          {typographie(
            "Apostrophes courbes et espaces insécables (avant les signes doubles, dans les guillemets, entre un nombre et son unité) sont ajoutées automatiquement sur le site : tape normalement.",
          )}
        </p>
      </aside>
    </form>
  );
}
