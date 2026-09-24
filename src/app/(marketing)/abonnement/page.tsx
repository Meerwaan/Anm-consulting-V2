import type { Metadata } from "next";
import { Bouton } from "@/components/vitrine/Bouton";
import { FAQ } from "@/components/vitrine/FAQ";
import { PortailApercu } from "@/components/vitrine/PortailApercu";
import { Cascade, Element, Reveal } from "@/components/vitrine/Reveal";
import { Conteneur, Filet, SectionHead } from "@/components/vitrine/SectionHead";
import { Abonnements, CtaFinal, Reperes } from "@/components/vitrine/Sections";
import { ABONNEMENTS } from "@/content/offres";
import { OBJECTIFS, PORTAIL_CLIENT } from "@/content/vision";

export const metadata: Metadata = {
  title: "Abonnement suivi conformité",
  description:
    "Quatre formules mensuelles de 390 à 990 € HT : revues périodiques, alertes cartes professionnelles et attestations, plan d’actions suivi, tableau de bord. Pour que les échéances ne repassent plus entre les mailles.",
  alternates: { canonical: "/abonnement" },
};

const CYCLE = [
  {
    titre: "Revue périodique",
    texte: "Trimestrielle, bimestrielle ou mensuelle selon la formule : on repasse sur les points sensibles, les nouvelles embauches, les nouveaux sites, les nouveaux sous-traitants.",
  },
  {
    titre: "Alertes échéances",
    texte: "Cartes professionnelles, agréments, attestations de vigilance, DUERP : le portail vous prévient à 90 jours, puis relance. Plus de renouvellement oublié.",
  },
  {
    titre: "Plan d’actions suivi",
    texte: "Les actions P1 → P4 issues de l’audit vivent dans votre espace. Vous cochez, nous sommes notifiés, nous ajustons à la revue suivante.",
  },
  {
    titre: "Point dirigeant",
    texte: "Un temps pour vous, pas pour l’administratif : ce qui a changé dans la réglementation, ce qui arrive, ce qu’il faut décider.",
  },
] as const;

const FAQ_ABO = [
  {
    question: "Faut-il un audit avant de s’abonner ?",
    reponse: "C’est recommandé : le suivi part du plan d’actions de l’audit. Mais un diagnostic flash suffit à ouvrir un abonnement Essentiel, et on construit le plan au fil des revues.",
  },
  {
    question: "Quel engagement ?",
    reponse: "Mensuel, avec un engagement initial de douze mois pour que les revues aient le temps de produire un effet. Ensuite, sans engagement. Les conditions figurent dans la lettre de mission.",
  },
  {
    question: "Que se passe-t-il si un contrôle arrive pendant l’abonnement ?",
    reponse:
      "Vous nous appelez. La préparation de la remise des pièces et le cadrage de la réponse font partie du suivi, dans la limite du périmètre de la formule. Au-delà, une mission dédiée est proposée en priorité.",
  },
  {
    question: "Et pour plusieurs établissements ?",
    reponse: "Chaque formule couvre un nombre de sites : un, jusqu’à trois, jusqu’à cinq, ou un périmètre cadré ensemble pour la formule Direction conformité.",
  },
] as const;

export default function AbonnementPage() {
  return (
    <>
      <section className="relative overflow-hidden">
        <Conteneur className="relative grid gap-14 pb-20 pt-12 md:grid-cols-[1.15fr_0.85fr] md:items-end md:gap-20 md:pb-28 md:pt-20">
          <div className="space-y-8">
            <Reveal y={16}>
              <p className="etiquette">Abonnement suivi conformité</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h1 className="max-w-4xl font-display text-t1 text-encre md:text-t1-lg">
                Une organisation qui tient, <em className="text-vert">pas un audit qu’on range.</em>
              </h1>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="max-w-2xl text-chapo text-encre-2">
                Le rapport d’audit est un point de départ. Ce qui protège une entreprise, c’est ce qui se passe après : les cartes renouvelées à temps, les attestations de vigilance à jour, les
                rapprochements faits avant la paie. L’abonnement met ça en place et le tient.
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
                <Bouton href="#formules" taille="lg">
                  Voir les quatre formules
                </Bouton>
                <Bouton href="/contact?situation=abonnement" variante="lien">
                  En parler d’abord
                </Bouton>
              </div>
            </Reveal>
          </div>
          <Reveal delay={0.2} y={32}>
            <Reperes
              titre="Quatre formules, prix HT par mois"
              lignes={ABONNEMENTS.map((a) => ({
                cle: a.nom,
                valeur: `${a.prixMensuelHT.toLocaleString("fr-FR")}\u00A0€`,
                href: "#formules",
              }))}
            />
          </Reveal>
        </Conteneur>
      </section>

      <section id="formules" className="scroll-mt-20 bg-menthe-2">
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="01"
            eyebrow="Quatre formules"
            titre={
              <>
                De la TPE d’un site <em className="text-vert">à la PME multi-sites.</em>
              </>
            }
            sous="Prix HT mensuels. Le périmètre suit l’effectif et le nombre d’établissements ; le contenu suit vos risques."
            aligne="deux"
          />
          <div className="mt-14">
            <Abonnements detaille />
          </div>
        </Conteneur>
      </section>

      <section>
        <Conteneur className="py-24 md:py-32">
          <SectionHead
            index="02"
            eyebrow="Ce que ça change, concrètement"
            titre={
              <>
                Le cycle d’une année <em className="text-vert">sous suivi.</em>
              </>
            }
            aligne="deux"
            sous="Quatre mécanismes simples, répétés. C’est la répétition qui fait qu’on ne redécouvre pas les mêmes écarts à chaque contrôle."
          />
          <Cascade className="mt-14 grid gap-px overflow-hidden rounded-[5px] border border-filet bg-filet sm:grid-cols-2 lg:grid-cols-4" pas={0.1}>
            {CYCLE.map((c, i) => (
              <Element key={c.titre} className="space-y-3 bg-papier p-6 md:p-7">
                <span className="font-mono text-etiquette text-gris">0{i + 1}</span>
                <h3 className="font-display text-t4 text-encre">{c.titre}</h3>
                <p className="text-corps text-encre-2">{c.texte}</p>
              </Element>
            ))}
          </Cascade>
        </Conteneur>
      </section>

      <section className="overflow-hidden bg-papier">
        <Conteneur large className="grid gap-12 py-24 md:grid-cols-[0.85fr_1.15fr] md:items-center md:gap-16 md:py-32">
          <div className="space-y-7">
            <SectionHead
              index="03"
              eyebrow="Le tableau de bord"
              titre={
                <>
                  Le portail devient <em className="text-vert">votre outil de pilotage.</em>
                </>
              }
            />
            <Reveal delay={0.05}>
              <ul className="space-y-3">
                {PORTAIL_CLIENT.finAudit.map((p) => (
                  <li key={p} className="flex gap-3 text-corps text-encre-2">
                    <span className="mt-[11px] h-px w-4 shrink-0 bg-vert" aria-hidden />
                    {p}
                  </li>
                ))}
              </ul>
            </Reveal>
          </div>
          <Reveal y={40}>
            <PortailApercu />
          </Reveal>
        </Conteneur>
      </section>

      <section>
        <Conteneur className="py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHead
              index="04"
              eyebrow="Pourquoi un suivi"
              titre={
                <>
                  Deux des cinq objectifs de l’accompagnement <em className="text-vert">ne tiennent que dans la durée.</em>
                </>
              }
            />
            <div>
              <Filet epais />
              {OBJECTIFS.filter((o) => o.n === 2 || o.n === 5).map((o) => (
                <Reveal key={o.n}>
                  <div className="grid gap-2 border-b border-filet py-6 md:grid-cols-[4rem_1fr] md:gap-6">
                    <span className="font-display text-chiffre leading-none text-vert">0{o.n}</span>
                    <div className="space-y-2">
                      <h3 className="font-display text-t3 text-encre">{o.titre}</h3>
                      <p className="text-corps text-encre-2">{o.texte}</p>
                    </div>
                  </div>
                </Reveal>
              ))}
            </div>
          </div>
        </Conteneur>
      </section>

      <section className="bg-papier">
        <Conteneur className="py-24 md:py-32">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <SectionHead
              index="05"
              eyebrow="Vos questions"
              titre={
                <>
                  Avant de <em className="text-vert">s&apos;engager.</em>
                </>
              }
            />
            <Reveal delay={0.1}>
              <FAQ items={FAQ_ABO} />
            </Reveal>
          </div>
        </Conteneur>
      </section>

      <CtaFinal
        titre="Quelle formule pour votre structure ?"
        texte={`Un appel de trente minutes suffit à la cadrer. À partir de ${ABONNEMENTS[0].prixMensuelHT} € HT par mois pour une TPE d’un site.`}
        cta="Cadrer mon abonnement"
        href="/contact?situation=abonnement"
      />
    </>
  );
}
