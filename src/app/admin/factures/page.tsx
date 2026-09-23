import type { Metadata } from "next";
import Link from "next/link";
import { FilePdf } from "@phosphor-icons/react/dist/ssr";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { LIBELLE_NATURE, normaliserFacture, type Facture } from "@/lib/facturation/donnees";
import { fmtDate, fmtEuros } from "@/lib/sous-traitance/format";

export const metadata: Metadata = { title: "Factures — ANM Consulting", robots: { index: false } };

/** Toutes les factures du cabinet, dans l'ordre des numéros : ce qui est payé, ce qui reste à encaisser. */
export default async function FacturesPage() {
  await exigerRole("consultant");
  const supabase = await createClient();
  const { data } = await supabase.from("factures").select("*, mission:missions (id, reference)").order("numero", { ascending: false });
  const factures = ((data ?? []) as (Facture & { mission: { id: string; reference: string } })[]).map((f) => ({ ...normaliserFacture(f), mission: f.mission }));
  const annulees = new Set(factures.filter((f) => f.nature === "avoir").map((f) => f.facture_origine));
  const valables = factures.filter((f) => f.nature !== "avoir" && !annulees.has(f.id));
  const aujourdHui = new Date().toLocaleDateString("sv-SE", { timeZone: "Europe/Paris" });
  const encaisse = valables.filter((f) => f.payee_le).reduce((s, f) => s + f.net_a_payer, 0);
  const attendu = valables.filter((f) => !f.payee_le);
  const retard = attendu.filter((f) => f.echeance_le < aujourdHui);

  return (
    <div className="flex flex-col gap-10">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-t2 text-encre">Factures</h1>
        <p className="text-corps text-encre-2">
          Chaque facture s’émet depuis sa mission, page « Contrat et factures ». Ici, toutes les factures du cabinet, par numéro.
        </p>
      </div>

      <dl className="grid gap-px overflow-hidden rounded-[5px] border border-filet bg-filet sm:grid-cols-3">
        {[
          ["Encaissé", fmtEuros(encaisse), "text-encre"],
          ["À encaisser", `${fmtEuros(attendu.reduce((s, f) => s + f.net_a_payer, 0))} · ${attendu.length} facture${attendu.length > 1 ? "s" : ""}`, "text-encre"],
          ["En retard", retard.length ? `${fmtEuros(retard.reduce((s, f) => s + f.net_a_payer, 0))} · ${retard.length} facture${retard.length > 1 ? "s" : ""}` : "Aucune", retard.length ? "text-critique" : "text-encre"],
        ].map(([k, v, c]) => (
          <div key={k} className="flex flex-col gap-1 bg-papier p-5">
            <dt className="text-note text-gris">{k} (TTC)</dt>
            <dd className={`font-display text-t4 tabular-nums ${c}`}>{v}</dd>
          </div>
        ))}
      </dl>

      {factures.length ? (
        <ul className="flex flex-col border-t-[1.5px] border-encre">
          {factures.map((f) => {
            const annulee = annulees.has(f.id);
            const enRetard = f.nature !== "avoir" && !annulee && !f.payee_le && f.echeance_le < aujourdHui;
            return (
              <li key={f.id} className="flex flex-col gap-2 border-b border-filet py-4 md:flex-row md:items-center md:justify-between">
                <div className="flex min-w-0 flex-col gap-1">
                  <p className="flex flex-wrap items-baseline gap-x-3">
                    <span className="font-mono text-meta tabular-nums text-encre">{f.numero}</span>
                    <span className={`text-corps ${annulee ? "text-gris line-through" : "text-encre"}`}>{f.client.nom}</span>
                    <span className="text-corps font-medium tabular-nums text-encre">{fmtEuros(f.net_a_payer)}</span>
                  </p>
                  <p className="text-meta text-encre-2">
                    {LIBELLE_NATURE[f.nature]} · émise le {fmtDate(f.emise_le)} ·{" "}
                    <Link href={`/admin/missions/${f.mission.id}/contrat`} className="underline underline-offset-4 hover:text-vert">
                      mission {f.mission.reference}
                    </Link>
                    {f.nature === "avoir" ? "" : annulee ? " · annulée" : f.payee_le ? ` · payée le ${fmtDate(f.payee_le)}` : ` · échéance le ${fmtDate(f.echeance_le)}`}
                    {enRetard ? <span className="font-medium text-critique"> · en retard</span> : null}
                  </p>
                </div>
                <a href={`/admin/factures/${f.id}/pdf`} target="_blank" rel="noopener" className="flex min-h-12 w-fit items-center gap-2 rounded-[5px] border border-gris/60 bg-papier px-5 text-meta text-encre hover:border-encre">
                  <FilePdf size={18} aria-hidden /> PDF
                </a>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-corps text-encre-2">Aucune facture émise pour l’instant.</p>
      )}
    </div>
  );
}
