import Link from "next/link";
import type { Metadata } from "next";
import { CaretRight } from "@phosphor-icons/react/dist/ssr";
import { createClient } from "@/lib/supabase/server";
import { OFFRES } from "@/content/offres";
import NouvelleMission from "@/components/portail/NouvelleMission";

export const metadata: Metadata = { title: "Missions — ANM Consulting", robots: { index: false } };

interface LigneMission {
  id: string;
  reference: string;
  type: string;
  opened_on: string;
  control_in_progress: boolean;
  control_body: string | null;
  control_deadline: string | null;
  organisation: { name: string } | null;
}

export default async function AdminPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("missions")
    .select("id, reference, type, opened_on, control_in_progress, control_body, control_deadline, organisation:organizations (name)")
    .order("opened_on", { ascending: false });
  const missions = (data as LigneMission[] | null) ?? [];
  const annee = new Date().getFullYear();
  const numeros = missions.map((m) => Number(m.reference.match(new RegExp(`^${annee}-(\\d+)$`))?.[1] ?? 0));
  const referenceProposee = `${annee}-${String(Math.max(0, ...numeros) + 1).padStart(2, "0")}`;

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col gap-6">
        <div>
          <h1 className="font-display text-t2 text-encre">Missions</h1>
          <p className="mt-2 text-corps text-encre-2">
            {missions.length === 0 ? "Aucune mission pour l’instant. Crée la première ci-dessous." : `${missions.length} mission${missions.length > 1 ? "s" : ""}.`}
          </p>
        </div>
        {missions.length ? (
          <ul className="flex flex-col border-t-[1.5px] border-encre">
            {missions.map((m) => (
              <li key={m.id} className="border-b border-filet">
                <Link href={`/admin/missions/${m.id}`} className="flex min-h-20 items-center justify-between gap-4 py-3 transition-colors hover:bg-papier">
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-display text-t4 text-encre">{m.organisation?.name ?? "Client"}</span>
                    <span className="text-meta text-encre-2">
                      Mission {m.reference} · {OFFRES.find((o) => o.id === m.type)?.nom ?? m.type} · ouverte le{" "}
                      {new Date(`${m.opened_on}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" })}
                    </span>
                    {m.control_in_progress ? (
                      <span className="text-meta font-medium text-critique">
                        Contrôle {m.control_body ?? ""} en cours
                        {m.control_deadline ? ` · échéance le ${new Date(`${m.control_deadline}T12:00:00Z`).toLocaleDateString("fr-FR", { timeZone: "UTC" })}` : ""}
                      </span>
                    ) : null}
                  </span>
                  <CaretRight size={22} className="shrink-0 text-gris" aria-hidden />
                </Link>
              </li>
            ))}
          </ul>
        ) : null}
      </section>

      <section aria-labelledby="deroule" className="flex flex-col gap-5">
        <div>
          <h2 id="deroule" className="font-display text-t3 text-encre">Comment se déroule une mission</h2>
          <p className="mt-1 max-w-2xl text-meta text-encre-2">
            Huit étapes, toujours dans le même ordre, dans la barre de gauche de chaque mission. Chaque étape dit où elle en est : à faire,
            en cours, faite. En bas de chaque page, un bouton mène à l’étape suivante. Tout s’enregistre tout seul.
          </p>
        </div>
        <ol className="grid gap-x-8 gap-y-5 border-y border-filet py-5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["Préparer", "1", "Réunir les pièces justificatives, déposées depuis l’iPad."],
            ["Saisir", "2 · 3", "Les heures vendues et payées, puis le dossier de chaque sous-traitant. L’outil calcule les écarts."],
            ["Contrôler", "4 · 5 · 6", "DGFiP, URSSAF, CNAPS : répondre aux points au toucher, lire les alertes, conclure."],
            ["Conclure", "7 · 8", "Transformer les anomalies en actions, relire les textes, émettre le rapport."],
          ].map(([titre, n, texte]) => (
            <li key={titre} className="flex flex-col gap-1">
              <span className="font-mono text-note text-gris">{n}</span>
              <span className="text-corps font-medium text-encre">{titre}</span>
              <span className="text-meta text-encre-2">{texte}</span>
            </li>
          ))}
        </ol>
        <p className="text-meta text-encre-2">
          Pour t’entraîner : ouvre la mission « Démo — Horizon Sécurité Privée ». Elle contient de vraies anomalies à trouver, et tu peux tout
          y modifier sans risque.
        </p>
      </section>

      <section className="flex max-w-3xl flex-col gap-6 rounded-[5px] border border-filet bg-papier p-6 md:p-8">
        <div>
          <h2 className="font-display text-t3 text-encre">Nouvelle mission</h2>
          <p className="mt-1 text-meta text-encre-2">Le client, le contexte du contrôle et la période. Tout se complète ensuite dans la mission.</p>
        </div>
        <NouvelleMission offres={OFFRES.filter((o) => o.id !== "suivi_conformite").map((o) => ({ id: o.id, nom: o.nom }))} referenceProposee={referenceProposee} />
      </section>
    </div>
  );
}
