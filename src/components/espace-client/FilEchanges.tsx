"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { PaperPlaneRight } from "@phosphor-icons/react";
import { envoyerMessage, marquerLus } from "@/lib/espace-client/echanges-actions";

/**
 * Fil d'échange d'une mission, commun à l'espace client et à l'outil de la consultante.
 * Les messages reçus non lus sont marqués lus à l'ouverture.
 */

export interface MessageFil {
  id: string;
  corps: string;
  le: string;
  deMoi: boolean;
  auteur: string;
  lu: boolean;
}

interface Props {
  missionId: string;
  messages: MessageFil[];
  /** Texte d'aide sous le champ. */
  aide: string;
  vide: string;
}

const horodatage = (iso: string) => {
  const d = new Date(iso);
  const jour = d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", timeZone: "Europe/Paris" });
  const [h, m] = d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", timeZone: "Europe/Paris" }).split(":");
  return `${jour}, ${Number(h)} h ${m}`;
};

const FilEchanges = ({ missionId, messages, aide, vide }: Props) => {
  const [texte, setTexte] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const [envoi, demarrer] = useTransition();
  const fin = useRef<HTMLDivElement>(null);
  const nonLus = messages.some((m) => !m.deMoi && !m.lu);

  useEffect(() => {
    if (nonLus) void marquerLus(missionId);
  }, [nonLus, missionId]);

  // Après un envoi, le nouveau message reste en vue ; pas au chargement de la page.
  const nombreInitial = useRef(messages.length);
  useEffect(() => {
    if (messages.length > nombreInitial.current) fin.current?.scrollIntoView({ block: "end", behavior: "smooth" });
    nombreInitial.current = messages.length;
  }, [messages.length]);

  const envoyer = () =>
    demarrer(async () => {
      setErreur(null);
      const r = await envoyerMessage(missionId, texte);
      if (r.ok) setTexte("");
      else setErreur(r.erreur);
    });

  return (
    <div className="flex flex-col gap-6">
      {messages.length ? (
        <ol className="flex flex-col gap-4" aria-label="Messages">
          {messages.map((m) => (
            <li key={m.id} className={`flex flex-col gap-1 ${m.deMoi ? "items-end" : "items-start"}`}>
              <p className="text-note text-gris">
                {m.auteur} · {horodatage(m.le)}
              </p>
              <p
                className={`max-w-[38rem] whitespace-pre-wrap rounded-[5px] px-4 py-3 text-corps ${
                  m.deMoi ? "bg-encre text-papier" : "border border-filet bg-papier text-encre"
                }`}
              >
                {m.corps}
              </p>
            </li>
          ))}
        </ol>
      ) : (
        <p className="text-corps text-encre-2">{vide}</p>
      )}
      <div ref={fin} />
      <form
        className="flex flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          envoyer();
        }}
      >
        <label htmlFor={`message-${missionId}`} className="text-meta font-medium text-encre">
          Votre message
        </label>
        <textarea
          id={`message-${missionId}`}
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          rows={4}
          maxLength={4000}
          aria-describedby={`message-aide-${missionId}`}
          className="min-h-32 rounded-[5px] border border-gris/60 bg-papier px-4 py-3 text-base text-encre outline-none transition-colors focus-visible:border-vert"
        />
        <p id={`message-aide-${missionId}`} className="text-note text-gris">
          {aide}
        </p>
        {erreur ? (
          <p role="alert" className="rounded-[5px] border border-critique/40 bg-critique-l/60 px-4 py-3 text-meta text-critique">
            {erreur}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={envoi || !texte.trim()}
          className="flex h-12 items-center gap-2 self-start whitespace-nowrap rounded-[5px] bg-encre px-6 text-corps font-medium text-papier transition-colors hover:bg-vert disabled:opacity-60"
        >
          <PaperPlaneRight size={18} aria-hidden />
          {envoi ? "Envoi…" : "Envoyer"}
        </button>
      </form>
    </div>
  );
};

export default FilEchanges;
