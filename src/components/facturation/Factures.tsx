"use client";

import { useState, useTransition } from "react";
import { CheckCircle, FilePdf, Receipt } from "@phosphor-icons/react";
import type { EtatFormulaire } from "@/app/admin/missions/[id]/(outil)/contrat/actions";
import { Message, boutonPrincipal, boutonSecondaire } from "./FicheClient";

export interface LigneListe {
  id: string;
  numero: string;
  libelle: string;
  emise_le: string;
  echeance_le: string;
  net_a_payer: number;
  payee_le: string | null;
  annulee: boolean;
  avoir: boolean;
  annulable: boolean;
}

export interface FactureProposee {
  nature: "acompte" | "solde" | "totale";
  titre: string;
  detail: string;
  ht: number;
  ttc: number;
}

const eur = (n: number) => n.toLocaleString("fr-FR", { style: "currency", currency: "EUR" });
const date = (d: string) => new Date(`${d}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" });

/**
 * Les factures de la mission. Émettre demande une confirmation : une facture émise reçoit le
 * numéro suivant de la série et ne se modifie plus ; une erreur se corrige par un avoir.
 */
const Factures = ({
  factures,
  possibles,
  manques,
  emettre,
  avoir,
  payer,
}: {
  factures: LigneListe[];
  possibles: FactureProposee[];
  manques: string[];
  emettre: (nature: FactureProposee["nature"]) => Promise<EtatFormulaire>;
  avoir: (factureId: string) => Promise<EtatFormulaire>;
  payer: (factureId: string, payee: boolean) => Promise<void>;
}) => {
  const [aConfirmer, setAConfirmer] = useState<FactureProposee | null>(null);
  const [avoirAConfirmer, setAvoirAConfirmer] = useState<LigneListe | null>(null);
  const [etat, setEtat] = useState<EtatFormulaire>({ ok: false, message: null });
  const [enCours, demarrer] = useTransition();
  const aujourdHui = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });

  return (
    <div className="flex flex-col gap-6">
      {factures.length ? (
        <ul className="flex flex-col border-t-[1.5px] border-encre">
          {factures.map((f) => {
            const retard = !f.avoir && !f.annulee && !f.payee_le && f.echeance_le < aujourdHui;
            return (
              <li key={f.id} className="flex flex-col gap-3 border-b border-filet py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                    <span className="font-mono text-meta tabular-nums text-encre">{f.numero}</span>
                    <span className={`text-corps ${f.annulee ? "text-gris line-through" : "text-encre"}`}>{f.libelle}</span>
                    <span className="text-corps font-medium tabular-nums text-encre">{eur(f.net_a_payer)} TTC</span>
                  </p>
                  <p className="text-meta text-encre-2">
                    Émise le {date(f.emise_le)}
                    {f.avoir ? "" : f.annulee ? " · annulée par un avoir" : f.payee_le ? ` · payée le ${date(f.payee_le)}` : ` · échéance le ${date(f.echeance_le)}`}
                    {retard ? <span className="font-medium text-critique"> · en retard</span> : null}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <a href={`/admin/factures/${f.id}/pdf`} target="_blank" rel="noopener" className={boutonSecondaire}>
                    <FilePdf size={18} aria-hidden /> PDF
                  </a>
                  {!f.avoir && !f.annulee ? (
                    <button type="button" disabled={enCours} onClick={() => demarrer(() => payer(f.id, !f.payee_le))} className={boutonSecondaire}>
                      <CheckCircle size={18} weight={f.payee_le ? "fill" : "regular"} className={f.payee_le ? "text-vert" : ""} aria-hidden />
                      {f.payee_le ? "Payée · annuler" : "Marquer payée"}
                    </button>
                  ) : null}
                  {f.annulable ? (
                    <button type="button" onClick={() => { setAvoirAConfirmer(f); setAConfirmer(null); }} className={`${boutonSecondaire} text-critique`}>
                      Annuler par un avoir
                    </button>
                  ) : null}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-corps text-encre-2">Aucune facture pour cette mission.</p>
      )}

      {avoirAConfirmer ? (
        <div role="alertdialog" aria-label="Confirmer l’avoir" className="flex flex-col gap-3 rounded-[5px] border border-critique/40 bg-papier p-5">
          <p className="text-corps text-encre">
            Émettre un avoir de <span className="font-medium tabular-nums">{eur(-avoirAConfirmer.net_a_payer)} TTC</span> qui annule la facture {avoirAConfirmer.numero} ?
          </p>
          <p className="text-meta text-encre-2">L’avoir reçoit son propre numéro (série AV). Il ne se supprime pas. Tu pourras ensuite émettre une facture corrigée.</p>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={enCours}
              onClick={() => demarrer(async () => { setEtat(await avoir(avoirAConfirmer.id)); setAvoirAConfirmer(null); })}
              className={boutonPrincipal}
            >
              {enCours ? "Émission…" : "Émettre l’avoir"}
            </button>
            <button type="button" onClick={() => setAvoirAConfirmer(null)} className={boutonSecondaire}>Ne rien faire</button>
          </div>
        </div>
      ) : null}

      {manques.length && possibles.length ? (
        <div className="rounded-[5px] border border-majeur/40 bg-papier p-4 text-meta text-encre-2">
          <p className="font-medium text-encre">Avant d’émettre une facture, il manque :</p>
          <ul className="mt-1 list-disc pl-5">
            {manques.map((m) => <li key={m}>{m}</li>)}
          </ul>
        </div>
      ) : null}

      {possibles.length ? (
        aConfirmer ? (
          <div role="alertdialog" aria-label="Confirmer l’émission" className="flex flex-col gap-3 rounded-[5px] border border-encre bg-papier p-5">
            <p className="font-display text-t4 text-encre">{aConfirmer.titre}</p>
            <p className="text-corps text-encre-2">{aConfirmer.detail}</p>
            <p className="text-corps text-encre">
              <span className="tabular-nums">{eur(aConfirmer.ht)} HT</span> · <span className="font-medium tabular-nums">{eur(aConfirmer.ttc)} TTC</span>
            </p>
            <p className="text-meta text-encre-2">
              Elle reçoit le numéro suivant de la série et ne se modifie plus : une erreur se corrige par un avoir. Vérifie l’aperçu du contrat avant si tu as un doute.
            </p>
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                disabled={enCours}
                onClick={() => demarrer(async () => { setEtat(await emettre(aConfirmer.nature)); setAConfirmer(null); })}
                className={boutonPrincipal}
              >
                <Receipt size={18} aria-hidden />
                {enCours ? "Émission…" : "Émettre la facture"}
              </button>
              <button type="button" onClick={() => setAConfirmer(null)} className={boutonSecondaire}>Ne rien faire</button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
            {possibles.map((p) => (
              <button
                key={p.nature}
                type="button"
                disabled={manques.length > 0}
                onClick={() => { setAConfirmer(p); setAvoirAConfirmer(null); setEtat({ ok: false, message: null }); }}
                className={p.nature === "totale" && possibles.length > 1 ? boutonSecondaire : boutonPrincipal}
              >
                <Receipt size={18} aria-hidden />
                {p.titre} · {eur(p.ttc)} TTC
              </button>
            ))}
          </div>
        )
      ) : factures.length ? (
        <p className="text-meta text-vert">La mission est entièrement facturée.</p>
      ) : null}

      <Message etat={etat} />
    </div>
  );
};

export default Factures;
