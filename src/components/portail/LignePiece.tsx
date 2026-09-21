"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { FileText, Image as IconeImage, Paperclip, Trash, WarningCircle } from "@phosphor-icons/react";
import type { EtatValidite, FichierPiece, ValiditePiece } from "@/lib/types";
import { SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabase/env";
import { TAILLE_MAX_OCTETS, tailleLisible } from "@/lib/portail/fichiers";
import { definirDateDocument } from "@/app/admin/actions";
import { changerStatutPiece, enregistrerFichier, preparerDepot, supprimerFichier } from "@/app/admin/pieces/actions";

/**
 * Une pièce : son état, ses fichiers, et tout ce qu'on peut en faire, au doigt.
 *
 * Pensée pour l'iPad : cibles de 48 px, aucune action cachée derrière un survol, le
 * sélecteur de fichier natif (Photos, appareil photo, Fichiers), une barre de progression
 * par fichier parce qu'un envoi en 4G sur place peut prendre une minute.
 */

const ETAT: Record<EtatValidite, { texte: string; ton: string; point: string }> = {
  perimee: { texte: "Périmée", ton: "text-critique", point: "bg-critique" },
  bientot_perimee: { texte: "Bientôt périmée", ton: "text-majeur", point: "bg-majeur" },
  date_manquante: { texte: "Date à saisir", ton: "text-majeur", point: "bg-majeur" },
  non_recue: { texte: "Manquante", ton: "text-critique", point: "bg-critique" },
  valide: { texte: "À jour", ton: "text-mineur", point: "bg-mineur" },
  recue: { texte: "Reçue", ton: "text-mineur", point: "bg-mineur" },
  sans_objet: { texte: "Sans objet", ton: "text-gris", point: "bg-brume" },
};

const jour = (d: string | null): string =>
  d ? new Date(d).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" }) : "";

interface Envoi {
  cle: string;
  nom: string;
  taille: number;
  progression: number;
  etape: "attente" | "envoi" | "enregistrement" | "erreur";
  erreur?: string;
  fichier: File;
}

/** Envoi direct au stockage, avec progression. `fetch` ne sait pas mesurer un envoi. */
const envoyerAuStockage = (url: string, fichier: File, surProgression: (p: number) => void) =>
  new Promise<void>((resoudre, rejeter) => {
    const xhr = new XMLHttpRequest();
    xhr.open("PUT", url);
    xhr.setRequestHeader("x-upsert", "false");
    if (SUPABASE_PUBLISHABLE_KEY) xhr.setRequestHeader("apikey", SUPABASE_PUBLISHABLE_KEY);
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) surProgression(e.loaded / e.total);
    };
    xhr.onload = () =>
      xhr.status >= 200 && xhr.status < 300
        ? resoudre()
        : rejeter(new Error(xhr.status === 413 ? "Fichier trop lourd pour le stockage." : `Le stockage a refusé le fichier (${xhr.status}).`));
    xhr.onerror = () => rejeter(new Error("La connexion a été perdue pendant l’envoi."));
    const corps = new FormData();
    corps.append("cacheControl", "3600");
    corps.append("", fichier);
    xhr.send(corps);
  });

interface Props {
  missionId: string;
  ordre: string;
  piece: ValiditePiece;
  fichiers: FichierPiece[];
}

const LignePiece = ({ missionId, ordre, piece, fichiers }: Props) => {
  const [envois, setEnvois] = useState<Envoi[]>([]);
  const [message, setMessage] = useState<{ ton: "ok" | "erreur"; texte: string } | null>(null);
  const [aConfirmer, setAConfirmer] = useState<string | null>(null);
  const [enCours, demarrer] = useTransition();
  const champFichier = useRef<HTMLInputElement>(null);

  const etat = ETAT[piece.etat];
  const envoiActif = envois.some((e) => e.etape === "envoi" || e.etape === "enregistrement" || e.etape === "attente");
  const parLeDocument = piece.validite_nature === "date_du_document";
  const avecDate = piece.validite_nature !== null && piece.validite_nature !== "indefinie";
  const statutManuel = piece.received === "na" ? "na" : piece.received === "oui" ? "oui" : "non";

  // Quitter la page pendant un envoi le couperait : Safari demande confirmation.
  useEffect(() => {
    if (!envoiActif) return;
    const retenir = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", retenir);
    return () => window.removeEventListener("beforeunload", retenir);
  }, [envoiActif]);

  // Une demande de suppression non confirmée s'annule seule.
  useEffect(() => {
    if (!aConfirmer) return;
    const t = setTimeout(() => setAConfirmer(null), 6000);
    return () => clearTimeout(t);
  }, [aConfirmer]);

  const maj = (cle: string, champs: Partial<Envoi>) =>
    setEnvois((liste) => liste.map((e) => (e.cle === cle ? { ...e, ...champs } : e)));

  const traiter = async (envoi: Envoi) => {
    maj(envoi.cle, { etape: "envoi", progression: 0, erreur: undefined });
    const prepa = await preparerDepot({ missionId, documentId: piece.id, nom: envoi.nom, taille: envoi.taille });
    if (!prepa.ok) return maj(envoi.cle, { etape: "erreur", erreur: prepa.erreur });
    try {
      await envoyerAuStockage(prepa.url, envoi.fichier, (p) => maj(envoi.cle, { progression: p }));
    } catch (e) {
      return maj(envoi.cle, { etape: "erreur", erreur: (e as Error).message });
    }
    maj(envoi.cle, { etape: "enregistrement", progression: 1 });
    const res = await enregistrerFichier({
      missionId,
      documentId: piece.id,
      ordre,
      chemin: prepa.chemin,
      nom: envoi.nom,
      taille: envoi.taille,
      type: envoi.fichier.type,
    });
    if (!res.ok) return maj(envoi.cle, { etape: "erreur", erreur: res.erreur });
    setEnvois((liste) => liste.filter((e) => e.cle !== envoi.cle));
  };

  const choisir = async (liste: FileList | null) => {
    if (!liste || liste.length === 0) return;
    setMessage(null);
    const nouveaux: Envoi[] = Array.from(liste).map((f, i) => ({
      cle: `${Date.now()}-${i}-${f.name}`,
      nom: f.name,
      taille: f.size,
      progression: 0,
      etape: f.size > TAILLE_MAX_OCTETS ? "erreur" : "attente",
      erreur:
        f.size > TAILLE_MAX_OCTETS
          ? `${tailleLisible(f.size)} : au-delà de la limite de ${tailleLisible(TAILLE_MAX_OCTETS)}.`
          : undefined,
      fichier: f,
    }));
    setEnvois((l) => [...l, ...nouveaux]);
    if (champFichier.current) champFichier.current.value = "";
    // Un fichier après l'autre : en 4G, envoyer douze bulletins en parallèle les ferait tous échouer.
    for (const e of nouveaux) if (e.etape === "attente") await traiter(e);
  };

  const supprimer = (fichierId: string) =>
    demarrer(async () => {
      setAConfirmer(null);
      const res = await supprimerFichier({ missionId, fichierId, ordre });
      setMessage(res.ok ? { ton: "ok", texte: res.message ?? "Supprimé." } : { ton: "erreur", texte: res.erreur });
    });

  const changerStatut = (statut: "oui" | "non" | "na") =>
    demarrer(async () => {
      const res = await changerStatutPiece({ missionId, documentId: piece.id, ordre, statut });
      setMessage(res.ok ? null : { ton: "erreur", texte: res.erreur });
    });

  return (
    <li className="border-b border-filet py-5 last:border-b-0">
      <div className="flex flex-wrap items-start justify-between gap-x-6 gap-y-2">
        <div className="min-w-0 flex-1">
          <h4 className="text-corps font-medium text-encre">{piece.name}</h4>
          {!piece.required ? <p className="text-note text-gris">Demandée seulement si elle s’applique</p> : null}
        </div>
        <p className={`flex shrink-0 items-center gap-2 text-meta font-medium ${etat.ton}`}>
          <span className={`size-2 rounded-full ${etat.point}`} aria-hidden />
          {etat.texte}
          {piece.echeance && piece.etat !== "sans_objet" && piece.etat !== "non_recue" ? (
            <span className="font-normal text-gris">· échéance {jour(piece.echeance)}</span>
          ) : null}
        </p>
      </div>

      {piece.validite_note ? <p className="mt-2 max-w-3xl text-meta text-encre-2">{piece.validite_note}</p> : null}

      {fichiers.length > 0 ? (
        <ul className="mt-4 flex flex-col gap-2">
          {fichiers.map((f) => {
            const image = f.content_type?.startsWith("image/");
            const Icone = image ? IconeImage : FileText;
            return (
              <li key={f.id} className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-[5px] border border-filet bg-papier pl-3">
                <a
                  href={`/admin/missions/${missionId}/pieces/${f.id}`}
                  target="_blank"
                  rel="noopener"
                  className="flex min-h-12 min-w-0 flex-1 items-center gap-3 py-2 text-meta text-encre underline-offset-4 hover:underline"
                >
                  <Icone size={20} className="shrink-0 text-vert" aria-hidden />
                  <span className="min-w-0 truncate">{f.file_name}</span>
                  <span className="shrink-0 text-note text-gris">
                    {tailleLisible(f.file_size)} · {jour(f.uploaded_at)}
                  </span>
                </a>
                {aConfirmer === f.id ? (
                  <span className="flex items-center">
                    <button
                      type="button"
                      onClick={() => supprimer(f.id)}
                      disabled={enCours}
                      className="min-h-12 px-3 text-meta font-medium text-critique"
                    >
                      Confirmer la suppression
                    </button>
                    <button type="button" onClick={() => setAConfirmer(null)} className="min-h-12 px-3 text-meta text-encre-2">
                      Annuler
                    </button>
                  </span>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAConfirmer(f.id)}
                    aria-label={`Supprimer ${f.file_name}`}
                    className="flex size-12 items-center justify-center text-gris hover:text-critique"
                  >
                    <Trash size={20} aria-hidden />
                  </button>
                )}
              </li>
            );
          })}
        </ul>
      ) : null}

      {envois.length > 0 ? (
        <ul className="mt-3 flex flex-col gap-2" aria-live="polite">
          {envois.map((e) => (
            <li key={e.cle} className="rounded-[5px] border border-filet bg-papier px-3 py-3">
              <div className="flex items-baseline justify-between gap-3 text-meta">
                <span className="min-w-0 truncate text-encre">{e.nom}</span>
                <span className={`shrink-0 ${e.etape === "erreur" ? "text-critique" : "text-gris"}`}>
                  {e.etape === "attente" && "En attente"}
                  {e.etape === "envoi" && `${Math.round(e.progression * 100)} %`}
                  {e.etape === "enregistrement" && "Enregistrement…"}
                  {e.etape === "erreur" && "Échec"}
                </span>
              </div>
              {e.etape !== "erreur" ? (
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-filet-2">
                  <div className="h-full bg-vert transition-[width] duration-200" style={{ width: `${Math.round(e.progression * 100)}%` }} />
                </div>
              ) : (
                <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1">
                  <p className="flex items-center gap-2 text-meta text-critique">
                    <WarningCircle size={16} aria-hidden />
                    {e.erreur}
                  </p>
                  {e.taille <= TAILLE_MAX_OCTETS ? (
                    <button type="button" onClick={() => traiter(e)} className="min-h-12 text-meta font-medium text-vert underline underline-offset-4">
                      Réessayer
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setEnvois((l) => l.filter((x) => x.cle !== e.cle))}
                    className="min-h-12 text-meta text-encre-2 underline underline-offset-4"
                  >
                    Retirer
                  </button>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : null}

      <div className="mt-4 flex flex-wrap items-end gap-3">
        <label className="flex min-h-12 cursor-pointer items-center gap-2 rounded-[5px] bg-encre px-5 text-meta font-medium text-papier transition-colors hover:bg-vert has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-vert">
          <Paperclip size={18} aria-hidden />
          {fichiers.length > 0 ? "Ajouter un fichier" : "Déposer le fichier"}
          <input ref={champFichier} type="file" multiple className="sr-only" onChange={(e) => choisir(e.target.files)} />
        </label>

        {fichiers.length === 0 ? (
          <label className="flex flex-col gap-1">
            <span className="text-note text-gris">Sans fichier</span>
            <select
              value={statutManuel}
              disabled={enCours}
              onChange={(e) => changerStatut(e.target.value as "oui" | "non" | "na")}
              className="h-12 rounded-[5px] border border-gris/60 bg-papier px-3 text-meta text-encre"
            >
              <option value="non">Manquante</option>
              <option value="oui">Reçue, original vu sur place</option>
              <option value="na">Sans objet pour cette entreprise</option>
            </select>
          </label>
        ) : null}

        {avecDate && piece.etat !== "sans_objet" ? (
          <form action={definirDateDocument} className="flex flex-wrap items-end gap-2">
            <input type="hidden" name="missionId" value={missionId} />
            <input type="hidden" name="ordre" value={ordre} />
            <input type="hidden" name="documentId" value={piece.id} />
            <input type="hidden" name="champ" value={parLeDocument ? "expire_le" : "document_date"} />
            <label className="flex flex-col gap-1">
              <span className="text-note text-gris">{parLeDocument ? "Échéance portée par la pièce" : "Date de la pièce"}</span>
              <input
                name="valeur"
                type="date"
                defaultValue={(parLeDocument ? piece.echeance : piece.document_date) ?? ""}
                className="h-12 rounded-[5px] border border-gris/60 bg-papier px-3 text-meta text-encre"
              />
            </label>
            <button type="submit" className="h-12 rounded-[5px] border border-gris/60 px-4 text-meta text-encre hover:border-vert hover:text-vert">
              Enregistrer la date
            </button>
          </form>
        ) : null}
      </div>

      {message ? (
        <p role={message.ton === "erreur" ? "alert" : "status"} className={`mt-3 text-meta ${message.ton === "erreur" ? "text-critique" : "text-vert"}`}>
          {message.texte}
        </p>
      ) : null}
    </li>
  );
};

export default LignePiece;
