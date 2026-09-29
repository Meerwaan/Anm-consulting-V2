import { OBSERVATOIRE, territoireParId } from "@/content/observatoire";
import { lireArticlesPublies } from "@/lib/observatoire/donnees";
import { absolue, cheminArticle } from "@/lib/observatoire/seo";
import { typographie } from "@/lib/observatoire/typographie";

/** Flux RSS 2.0 de l'Observatoire, régénéré à chaque publication (revalidatePath) et toutes les heures. */
export const revalidate = 3600;

const xml = (s: string) =>
  s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");

export async function GET() {
  const articles = await lireArticlesPublies();
  const soi = absolue("/observatoire/rss.xml");
  const derniere = articles[0]?.publie_le ?? null;

  const items = articles
    .map((a) => {
      const url = absolue(cheminArticle(a.slug));
      return `    <item>
      <title>${xml(typographie(a.titre))}</title>
      <link>${xml(url)}</link>
      <guid isPermaLink="true">${xml(url)}</guid>
      ${a.publie_le ? `<pubDate>${new Date(a.publie_le).toUTCString()}</pubDate>` : ""}
      <category>${xml(territoireParId(a.territoire).nomLong)}</category>
      <dc:creator>Sofia Aoun</dc:creator>
      ${a.accroche ? `<description>${xml(typographie(a.accroche))}</description>` : ""}
    </item>`;
    })
    .join("\n");

  const corps = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom" xmlns:dc="http://purl.org/dc/elements/1.1/">
  <channel>
    <title>${xml(OBSERVATOIRE.nomLong)}</title>
    <link>${xml(absolue("/observatoire"))}</link>
    <atom:link href="${xml(soi)}" rel="self" type="application/rss+xml" />
    <description>${xml(typographie(OBSERVATOIRE.promesse))}</description>
    <language>fr-FR</language>
    <copyright>ANM Consulting</copyright>
    ${derniere ? `<lastBuildDate>${new Date(derniere).toUTCString()}</lastBuildDate>` : ""}
${items}
  </channel>
</rss>
`;

  return new Response(corps, {
    headers: { "Content-Type": "application/rss+xml; charset=utf-8" },
  });
}
