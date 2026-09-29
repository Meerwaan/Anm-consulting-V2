import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { ArticleVue } from "@/components/observatoire/ArticleVue";
import { COLONNES_ARTICLE, type Article } from "@/lib/observatoire/article";

export const metadata: Metadata = { title: "Aperçu — Observatoire", robots: { index: false } };

/** La page telle que le lecteur la verra, brouillon compris (lu avec la session de la consultante). */
export default async function ApercuPage({ params }: { params: Promise<{ id: string }> }) {
  await exigerRole("consultant");
  const { id } = await params;
  const supabase = await createClient();
  const { data: article } = await supabase.from("observatoire_articles").select(COLONNES_ARTICLE).eq("id", id).maybeSingle<Article>();
  if (!article) notFound();
  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-3 rounded-[5px] border border-majeur/40 bg-majeur-l px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-meta text-encre">
          <span className="font-medium">Aperçu.</span>{" "}
          {article.statut === "publie" ? "Cette page est en ligne." : "Ce brouillon n’est pas visible sur le site."} Les articles liés et l’appel à
          l’action de fin de page n’apparaissent que sur la page publique.
        </p>
        <Link href={`/admin/observatoire/${article.id}`} className="shrink-0 text-meta font-medium text-encre underline underline-offset-4 hover:text-vert">
          Revenir à l’édition
        </Link>
      </div>
      <div className="-mx-5 bg-fond md:-mx-4 lg:-mx-8">
        <ArticleVue article={article} />
      </div>
    </div>
  );
}
