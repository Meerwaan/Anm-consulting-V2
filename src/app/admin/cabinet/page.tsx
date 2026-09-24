import type { Metadata } from "next";
import { exigerRole } from "@/lib/supabase/session";
import { lireCabinet } from "@/lib/facturation/donnees";
import { tvaIntracom } from "@/lib/facturation/annuaire";
import FormCabinet from "@/components/facturation/FormCabinet";

export const metadata: Metadata = { title: "Cabinet — ANM Consulting", robots: { index: false } };

/** Les informations d'ANM Consulting, saisies une fois, reprises sur chaque contrat et facture. */
export default async function CabinetPage() {
  await exigerRole("consultant");
  const cabinet = await lireCabinet();
  return (
    <div className="flex max-w-3xl flex-col gap-8">
      <div className="flex flex-col gap-2">
        <h1 className="font-display text-t2 text-encre">Cabinet</h1>
        <p className="text-corps text-encre-2">
          Les informations d’ANM Consulting, saisies une seule fois. Chaque contrat et chaque facture les reprend. Une facture déjà émise garde
          celles du jour de son émission.
        </p>
      </div>
      <FormCabinet cabinet={{ ...cabinet, capital: cabinet.capital === null ? null : Number(cabinet.capital) }} tva={tvaIntracom(cabinet.siren)} />
    </div>
  );
}
