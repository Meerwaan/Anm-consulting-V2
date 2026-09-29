import Link from "next/link";
import type { Metadata } from "next";
import { exigerRole } from "@/lib/supabase/session";
import FormArticle, { brouillonVide } from "@/components/observatoire/FormArticle";

export const metadata: Metadata = { title: "Nouvelle publication — Observatoire", robots: { index: false } };

export default async function NouvelArticlePage({ searchParams }: { searchParams: Promise<{ type?: string }> }) {
  await exigerRole("consultant");
  const { type } = await searchParams;
  const dossier = type === "dossier";
  return (
    <div className="flex flex-col gap-8">
      <div className="flex flex-col gap-2">
        <Link href="/admin/observatoire" className="text-meta text-encre-2 underline-offset-4 hover:text-vert hover:underline">
          ← Observatoire
        </Link>
        <h1 className="font-display text-t2 text-encre">{dossier ? "Nouveau dossier" : "Nouvelle fiche"}</h1>
        <p className="max-w-3xl text-corps text-encre-2">
          {dossier
            ? "Un contenu permanent, rédigé en sections. Il reste un brouillon tant que vous ne cliquez pas sur Publier."
            : "Une décision, lue en entier. Remplissez les blocs dans l’ordre ; la fiche reste un brouillon tant que vous ne cliquez pas sur Publier."}
        </p>
      </div>
      <FormArticle initial={brouillonVide(dossier ? "dossier" : "fiche")} enLigne={false} />
    </div>
  );
}
