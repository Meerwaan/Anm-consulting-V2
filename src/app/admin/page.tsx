import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { OFFRES } from "@/content/offres";
import { creerMission } from "./actions";

export const metadata: Metadata = { title: "Missions — ANM Consulting", robots: { index: false } };

interface LigneMission {
  id: string;
  reference: string;
  type: string;
  status: string;
  opened_on: string;
  control_in_progress: boolean;
  organisation: { name: string } | null;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("missions")
    .select("id, reference, type, status, opened_on, control_in_progress, organisation:organizations (name)")
    .order("opened_on", { ascending: false });
  const missions = (data as LigneMission[] | null) ?? [];

  return (
    <div className="flex flex-col gap-10">
      <section>
        <h1 className="text-3xl">Missions</h1>
        <p className="mt-2 text-sm text-[var(--anm-muted)]">
          {missions.length === 0
            ? "Aucune mission pour l'instant. Crée la première ci-dessous."
            : `${missions.length} mission${missions.length > 1 ? "s" : ""}.`}
        </p>

        {missions.length > 0 ? (
          <div className="mt-5 overflow-x-auto">
            <table className="w-full min-w-[46rem] border-collapse text-sm">
              <thead>
                <tr className="border-b border-[var(--anm-hairline)] text-left font-mono text-[0.68rem] uppercase tracking-widest text-[var(--anm-muted)]">
                  <th className="py-2 pr-4">Référence</th>
                  <th className="py-2 pr-4">Client</th>
                  <th className="py-2 pr-4">Type</th>
                  <th className="py-2 pr-4">Statut</th>
                  <th className="py-2 pr-4">Ouverte le</th>
                  <th className="py-2" />
                </tr>
              </thead>
              <tbody>
                {missions.map((m) => (
                  <tr key={m.id} className="border-b border-[var(--anm-hairline)]">
                    <td className="py-2.5 pr-4 font-mono text-xs">{m.reference}</td>
                    <td className="py-2.5 pr-4 font-medium">{m.organisation?.name ?? "—"}</td>
                    <td className="py-2.5 pr-4">{OFFRES.find((o) => o.id === m.type)?.nom ?? m.type}</td>
                    <td className="py-2.5 pr-4">
                      {m.status.replace(/_/g, " ")}
                      {m.control_in_progress ? (
                        <span className="ml-2 font-mono text-[0.65rem] uppercase text-[var(--anm-critique)]">
                          contrôle en cours
                        </span>
                      ) : null}
                    </td>
                    <td className="py-2.5 pr-4 font-mono text-xs text-[var(--anm-muted)]">{m.opened_on}</td>
                    <td className="py-2.5 text-right">
                      <Link href={`/admin/missions/${m.id}/etapes/1`} className="underline hover:text-[var(--anm-green)]">
                        Ouvrir
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </section>

      <section className="max-w-2xl rounded border border-[var(--anm-hairline)] bg-[var(--anm-paper)] p-5">
        <h2 className="text-xl">Nouvelle mission</h2>
        <p className="mt-1 text-sm text-[var(--anm-muted)]">
          Les modules, les 15 étapes, les 7 phases et la liste des pièces à réclamer se mettent en place tout seuls.
        </p>
        <form action={creerMission} className="mt-4 grid gap-3 sm:grid-cols-2">
          <label className="flex flex-col gap-1 text-sm sm:col-span-2">
            Client
            <input name="client" required placeholder="SECURIS 93" className="rounded border border-[var(--anm-hairline)] bg-white px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Référence dossier
            <input name="reference" required placeholder="2026-014" className="rounded border border-[var(--anm-hairline)] bg-white px-3 py-2 font-mono" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Type de mission
            <select name="type" defaultValue="audit_360" className="rounded border border-[var(--anm-hairline)] bg-white px-3 py-2">
              {OFFRES.filter((o) => o.id !== "suivi_conformite").map((o) => (
                <option key={o.id} value={o.id}>{o.nom}</option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Effectif
            <input name="effectif" type="number" min={0} className="rounded border border-[var(--anm-hairline)] bg-white px-3 py-2" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Établissements
            <input name="sites" type="number" min={0} className="rounded border border-[var(--anm-hairline)] bg-white px-3 py-2" />
          </label>
          <button type="submit" className="mt-1 rounded bg-[var(--anm-green)] px-4 py-2 font-medium text-[var(--anm-paper)] sm:col-span-2">
            Créer la mission
          </button>
        </form>
      </section>
    </div>
  );
}
