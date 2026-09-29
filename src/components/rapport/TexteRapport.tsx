"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowCounterClockwise, Check, WarningCircle } from "@phosphor-icons/react";
import { enregistrerBrouillonTexte, enregistrerTexte } from "@/app/admin/missions/[id]/(outil)/grilles-actions";

/** Pause de frappe après laquelle le texte part en base. */
const DELAI_FRAPPE = 1500;

type Envoi = { mode: "texte" | "brouillon"; valeur: string };
type Statut = "repos" | "en_cours" | "enregistre" | "erreur";

/**
 * Un texte du rapport. Tant que Sofia ne l'a pas validé, c'est la proposition de l'outil
 * (rédigée à partir de ses réponses) qui s'affiche, signalée comme telle.
 *
 * Tout ce qu'elle tape s'enregistre seul (pause de frappe, sortie du champ, départ de la page) :
 * - texte jamais validé : dans le brouillon (`rapport_textes.brouillon`), que le rapport ne lit
 *   pas. La validation reste un geste explicite (« Valider ce texte » / « Valider mon texte ») ;
 * - texte déjà validé : les retouches remplacent le texte validé, comme avant.
 */
const TexteRapport = ({
  missionId,
  cle,
  titre,
  proposition,
  enregistre,
  brouillon,
}: {
  missionId: string;
  cle: string;
  titre: string;
  proposition: string;
  /** Le texte validé, repris dans le rapport. */
  enregistre: string | null;
  /** Le brouillon d'un texte pas encore validé. */
  brouillon: string | null;
}) => {
  const [texte, setTexte] = useState(enregistre ?? brouillon ?? proposition);
  const [valide, setValide] = useState<string | null>(enregistre);
  const [brouillonSauve, setBrouillonSauve] = useState<string | null>(enregistre === null ? brouillon : null);
  const [statut, setStatut] = useState<Statut>("repos");

  // Copies lues par la file d'envoi, qui vit hors du rendu.
  const valideRef = useRef(valide);
  const brouillonRef = useRef(brouillonSauve);
  const propositionRef = useRef(proposition);
  const texteRef = useRef(texte);
  propositionRef.current = proposition;
  texteRef.current = texte;

  const enVol = useRef(false);
  const enAttente = useRef<Envoi | null>(null);
  const minuterie = useRef<ReturnType<typeof setTimeout> | null>(null);

  /** Ce qu'il faut écrire pour la valeur à l'écran, ou null si la base est déjà à jour. */
  const aEnvoyer = (valeur: string): Envoi | null => {
    if (valideRef.current !== null) {
      // Un texte validé vidé n'est pas écrit : il redeviendrait une simple proposition.
      if (!valeur.trim() || valeur === valideRef.current) return null;
      return { mode: "texte", valeur };
    }
    // La proposition telle quelle n'est pas un brouillon : elle suit les réponses de Sofia.
    const b = valeur === propositionRef.current ? "" : valeur;
    return b === (brouillonRef.current ?? "") ? null : { mode: "brouillon", valeur: b };
  };

  const vider = useCallback(async () => {
    if (enVol.current) return; // la boucle en cours prendra le dernier envoi
    enVol.current = true;
    setStatut("en_cours");
    let ok = true;
    while (enAttente.current) {
      const envoi = enAttente.current;
      enAttente.current = null;
      const r =
        envoi.mode === "texte"
          ? await enregistrerTexte({ missionId, cle, texte: envoi.valeur })
          : await enregistrerBrouillonTexte({ missionId, cle, texte: envoi.valeur });
      ok = r.ok;
      if (r.ok && envoi.mode === "texte") {
        valideRef.current = envoi.valeur;
        brouillonRef.current = null;
        setValide(envoi.valeur);
        setBrouillonSauve(null);
      } else if (r.ok) {
        brouillonRef.current = envoi.valeur || null;
        setBrouillonSauve(envoi.valeur || null);
      }
    }
    enVol.current = false;
    setStatut(ok ? "enregistre" : "erreur");
  }, [missionId, cle]);

  const annulerMinuterie = () => {
    if (minuterie.current) clearTimeout(minuterie.current);
    minuterie.current = null;
  };

  /** Envoie tout de suite ce qui est à l'écran, si la base n'est pas à jour. */
  const envoyerMaintenant = useCallback(() => {
    annulerMinuterie();
    // Une validation demandée et pas encore partie reste une validation, avec le dernier texte.
    if (enAttente.current?.mode === "texte") {
      enAttente.current = { mode: "texte", valeur: texteRef.current };
      return;
    }
    const envoi = aEnvoyer(texteRef.current);
    if (!envoi) return;
    enAttente.current = envoi;
    void vider();
  }, [vider]); // aEnvoyer ne lit que des refs

  const modifier = (valeur: string) => {
    setTexte(valeur);
    texteRef.current = valeur;
    annulerMinuterie();
    minuterie.current = setTimeout(envoyerMaintenant, DELAI_FRAPPE);
  };

  const validerTexte = () => {
    if (!texte.trim()) return;
    annulerMinuterie();
    enAttente.current = { mode: "texte", valeur: texte };
    void vider();
  };

  // Départ de la page, passage à une autre app sur l'iPad, démontage (lien interne) : on envoie
  // ce qui reste. Si un envoi n'est pas terminé, le navigateur demande confirmation avant de fermer.
  useEffect(() => {
    const auRevoir = (e: BeforeUnloadEvent) => {
      envoyerMaintenant();
      if (enVol.current || enAttente.current) {
        e.preventDefault();
        e.returnValue = "";
      }
    };
    const masquee = () => {
      if (document.visibilityState === "hidden") envoyerMaintenant();
    };
    window.addEventListener("beforeunload", auRevoir);
    window.addEventListener("pagehide", envoyerMaintenant);
    document.addEventListener("visibilitychange", masquee);
    return () => {
      window.removeEventListener("beforeunload", auRevoir);
      window.removeEventListener("pagehide", envoyerMaintenant);
      document.removeEventListener("visibilitychange", masquee);
      envoyerMaintenant();
    };
  }, [envoyerMaintenant]);

  const estValide = valide !== null;
  const aJour = estValide ? texte === valide || !texte.trim() : (texte === proposition ? "" : texte) === (brouillonSauve ?? "");
  const etiquette = estValide
    ? texte === valide
      ? "Votre texte, validé"
      : "Modifié, enregistrement en attente"
    : texte === proposition
      ? "Proposition de l’outil, à relire"
      : "Brouillon, pas encore validé";

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <label htmlFor={`texte-${cle}`} className="font-display text-t4 text-encre">{titre}</label>
        <span className={`flex items-center gap-1.5 text-meta ${estValide ? "text-mineur" : "text-majeur"}`}>
          {estValide && texte === valide ? <Check size={14} aria-hidden /> : null}
          {etiquette}
        </span>
      </div>
      <textarea
        id={`texte-${cle}`}
        value={texte}
        onChange={(e) => modifier(e.target.value)}
        onBlur={envoyerMaintenant}
        rows={Math.max(4, Math.ceil(texte.length / 95))}
        className={`w-full rounded-[5px] border px-4 py-3 text-corps leading-relaxed text-encre outline-none focus:border-vert ${estValide ? "border-gris/60 bg-papier" : "border-majeur/40 bg-majeur-l/30"}`}
      />
      <div className="flex flex-wrap items-center gap-3">
        {!estValide ? (
          <button
            type="button"
            onClick={validerTexte}
            disabled={!texte.trim()}
            className="min-h-11 rounded-[5px] bg-encre px-4 text-meta font-medium text-papier transition-colors hover:bg-vert disabled:opacity-50"
          >
            {texte === proposition ? "Valider ce texte" : "Valider mon texte"}
          </button>
        ) : null}
        {texte !== proposition ? (
          <button type="button" onClick={() => modifier(proposition)} className="flex min-h-11 items-center gap-1.5 text-meta text-encre-2 underline-offset-4 hover:underline">
            <ArrowCounterClockwise size={14} aria-hidden /> Revenir à la proposition
          </button>
        ) : null}
        <span role="status" aria-live="polite" className="flex items-center gap-1.5 text-note text-gris">
          {statut === "en_cours" ? "Enregistrement…" : null}
          {statut === "enregistre" && aJour ? (
            <>
              <Check size={14} aria-hidden /> Enregistré
            </>
          ) : null}
          {estValide && !texte.trim() ? "Un texte vide n’est pas enregistré : la dernière version validée est conservée." : null}
        </span>
        {statut === "erreur" ? (
          <span role="alert" className="flex flex-wrap items-center gap-2 text-meta text-critique">
            <WarningCircle size={16} aria-hidden /> Non enregistré : vérifiez la connexion. Votre texte reste à l’écran.
            <button
              type="button"
              onClick={envoyerMaintenant}
              className="min-h-11 px-2 font-medium text-encre underline underline-offset-4"
            >
              Réessayer
            </button>
          </span>
        ) : null}
      </div>
    </div>
  );
};

export default TexteRapport;
