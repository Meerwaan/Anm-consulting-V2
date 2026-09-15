import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

/** Les pages légales sont volontairement absentes : elles sont en noindex tant que la société n'est pas immatriculée. */
export default function sitemap(): MetadataRoute.Sitemap {
  const maintenant = new Date();
  return [
    { url: `${SITE_URL}/`, lastModified: maintenant, changeFrequency: "weekly", priority: 1 },
    { url: `${SITE_URL}/audit`, lastModified: maintenant, changeFrequency: "monthly", priority: 0.9 },
    { url: `${SITE_URL}/abonnement`, lastModified: maintenant, changeFrequency: "monthly", priority: 0.8 },
    { url: `${SITE_URL}/formation`, lastModified: maintenant, changeFrequency: "monthly", priority: 0.7 },
    { url: `${SITE_URL}/a-propos`, lastModified: maintenant, changeFrequency: "yearly", priority: 0.6 },
    { url: `${SITE_URL}/contact`, lastModified: maintenant, changeFrequency: "yearly", priority: 0.8 },
  ];
}
