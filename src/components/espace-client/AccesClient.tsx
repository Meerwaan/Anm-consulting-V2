"use client";

import { useActionState, useEffect, useRef, useState, useTransition } from "react";
import { Check, Copy, EnvelopeSimple, ChatText, WarningCircle } from "@phosphor-icons/react";
import {
  inviterClient,
  regenererLien,
  retablirAcces,
  retirerAcces,
  type ResultatAcces,
} from "@/app/admin/missions/[id]/acces-actions";
import type { AccesClient as Acces } from "@/lib/espace-client/acces";

/**
 * Les accès du client à son espace : création, lien à transmettre, retrait.
 * Pensé pour l'iPad : cibles de 48 px, copie en un geste, envoi par Mail ou Messages.
 */

interface Props {
  missionId: string;
  orgNom: string | null;
  cleDisponible: boolean;
  acces: Acces[];
  consultante: string;
  validite: string;
}

const heure = (iso: string) => {
  const d = new Date(iso);
  const jour = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "Europe/Paris" });
  const [h, m] = d
    .toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" })
    .split(":");
  return `${jour} à ${Number(h)} h ${m}`;
};

const jour = (iso: string) =>
  new Date(iso).toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Paris" });

const prenom = (nom: string | null) => (nom ? nom.split(" ")[0] : "");

const texteMessage = (l: NonNullable<Extract<ResultatAcces, { ok: true }>["lien"]>, consultante: string) =>
  [
    `Bonjour${l.nom ? ` ${prenom(l.nom)}` : ""},`,
    "",
    "Votre espace client ANM Consulting est ouvert. Vous y suivrez l’avancement de la mission, déposerez les pièces demandées et retrouverez le rapport.",
    "",
    `Pour choisir votre mot de passe, ouvrez ce lien avant le ${heure(l.expireLe)} :`,
    l.url,
    "",
    `Votre identifiant est votre adresse e-mail : ${l.email}`,
    "",
    consultante,
    "ANM Consulting",
  ].join("\n");

const BoutonCopier = ({ texte, libelle }: { texte: string; libelle: string }) => {
  const [copie, setCopie] = useState(false);
  useEffect(() => {
    if (!copie) return;
    const t = setTimeout(() => setCopie(false), 2500);
    return () => clearTimeout(t);
  }, [copie]);
  return (
    <button
      type="button"
      onClick={async () => {
        try {
          await navigator.clipboard.writeText(texte);
          setCopie(true);
        } catch {
          setCopie(false);
        }
      }}
      className="flex min-h-12 items-center gap-2 whitespace-nowrap rounded-[5px] bg-encre px-5 text-meta font-medium text-papier transition-colors hover:bg-vert"
    >
      {copie ? <Check size={18} aria-hidden /> : <Copy size={18} aria-hidden />}
      <span aria-live="polite">{copie ? "Copié" : libelle}</span>
    </button>
  );
};

const LienATransmettre = ({
  resultat,
  consultante,
  validite,
}: {
  resultat: Extract<ResultatAcces, { ok: true }>;
  consultante: string;
  validite: string;
}) => {
  const l = resultat.lien;
  if (!l) return null;
  const message = texteMessage(l, consultante);
  const sujet = "Votre espace client ANM Consulting";
  return (
    <div className="flex flex-col gap-5 rounded-[5px] border border-vert/30 bg-menthe-2 p-5 md:p-6" role="status">
      <p className="text-meta text-encre">{resultat.message}</p>
      <div className="flex flex-col gap-2">
        <label htmlFor="lien-acces" className="text-meta font-medium text-encre">
          Lien pour {l.nom ?? l.email}
        </label>
        <input
          id="lien-acces"
          readOnly
          value={l.url}
          onFocus={(e) => e.currentTarget.select()}
          className="h-12 w-full rounded-[5px] border border-filet bg-papier px-4 font-mono text-note text-encre"
        />
        <p className="text-note text-encre-2">
          Valable {validite}, jusqu’au {heure(l.expireLe)}, et une seule fois. Passé ce délai, créez un nouveau lien.
        </p>
      </div>
      <div className="flex flex-wrap gap-3">
        <BoutonCopier texte={l.url} libelle="Copier le lien" />
        <BoutonCopier texte={message} libelle="Copier le message" />
        <a
          href={`mailto:${l.email}?subject=${encodeURIComponent(sujet)}&body=${encodeURIComponent(message)}`}
          className="flex min-h-12 items-center gap-2 whitespace-nowrap rounded-[5px] border border-encre/70 px-5 text-meta font-medium text-encre transition-colors hover:bg-encre hover:text-papier"
        >
          <EnvelopeSimple size={18} aria-hidden /> Envoyer par e-mail
        </a>
        <a
          href={`sms:?&body=${encodeURIComponent(message)}`}
          className="flex min-h-12 items-center gap-2 whitespace-nowrap rounded-[5px] border border-encre/70 px-5 text-meta font-medium text-encre transition-colors hover:bg-encre hover:text-papier"
        >
          <ChatText size={18} aria-hidden /> Envoyer par SMS
        </a>
      </div>
      <details className="text-meta text-encre-2">
        <summary className="flex min-h-11 cursor-pointer items-center text-encre">Voir le message prêt à envoyer</summary>
        <pre className="mt-2 whitespace-pre-wrap rounded-[5px] border border-filet bg-papier p-4 font-sans text-meta text-encre">{message}</pre>
      </details>
    </div>
  );
};

const LigneAcces = ({
  a,
  missionId,
  cleDisponible,
  surResultat,
}: {
  a: Acces;
  missionId: string;
  cleDisponible: boolean;
  surResultat: (r: ResultatAcces) => void;
}) => {
  const [enCours, demarrer] = useTransition();
  const [confirmer, setConfirmer] = useState(false);
  useEffect(() => {
    if (!confirmer) return;
    const t = setTimeout(() => setConfirmer(false), 6000);
    return () => clearTimeout(t);
  }, [confirmer]);

  const etat = a.retireLe
    ? { texte: `Accès retiré le ${jour(a.retireLe)}`, ton: "text-gris", point: "bg-brume" }
    : a.derniereConnexion
      ? { texte: `Actif · dernière connexion le ${jour(a.derniereConnexion)}`, ton: "text-mineur", point: "bg-mineur" }
      : { texte: "Mot de passe pas encore choisi", ton: "text-majeur", point: "bg-majeur" };

  const agir = (fn: typeof regenererLien) =>
    demarrer(async () => {
      setConfirmer(false);
      surResultat(await fn(missionId, a.id));
    });

  return (
    <li className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3 py-4">
      <div className="min-w-0 flex-1">
        <p className="text-corps font-medium text-encre">{a.nom ?? "Sans nom"}</p>
        <p className="truncate text-meta text-encre-2">{a.email ?? "Adresse non lisible sans la clé de service"}</p>
        <p className={`mt-1 flex items-center gap-2 text-note font-medium ${etat.ton}`}>
          <span className={`size-2 rounded-full ${etat.point}`} aria-hidden />
          {etat.texte}
        </p>
      </div>
      {cleDisponible ? (
        <div className="flex flex-wrap items-center gap-1">
          {a.retireLe ? (
            <button
              type="button"
              disabled={enCours}
              onClick={() => agir(retablirAcces)}
              className="min-h-12 px-3 text-meta font-medium text-vert underline-offset-4 hover:underline disabled:opacity-60"
            >
              Rétablir l’accès
            </button>
          ) : confirmer ? (
            <>
              <button
                type="button"
                disabled={enCours}
                onClick={() => agir(retirerAcces)}
                className="min-h-12 px-3 text-meta font-medium text-critique disabled:opacity-60"
              >
                Confirmer le retrait
              </button>
              <button type="button" onClick={() => setConfirmer(false)} className="min-h-12 px-3 text-meta text-encre-2">
                Annuler
              </button>
            </>
          ) : (
            <>
              <button
                type="button"
                disabled={enCours}
                onClick={() => agir(regenererLien)}
                className="min-h-12 px-3 text-meta font-medium text-vert underline-offset-4 hover:underline disabled:opacity-60"
              >
                Nouveau lien
              </button>
              <button
                type="button"
                disabled={enCours}
                onClick={() => setConfirmer(true)}
                className="min-h-12 px-3 text-meta text-encre-2 underline-offset-4 hover:text-critique hover:underline disabled:opacity-60"
              >
                Retirer l’accès
              </button>
            </>
          )}
        </div>
      ) : null}
    </li>
  );
};

const AccesClient = ({ missionId, orgNom, cleDisponible, acces, consultante, validite }: Props) => {
  const [etatForm, action, envoi] = useActionState(inviterClient, null);
  const [resultatLigne, setResultatLigne] = useState<ResultatAcces | null>(null);
  const formulaire = useRef<HTMLFormElement>(null);

  // Le dernier geste l'emporte : une création efface le résultat d'une ligne, et inversement.
  const [dernier, setDernier] = useState<"form" | "ligne" | null>(null);
  useEffect(() => {
    if (!etatForm) return;
    setDernier("form");
    if (etatForm.ok) formulaire.current?.reset();
  }, [etatForm]);
  const resultat = dernier === "form" ? etatForm : dernier === "ligne" ? resultatLigne : null;

  return (
    <div className="flex flex-col gap-8">
      {!cleDisponible ? (
        <p role="alert" className="flex gap-3 rounded-[5px] border border-critique/40 bg-critique-l/60 px-4 py-3 text-meta text-critique">
          <WarningCircle size={20} className="mt-0.5 shrink-0" aria-hidden />
          La clé de service Supabase n’est pas configurée sur ce serveur : les accès ne peuvent être ni créés ni retirés. Prévenez Merwan (variable SUPABASE_SERVICE_ROLE_KEY).
        </p>
      ) : null}

      {resultat ? (
        resultat.ok ? (
          resultat.lien ? (
            <LienATransmettre resultat={resultat} consultante={consultante} validite={validite} />
          ) : (
            <p role="status" className="rounded-[5px] border border-vert/40 bg-menthe-2 px-4 py-3 text-meta text-vert">
              {resultat.message}
            </p>
          )
        ) : (
          <p role="alert" className="rounded-[5px] border border-critique/40 bg-critique-l/60 px-4 py-3 text-meta text-critique">
            {resultat.erreur}
          </p>
        )
      ) : null}

      {acces.length ? (
        <ul className="flex flex-col divide-y divide-filet border-y border-filet">
          {acces.map((a) => (
            <LigneAcces
              key={a.id}
              a={a}
              missionId={missionId}
              cleDisponible={cleDisponible}
              surResultat={(r) => {
                setResultatLigne(r);
                setDernier("ligne");
              }}
            />
          ))}
        </ul>
      ) : (
        <p className="text-meta text-encre-2">Personne chez {orgNom ?? "ce client"} n’a encore d’accès à l’espace client.</p>
      )}

      <form ref={formulaire} action={action} className="flex flex-col gap-5 rounded-[5px] border border-filet bg-papier p-5 md:p-6" noValidate>
        <input type="hidden" name="missionId" value={missionId} />
        <h4 className="font-display text-t4 text-encre">Ouvrir un accès</h4>
        <div className="grid gap-5 md:grid-cols-2">
          <div className="flex flex-col gap-2">
            <label htmlFor="acces-nom" className="text-meta font-medium text-encre">
              Prénom et nom
            </label>
            <input
              id="acces-nom"
              name="nom"
              autoComplete="off"
              required
              disabled={!cleDisponible}
              className="h-12 rounded-[5px] border border-gris/60 bg-papier px-4 text-base text-encre outline-none transition-colors focus-visible:border-vert disabled:opacity-60"
            />
          </div>
          <div className="flex flex-col gap-2">
            <label htmlFor="acces-email" className="text-meta font-medium text-encre">
              Adresse e-mail
            </label>
            <input
              id="acces-email"
              name="email"
              type="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck={false}
              autoComplete="off"
              required
              disabled={!cleDisponible}
              className="h-12 rounded-[5px] border border-gris/60 bg-papier px-4 text-base text-encre outline-none transition-colors focus-visible:border-vert disabled:opacity-60"
            />
          </div>
        </div>
        <p className="text-note text-gris">
          Aucun e-mail ne part automatiquement : l’outil crée le compte et vous donne un lien à transmettre vous-même. La personne y choisit son mot de passe.
        </p>
        <button
          type="submit"
          disabled={envoi || !cleDisponible}
          className="h-12 self-start whitespace-nowrap rounded-[5px] bg-encre px-6 text-corps font-medium text-papier transition-colors hover:bg-vert disabled:opacity-60"
        >
          {envoi ? "Création…" : "Créer l’accès et le lien"}
        </button>
      </form>
    </div>
  );
};

export default AccesClient;
