import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { dureeLisible, lireAccesMission, VALIDITE_LIEN_MINUTES } from "@/lib/espace-client/acces";
import AccesClient from "@/components/espace-client/AccesClient";
import EtapeClient from "@/components/espace-client/EtapeClient";
import FilEchanges, { type MessageFil } from "@/components/espace-client/FilEchanges";
import type { StatutMission } from "@/lib/types";

export const metadata: Metadata = { title: "Espace client — ANM Consulting", robots: { index: false } };

/**
 * Tout ce qui concerne l'espace du client pour cette mission : qui y a accès, ce qu'il y voit,
 * et le fil d'échange. Le client ne voit jamais l'outil : seulement l'étape choisie ici, les
 * pièces demandées, les messages et les versions du rapport publiées.
 */
export default async function EspaceClientMissionPage({ params }: { params: Promise<{ id: string }> }) {
  const session = await exigerRole("consultant");
  const { id } = await params;
  const supabase = await createClient();

  const [{ data: mission }, etat, { data: messages }, { data: demandes }, { data: rapports }] = await Promise.all([
    supabase.from("missions").select("status").eq("id", id).maybeSingle<{ status: StatutMission }>(),
    lireAccesMission(id),
    supabase
      .from("mission_messages")
      .select("id, body, created_at, author_id, read_at")
      .eq("mission_id", id)
      .order("created_at", { ascending: true }),
    supabase.from("document_requests").select("status").eq("mission_id", id).neq("status", "annulee"),
    supabase.from("reports").select("version, published_to_client").eq("mission_id", id).order("generated_at", { ascending: false }),
  ]);
  if (!mission) notFound();

  const lignes = (messages ?? []) as { id: string; body: string; created_at: string; author_id: string | null; read_at: string | null }[];
  const auteurs = [...new Set(lignes.map((m) => m.author_id).filter((x): x is string => Boolean(x)))];
  const { data: profils } = auteurs.length
    ? await supabase.from("profiles").select("id, full_name, role").in("id", auteurs)
    : { data: [] };
  const parId = new Map(((profils ?? []) as { id: string; full_name: string | null; role: string }[]).map((p) => [p.id, p]));
  const fil: MessageFil[] = lignes.map((m) => {
    const p = m.author_id ? parId.get(m.author_id) : undefined;
    const deMoi = m.author_id === session.utilisateurId;
    return {
      id: m.id,
      corps: m.body,
      le: m.created_at,
      deMoi,
      auteur: deMoi ? "Vous" : p ? `${p.full_name ?? "Sans nom"}${p.role === "client" ? "" : " (ANM Consulting)"}` : "Compte supprimé",
      lu: Boolean(m.read_at),
    };
  });

  const d = (demandes ?? []) as { status: string }[];
  const ouvertes = d.filter((x) => x.status === "ouverte" || x.status === "relancee").length;
  const recues = d.filter((x) => x.status === "recue").length;
  const publiees = ((rapports ?? []) as { version: string; published_to_client: boolean }[]).filter((r) => r.published_to_client);
  const actifs = etat.acces.filter((a) => !a.retireLe).length;

  return (
    <div className="flex flex-col gap-14">
      <div className="flex flex-col gap-3">
        <p className="etiquette">Administratif · Espace client</p>
        <h2 className="font-display text-t3 text-encre">Espace client</h2>
        <p className="max-w-2xl text-corps text-encre-2">
          Ce que {etat.orgNom ?? "le client"} voit de la mission : l’étape en cours, les pièces demandées, vos échanges et le rapport une fois publié. Jamais l’outil ni vos notes.
        </p>
      </div>

      <section aria-labelledby="acces" className="flex flex-col gap-5">
        <div>
          <h3 id="acces" className="font-display text-t4 text-encre">
            Accès {actifs ? `(${actifs} actif${actifs > 1 ? "s" : ""})` : ""}
          </h3>
          <p className="mt-1 max-w-2xl text-meta text-encre-2">
            Chaque accès est personnel et rattaché à {etat.orgNom ?? "la société"}. Retirer un accès bloque la connexion sans rien effacer du dossier.
          </p>
        </div>
        <AccesClient
          missionId={id}
          orgNom={etat.orgNom}
          cleDisponible={etat.cleDisponible}
          acces={etat.acces}
          consultante={session.profil?.full_name ?? "ANM Consulting"}
          validite={dureeLisible(VALIDITE_LIEN_MINUTES)}
        />
      </section>

      <section aria-labelledby="voit" className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <div className="flex flex-col gap-4">
          <div>
            <h3 id="voit" className="font-display text-t4 text-encre">Étape affichée au client</h3>
            <p className="mt-1 text-meta text-encre-2">Le client voit ces mots, pas les étapes de l’outil. Avancez-la quand vous voulez qu’il le sache.</p>
          </div>
          <EtapeClient missionId={id} statut={mission.status} />
        </div>
        <div className="flex flex-col gap-4">
          <h3 className="font-display text-t4 text-encre">Pièces et rapport</h3>
          <ul className="flex flex-col divide-y divide-filet border-y border-filet text-meta">
            <li className="flex min-h-12 flex-wrap items-center justify-between gap-2 py-2">
              <span className="text-encre">
                {ouvertes
                  ? `${ouvertes} pièce${ouvertes > 1 ? "s" : ""} demandée${ouvertes > 1 ? "s" : ""}, en attente de dépôt`
                  : "Aucune pièce en attente de dépôt"}
                {recues ? <span className="block text-note text-gris">{recues} déjà reçue{recues > 1 ? "s" : ""} en réponse à une demande</span> : null}
              </span>
              <Link href={`/admin/missions/${id}/pieces`} className="text-vert underline-offset-4 hover:underline">
                Demander des pièces
              </Link>
            </li>
            <li className="flex min-h-12 flex-wrap items-center justify-between gap-2 py-2">
              <span className="text-encre">
                {publiees.length
                  ? `Rapport visible par le client : ${publiees.map((r) => r.version).join(", ")}`
                  : "Aucune version du rapport n’est visible par le client"}
              </span>
              <Link href={`/admin/missions/${id}/rapport`} className="text-vert underline-offset-4 hover:underline">
                Gérer le rapport
              </Link>
            </li>
          </ul>
          <p className="text-note text-gris">
            Les fichiers déposés par le client arrivent directement dans Pièces, et la pièce passe en reçue. Ses messages arrivent ici ; le menu de la mission signale ceux que vous n’avez pas lus. Aucun e-mail ne vous prévient encore.
          </p>
        </div>
      </section>

      <section aria-labelledby="echanges" className="flex max-w-3xl flex-col gap-5">
        <div>
          <h3 id="echanges" className="font-display text-t4 text-encre">Échanges</h3>
          <p className="mt-1 text-meta text-encre-2">Le fil que le client voit dans son espace.</p>
        </div>
        <FilEchanges
          missionId={id}
          messages={fil}
          vide="Aucun message pour l’instant."
          aide="Le client lit ce message dans son espace. Écrivez comme dans un e-mail : il n’est pas prévenu par e-mail pour l’instant."
        />
      </section>
    </div>
  );
}
