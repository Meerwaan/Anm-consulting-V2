import type { Metadata } from "next";
import GrilleSaisie from "@/components/grilles/GrilleSaisie";
import ConclusionsSaisie from "@/components/grilles/ConclusionsSaisie";
import { GRILLE_DRACAR, RAPPEL_DRACAR } from "@/content/grilles";
import { lireGrilles } from "@/lib/grilles/lecture";
import { lireDonneesST } from "@/lib/sous-traitance/lecture";
import { analyserCartes } from "@/lib/sous-traitance/calculs";
import { versLigneInitiale } from "@/lib/sous-traitance/tables";
import TableauSaisie from "@/components/sous-traitance/TableauSaisie";
import ListeAlertes from "@/components/sous-traitance/ListeAlertes";

export const metadata: Metadata = { title: "Dracar Ultimate — ANM Consulting", robots: { index: false } };

/**
 * Le contrôle CNAPS, recentré sur Dracar Ultimate (directive de Sofia du 21/09/2026) :
 * sa grille 01 §2, et la synthèse de son §13.
 */
export default async function DracarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [g, d] = await Promise.all([lireGrilles(id), lireDonneesST(id)]);
  const agents = d.agents.filter((a) => a.sous_traitant_id === null);
  const alertesCartes = analyserCartes(d.agents, new Date().toISOString().slice(0, 10));
  const items = GRILLE_DRACAR.sections.flatMap((s) => s.items);
  const valeur = (code: string) => g.reponses[`cnaps|mission|${code}`]?.reponse ?? null;
  const controles = items.filter((i) => valeur(i.code) && valeur(i.code) !== "na").length;
  const conformes = items.filter((i) => valeur(i.code) === "oui").length;
  const nonConformes = items.filter((i) => valeur(i.code) === "non").length;
  const aVerifier = items.filter((i) => valeur(i.code) === "a_verifier").length;

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <h2 className="font-display text-t3 text-encre">Dracar Ultimate</h2>
        <p className="max-w-2xl text-corps text-encre-2">{RAPPEL_DRACAR}</p>
      </div>

      <dl className="grid grid-cols-2 gap-x-8 gap-y-5 border-y border-filet py-5 sm:grid-cols-4">
        {[
          ["Points contrôlés", `${controles} / ${items.length}`, "text-encre"],
          ["Conformes", String(conformes), "text-encre"],
          ["Non-conformités", String(nonConformes), nonConformes ? "text-critique" : "text-encre"],
          ["À vérifier", String(aVerifier), aVerifier ? "text-majeur" : "text-encre"],
        ].map(([t, v, c]) => (
          <div key={t} className="flex flex-col gap-1">
            <dt className="text-note text-gris">{t}</dt>
            <dd className={`font-display text-t4 tabular-nums ${c}`}>{v}</dd>
          </div>
        ))}
      </dl>

      <section aria-labelledby="points" className="flex flex-col gap-5">
        <h3 id="points" className="font-display text-t4 text-encre">Obligations de vérification</h3>
        <GrilleSaisie missionId={id} grille="cnaps" cible="mission" sections={GRILLE_DRACAR.sections} reponses={g.reponses} />
      </section>

      <section aria-labelledby="cartes" className="flex flex-col gap-5">
        <div>
          <h3 id="cartes" className="font-display text-t4 text-encre">Suivi des cartes professionnelles</h3>
          <p className="mt-1 max-w-2xl text-meta text-encre-2">
            Les agents de l’entreprise : validité de la carte, déclaration dans Dracar Ultimate, présence au planning, affectation
            conforme. Une carte qui expire dans les 30 jours est signalée.
          </p>
        </div>
        <TableauSaisie
          missionId={id}
          table="agents_entreprise"
          lignes={agents.map((a) => versLigneInitiale("agents_entreprise", a as unknown as Record<string, unknown>))}
          titreVide="Aucun agent saisi. Ajoute-les un par un, ou colle la liste depuis Excel."
          libelleAjout="Ajouter un agent"
        />
        <ListeAlertes alertes={alertesCartes} vide="Toutes les cartes saisies sont valides et les agents déclarés." missionId={id} constatsExistants={g.nonConformites.map((n) => n.constat ?? "")} />
      </section>

      <section aria-labelledby="synthese" className="flex flex-col gap-6">
        <div>
          <h3 id="synthese" className="font-display text-t4 text-encre">Synthèse du contrôle</h3>
          <p className="mt-1 max-w-2xl text-meta text-encre-2">Le niveau de conformité, les actions correctives et le délai (grille 01 §13).</p>
        </div>
        <ConclusionsSaisie missionId={id} grille="cnaps" cible="mission" conclusions={GRILLE_DRACAR.conclusions} valeurs={g.conclusions} reponses={g.reponses} />
      </section>
    </div>
  );
}
