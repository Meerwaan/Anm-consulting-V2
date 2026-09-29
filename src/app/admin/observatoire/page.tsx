import Link from "next/link";
import type { Metadata } from "next";
import { ArrowUpRight, CaretRight } from "@phosphor-icons/react/dist/ssr";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { boutonPrincipal, boutonSecondaire } from "@/components/facturation/styles";
import { territoireParId } from "@/content/observatoire";
import { typographie } from "@/lib/observatoire/typographie";
import { bloquantsPublication, dateLongue, type Article } from "@/lib/observatoire/article";

export const metadata: Metadata = { title: "Observatoire — ANM Consulting", robots: { index: false } };

/** Les publications de l'Observatoire : brouillons en cours, puis ce qui est en ligne. */
export default async function ObservatoireAdminPage() {
  await exigerRole("consultant");
  const supabase = await createClient();
  const { data } = await supabase.from("observatoire_articles").select("*").order("updated_at", { ascending: false });
  const articles = (data as Article[] | null) ?? [];
  const brouillons = articles.filter((a) => a.statut === "brouillon");
  const publies = articles.filter((a) => a.statut === "publie").sort((x, y) => (y.publie_le ?? "").localeCompare(x.publie_le ?? ""));

  return (
    <div className="flex flex-col gap-14">
      <section className="flex flex-col gap-6">
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-t2 text-encre">Observatoire</h1>
          <p className="max-w-3xl text-corps text-encre-2">
            {typographie(
              "Le blog du site. L’outil range ton analyse dans la structure de ta note méthodologique et la publie proprement pour Google ; le choix de la décision, sa lecture et le point ANM restent les tiens. Rien ne part en ligne sans les cinq questions avant diffusion.",
            )}
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href="/admin/observatoire/nouveau?type=fiche" className={boutonPrincipal}>
            Nouvelle fiche
          </Link>
          <Link href="/admin/observatoire/nouveau?type=dossier" className={boutonSecondaire}>
            Nouveau dossier
          </Link>
          <Link href="/observatoire" target="_blank" className={`${boutonSecondaire} sm:ml-auto`}>
            Voir l’Observatoire en ligne <ArrowUpRight size={16} aria-hidden />
          </Link>
        </div>
      </section>

      <Liste titre="Brouillons" vide="Aucun brouillon." articles={brouillons} />
      <Liste titre="En ligne" vide={typographie("Rien n’est encore publié : la page de l’Observatoire affiche un message d’attente honnête, sans faux article.")} articles={publies} />
    </div>
  );
}

function Liste({ titre, vide, articles }: { titre: string; vide: string; articles: Article[] }) {
  return (
    <section className="flex flex-col gap-4">
      <h2 className="font-display text-t3 text-encre">
        {titre} <span className="font-mono text-note text-gris">{articles.length}</span>
      </h2>
      {articles.length ? (
        <ul className="flex flex-col border-t-[1.5px] border-encre">
          {articles.map((a) => {
            const manques = a.statut === "brouillon" ? bloquantsPublication(a).length : 0;
            return (
              <li key={a.id} className="border-b border-filet">
                <Link href={`/admin/observatoire/${a.id}`} className="flex min-h-20 items-center justify-between gap-4 py-3 transition-colors hover:bg-papier">
                  <span className="flex min-w-0 flex-col gap-1">
                    <span className="font-display text-t4 text-encre">{a.titre}</span>
                    <span className="text-meta text-encre-2">
                      {a.type === "fiche" ? "Fiche" : "Dossier"} · {territoireParId(a.territoire).nomLong} ·{" "}
                      {a.statut === "publie" && a.publie_le ? `publié le ${dateLongue(a.publie_le)}` : `modifié le ${dateLongue(a.updated_at)}`}
                    </span>
                    {a.statut === "brouillon" ? (
                      <span className={`text-meta ${manques ? "text-majeur" : "text-vert"}`}>
                        {manques ? `${manques} élément${manques > 1 ? "s" : ""} à compléter avant publication` : "Prêt à publier"}
                      </span>
                    ) : null}
                  </span>
                  <CaretRight size={22} className="shrink-0 text-gris" aria-hidden />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-corps text-encre-2">{vide}</p>
      )}
    </section>
  );
}
