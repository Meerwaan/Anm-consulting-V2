import { cache } from "react";
import { createClient as creerClientSupabase } from "@supabase/supabase-js";
import { requireSupabaseEnv } from "@/lib/supabase/env";
import { COLONNES_ARTICLE, COLONNES_RESUME, type Article, type ArticleResume } from "./article";
import type { TerritoireId } from "@/content/observatoire";

/**
 * Lecture publique de l’Observatoire : un client SANS cookies, rôle anon, que la RLS limite aux
 * articles publiés. Sans cookies, les pages restent statiques (ISR) : c’est ce qui permet de les
 * servir depuis le cache et de les régénérer à la publication (revalidatePath depuis l’admin).
 */
const clientPublic = () => {
  const { url, key } = requireSupabaseEnv();
  return creerClientSupabase(url, key, { auth: { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false } });
};

/** Les articles publiés, du plus récent au plus ancien. Vide si Supabase n’est pas joignable au build. */
export const lireArticlesPublies = cache(async (territoire?: TerritoireId): Promise<ArticleResume[]> => {
  try {
    let requete = clientPublic().from("observatoire_articles").select(COLONNES_RESUME).eq("statut", "publie");
    if (territoire) requete = requete.eq("territoire", territoire);
    const { data, error } = await requete.order("publie_le", { ascending: false });
    if (error) throw error;
    return (data as ArticleResume[] | null) ?? [];
  } catch (e) {
    console.error("[observatoire] lecture des articles publiés impossible", e);
    return [];
  }
});

/** Un article publié, ou null. Partagé (cache) entre generateMetadata, la page et l’image OG. */
export const lireArticlePublie = cache(async (slug: string): Promise<Article | null> => {
  const { data, error } = await clientPublic()
    .from("observatoire_articles")
    .select(COLONNES_ARTICLE)
    .eq("statut", "publie")
    .eq("slug", slug)
    .maybeSingle<Article>();
  if (error) throw error;
  return data;
});

/** Pour le sitemap et le flux RSS : de quoi dater chaque article. */
export const lireSlugsPublies = async (): Promise<Pick<Article, "slug" | "territoire" | "updated_at" | "publie_le">[]> => {
  try {
    const { data, error } = await clientPublic()
      .from("observatoire_articles")
      .select("slug, territoire, updated_at, publie_le")
      .eq("statut", "publie")
      .order("publie_le", { ascending: false });
    if (error) throw error;
    return data ?? [];
  } catch (e) {
    console.error("[observatoire] lecture des adresses publiées impossible", e);
    return [];
  }
};
