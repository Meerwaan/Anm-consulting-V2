import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowUpRight } from "@phosphor-icons/react/dist/ssr";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { boutonSecondaire } from "@/components/facturation/styles";
import FormArticle from "@/components/observatoire/FormArticle";
import { COLONNES_ARTICLE, dateLongue, type Article } from "@/lib/observatoire/article";
import { supprimerBrouillon } from "../actions";

export const metadata: Metadata = { title: "Publication — Observatoire", robots: { index: false } };

export default async function ArticleAdminPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ cree?: string }> }) {
  await exigerRole("consultant");
  const [{ id }, { cree }] = await Promise.all([params, searchParams]);
  const supabase = await createClient();
  const { data: article } = await supabase.from("observatoire_articles").select(COLONNES_ARTICLE).eq("id", id).maybeSingle<Article>();
  if (!article) notFound();
  const enLigne = article.statut === "publie";
  const { publie_le, mis_a_jour_le } = article;

  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-4">
        <Link href="/admin/observatoire" className="text-meta text-encre-2 underline-offset-4 hover:text-vert hover:underline">
          ← Observatoire
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="font-display text-t2 text-encre">{article.titre}</h1>
          <p className="text-meta text-encre-2">
            {article.type === "fiche" ? "Fiche" : "Dossier"}
            {publie_le ? ` · publiée pour la première fois le ${dateLongue(publie_le)}` : " · jamais publiée"}
            {mis_a_jour_le ? ` · mise à jour signalée le ${dateLongue(mis_a_jour_le)}` : ""}
          </p>
          {cree ? (
            <p className="text-meta text-vert" role="status">
              {cree === "publie" ? "Publié. La page est en ligne." : "Brouillon créé. Il n’est visible que dans l’espace de travail."}
            </p>
          ) : null}
        </div>
        <div className="flex flex-col gap-3 sm:flex-row">
          <Link href={`/admin/observatoire/${article.id}/apercu`} className={boutonSecondaire}>
            Aperçu de la page
          </Link>
          {enLigne ? (
            <Link href={`/observatoire/${article.slug}`} target="_blank" className={boutonSecondaire}>
              Voir en ligne <ArrowUpRight size={16} aria-hidden />
            </Link>
          ) : null}
        </div>
      </div>

      <FormArticle initial={article} enLigne={enLigne} />

      {!enLigne ? (
        <form action={supprimerBrouillon} className="flex flex-col gap-2 border-t border-filet pt-6 sm:flex-row sm:items-center sm:justify-between">
          <input type="hidden" name="id" value={article.id} />
          <p className="text-meta text-encre-2">Supprimer ce brouillon efface tout son contenu, sans retour possible.</p>
          <button type="submit" className={`${boutonSecondaire} text-critique hover:border-critique`}>
            Supprimer le brouillon
          </button>
        </form>
      ) : null}
    </div>
  );
}
