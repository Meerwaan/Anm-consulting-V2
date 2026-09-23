import type { Metadata } from "next";
import EtapePage from "@/components/portail/EtapePage";
import GrilleSaisie from "@/components/grilles/GrilleSaisie";
import ConclusionsSaisie from "@/components/grilles/ConclusionsSaisie";
import { GRILLE_CNAPS, RAPPEL_DRACAR, SECTIONS_DRACAR } from "@/content/grilles";
import BilanGrille from "@/components/grilles/BilanGrille";
import { bilanGrille } from "@/lib/modules/analyse";
import { lireGrilles } from "@/lib/grilles/lecture";
import { lireDonneesST } from "@/lib/sous-traitance/lecture";
import { analyserCartes, analyserIdentites } from "@/lib/sous-traitance/calculs";
import { versLigneInitiale } from "@/lib/sous-traitance/tables";
import TableauSaisie from "@/components/sous-traitance/TableauSaisie";
import ListeAlertes from "@/components/sous-traitance/ListeAlertes";

export const metadata: Metadata = { title: "CNAPS — ANM Consulting", robots: { index: false } };

/**
 * Le contrôle CNAPS, bâti sur les fiches de Dracar Ultimate (dictée de Sofia du 21/09/2026) :
 * sa grille 01 §1, §2, §5 et §10, les fiches pratiques du CNAPS et la synthèse de son §13.
 */
export default async function CnapsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const [g, d] = await Promise.all([lireGrilles(id), lireDonneesST(id)]);
  const agents = d.agents.filter((a) => a.sous_traitant_id === null);
  const aujourdHui = new Date().toISOString().slice(0, 10);
  const alertesCartes = analyserCartes(d.agents, aujourdHui);
  const bilan = bilanGrille(g, "cnaps", "mission", GRILLE_CNAPS.sections);

  return (
    <div className="flex flex-col gap-12">
      <div className="flex flex-col gap-3">
        <EtapePage chemin="cnaps" />
        <h2 className="font-display text-t3 text-encre">Contrôle CNAPS · Dracar Ultimate</h2>
        <p className="max-w-2xl text-corps text-encre-2">{RAPPEL_DRACAR}</p>
      </div>

      <BilanGrille b={bilan} />

      <section aria-labelledby="points" className="flex flex-col gap-5">
        <h3 id="points" className="font-display text-t4 text-encre">Obligations Dracar Ultimate</h3>
        <p className="-mt-3 max-w-2xl text-meta text-encre-2">Une section par fiche Dracar Ultimate. « Sans objet » pour ce que l’entreprise ne fait pas.</p>
        <GrilleSaisie missionId={id} grille="cnaps" cible="mission" sections={GRILLE_CNAPS.sections.filter((s) => SECTIONS_DRACAR.includes(s.code))} reponses={g.reponses} />
      </section>

      <section aria-labelledby="autres" className="flex flex-col gap-5">
        <h3 id="autres" className="font-display text-t4 text-encre">Le reste du contrôle CNAPS</h3>
        <p className="-mt-3 max-w-2xl text-meta text-encre-2">
          Agents, missions et sites, activités particulières, sous-traitance et déontologie (grille 01). Les activités que l’entreprise
          n’exerce pas se passent en « Sans objet ».
        </p>
        <GrilleSaisie missionId={id} grille="cnaps" cible="mission" sections={GRILLE_CNAPS.sections.filter((s) => !SECTIONS_DRACAR.includes(s.code))} reponses={g.reponses} />
      </section>

      <section aria-labelledby="cartes" className="flex flex-col gap-5">
        <div>
          <h3 id="cartes" className="font-display text-t4 text-encre">Suivi des cartes professionnelles</h3>
          <p className="mt-1 max-w-2xl text-meta text-encre-2">
            Les agents de l’entreprise : validité de la carte, déclaration dans Dracar Ultimate, présence au planning, affectation
            conforme. Une carte qui expire dans les 30 jours est signalée.
          </p>
        </div>
        <TableauSaisie
          missionId={id}
          table="agents_entreprise"
          lignes={agents.map((a) => versLigneInitiale("agents_entreprise", a as unknown as Record<string, unknown>))}
          titreVide="Aucun agent saisi. Ajoute-les un par un, ou colle la liste depuis Excel."
          libelleAjout="Ajouter un agent"
        />
        {agents.length ? (
          <div className="flex flex-col gap-3">
            <h4 className="text-corps font-medium text-encre">Identité et titre de travail</h4>
            <p className="-mt-2 max-w-2xl text-meta text-encre-2">
              Les mêmes agents : pièce d’identité ou titre de séjour, sa fin de validité, et l’autorisation de travailler (« Sans objet » pour un ressortissant français ou européen). Aussi visible dans URSSAF.
            </p>
            <TableauSaisie
              missionId={id}
              table="identite_entreprise"
              lignes={agents.map((a) => versLigneInitiale("identite_entreprise", a as unknown as Record<string, unknown>))}
              libelles={Object.fromEntries(agents.map((a) => [a.id, a.nom ?? "Agent sans nom"]))}
              titreVide=""
            />
          </div>
        ) : null}
        <ListeAlertes alertes={[...alertesCartes, ...analyserIdentites(agents, aujourdHui)]} vide="Toutes les cartes saisies sont valides et les agents déclarés." missionId={id} constatsExistants={g.nonConformites.map((n) => n.constat ?? "")} />
      </section>

      <section aria-labelledby="synthese" className="flex flex-col gap-6">
        <div>
          <h3 id="synthese" className="font-display text-t4 text-encre">Synthèse du contrôle</h3>
          <p className="mt-1 max-w-2xl text-meta text-encre-2">Le niveau de conformité, les actions correctives et le délai (grille 01 §13).</p>
        </div>
        <ConclusionsSaisie missionId={id} grille="cnaps" cible="mission" conclusions={GRILLE_CNAPS.conclusions} valeurs={g.conclusions} reponses={g.reponses} />
      </section>
    </div>
  );
}
