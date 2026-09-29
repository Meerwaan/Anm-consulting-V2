import type { MetadataRoute } from "next";
import { TERRITOIRES } from "@/content/observatoire";
import { lireSlugsPublies } from "@/lib/observatoire/donnees";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Régénéré à chaque publication de l’Observatoire (revalidatePath) et au plus tard toutes les heures. */
export const revalidate = 3600;

/** Les pages légales sont volontairement absentes : elles sont en noindex tant que la société n'est pas immatriculée. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const maintenant = new Date();
  const articles = await lireSlugsPublies();
  const derniereParution = articles.reduce<Date | null>((max, a) => {
    const d = new Date(a.updated_at);
    return !max || d > max ? d : max;
  }, null);

  // Une page de territoire n'entre au sitemap qu'avec au moins une publication (sinon elle est en noindex).
  const territoires = TERRITOIRES.flatMap((t) => {
    const siens = articles.filter((a) => a.territoire === t.id);
    if (!siens.length) return [];
    const lastModified = new Date(Math.max(...siens.map((a) => new Date(a.updated_at).getTime())));
    return [{ url: `${SITE_URL}/observatoire/${t.slug}`, lastModified, changeFrequency: "weekly" as const, priority: 0.6 }];
  });

  return [
    { url: `${SITE_URL}/`, lastModified: maintenant, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/audit`, lastModified: maintenant, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/abonnement`, lastModified: maintenant, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/formation`, lastModified: maintenant, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/a-propos`, lastModified: maintenant, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: maintenant, changeFrequency: "yearly", priority: 0.8 },
    { url: `${SITE_URL}/observatoire`, lastModified: derniereParution ?? maintenant, changeFrequency: "weekly", priority: 0.8 },
    { url: `${SITE_URL}/observatoire/note-methodologique`, lastModified: new Date("2026-09-29"), changeFrequency: "yearly", priority: 0.4 },
    ...territoires,
    ...articles.map((a) => ({
      url: `${SITE_URL}/observatoire/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
