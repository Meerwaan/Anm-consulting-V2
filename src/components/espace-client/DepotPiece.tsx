"use client";

import { useEffect, useRef, useState } from "react";
import { Paperclip, WarningCircle } from "@phosphor-icons/react";
import { SUPABASE_PUBLISHABLE_KEY } from "@/lib/supabase/env";
import { TAILLE_MAX_OCTETS, tailleLisible } from "@/lib/portail/fichiers";
import { enregistrerFichierClient, preparerDepotClient } from "@/app/app/missions/[id]/pieces/actions";

/**
 * Déposer un ou plusieurs fichiers pour une pièce, depuis un téléphone ou un ordinateur.
 * Le sélecteur natif propose Photos, l'appareil photo et Fichiers. Un fichier après l'autre,
 * avec sa progression : en 4G, un envoi de bulletins de paie peut prendre une minute.
 */

interface Envoi {
  cle: string;
  nom: string;
  taille: number;
  progression: number;
  etape: "attente" | "envoi" | "enregistrement" | "erreur";
  erreur?: string;
  fichier: File;
}

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
        : rejeter(new Error(xhr.status === 413 ? "Fichier trop lourd pour le stockage." : `Le stockage a refusé le fichier (erreur ${xhr.status}).`));
    xhr.onerror = () => rejeter(new Error("La connexion a été perdue pendant l’envoi."));
    const corps = new FormData();
    corps.append("cacheControl", "3600");
    corps.append("", fichier);
    xhr.send(corps);
  });

const DepotPiece = ({ missionId, documentId, nomPiece, dejaDes }: { missionId: string; documentId: string; nomPiece: string; dejaDes: boolean }) => {
  const [envois, setEnvois] = useState<Envoi[]>([]);
  const champ = useRef<HTMLInputElement>(null);
  const actif = envois.some((e) => e.etape !== "erreur");

  useEffect(() => {
    if (!actif) return;
    const retenir = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", retenir);
    return () => window.removeEventListener("beforeunload", retenir);
  }, [actif]);

  const maj = (cle: string, champs: Partial<Envoi>) => setEnvois((l) => l.map((e) => (e.cle === cle ? { ...e, ...champs } : e)));

  const traiter = async (envoi: Envoi) => {
    maj(envoi.cle, { etape: "envoi", progression: 0, erreur: undefined });
    const prepa = await preparerDepotClient({ missionId, documentId, nom: envoi.nom, taille: envoi.taille });
    if (!prepa.ok) return maj(envoi.cle, { etape: "erreur", erreur: prepa.erreur });
    try {
      await envoyerAuStockage(prepa.url, envoi.fichier, (p) => maj(envoi.cle, { progression: p }));
    } catch (e) {
      return maj(envoi.cle, { etape: "erreur", erreur: (e as Error).message });
    }
    maj(envoi.cle, { etape: "enregistrement", progression: 1 });
    const res = await enregistrerFichierClient({
      missionId,
      documentId,
      chemin: prepa.chemin,
      nom: envoi.nom,
      taille: envoi.taille,
      type: envoi.fichier.type,
    });
    if (!res.ok) return maj(envoi.cle, { etape: "erreur", erreur: res.erreur });
    setEnvois((l) => l.filter((e) => e.cle !== envoi.cle));
  };

  const choisir = async (liste: FileList | null) => {
    if (!liste?.length) return;
    const nouveaux: Envoi[] = Array.from(liste).map((f, i) => ({
      cle: `${Date.now()}-${i}-${f.name}`,
      nom: f.name,
      taille: f.size,
      progression: 0,
      etape: f.size > TAILLE_MAX_OCTETS ? "erreur" : "attente",
      erreur: f.size > TAILLE_MAX_OCTETS ? `${tailleLisible(f.size)} : au-delà de la limite de ${tailleLisible(TAILLE_MAX_OCTETS)}.` : undefined,
      fichier: f,
    }));
    setEnvois((l) => [...l, ...nouveaux]);
    if (champ.current) champ.current.value = "";
    for (const e of nouveaux) if (e.etape === "attente") await traiter(e);
  };

  const idChamp = `depot-${documentId}`;

  return (
    <div className="flex flex-col gap-3">
      <input
        ref={champ}
        id={idChamp}
        type="file"
        multiple
        className="sr-only"
        onChange={(e) => void choisir(e.target.files)}
        aria-label={`Déposer un fichier pour « ${nomPiece} »`}
      />
      <label
        htmlFor={idChamp}
        className={`flex min-h-12 w-fit cursor-pointer items-center gap-2 whitespace-nowrap rounded-[5px] px-5 text-meta font-medium transition-colors ${
          dejaDes ? "border border-encre/70 text-encre hover:bg-encre hover:text-papier" : "bg-encre text-papier hover:bg-vert"
        }`}
      >
        <Paperclip size={18} aria-hidden />
        {dejaDes ? "Ajouter un fichier" : "Déposer un fichier"}
      </label>
      {envois.length ? (
        <ul className="flex flex-col gap-2" aria-live="polite">
          {envois.map((e) => (
            <li key={e.cle} className="flex flex-col gap-1.5 rounded-[5px] border border-filet bg-papier px-3 py-2">
              <p className="flex items-center justify-between gap-3 text-meta text-encre">
                <span className="min-w-0 truncate">{e.nom}</span>
                <span className="shrink-0 text-note text-gris">
                  {e.etape === "erreur"
                    ? "Échec"
                    : e.etape === "enregistrement"
                      ? "Enregistrement…"
                      : e.etape === "attente"
                        ? "En attente"
                        : `${Math.round(e.progression * 100)} %`}
                </span>
              </p>
              {e.etape === "erreur" ? (
                <p className="flex items-start gap-2 text-note text-critique">
                  <WarningCircle size={16} className="mt-0.5 shrink-0" aria-hidden />
                  <span className="flex-1">{e.erreur}</span>
                  {e.taille <= TAILLE_MAX_OCTETS ? (
                    <button type="button" onClick={() => void traiter(e)} className="min-h-8 font-medium underline underline-offset-4">
                      Réessayer
                    </button>
                  ) : null}
                  <button
                    type="button"
                    onClick={() => setEnvois((l) => l.filter((x) => x.cle !== e.cle))}
                    className="min-h-8 text-encre-2 underline underline-offset-4"
                  >
                    Retirer
                  </button>
                </p>
              ) : (
                <span className="h-1 overflow-hidden rounded-full bg-filet-2" aria-hidden>
                  <span className="block h-full bg-vert transition-[width]" style={{ width: `${Math.round(e.progression * 100)}%` }} />
                </span>
              )}
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
};

export default DepotPiece;
