"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { exigerRole } from "@/lib/supabase/session";
import { createClient } from "@/lib/supabase/server";
import { QUESTIONS_DIFFUSION, STADES, TERRITOIRES, territoireParId } from "@/content/observatoire";
import { bloquantsPublication, slugValide, type Article, type ChampsPublication } from "@/lib/observatoire/article";
import type { EtatFormulaire } from "@/app/admin/missions/[id]/(outil)/contrat/actions";
import { annoncerParution, messageParution } from "@/lib/email/parution";

const texte = (fd: FormData, cle: string) => String(fd.get(cle) ?? "").trim() || null;

/** Régénère tout ce que le site publie de l’Observatoire : accueil, territoire, article, flux, sitemap. */
const revaliderSite = (slugs: (string | null | undefined)[], territoires: (string | null | undefined)[]) => {
  revalidatePath("/observatoire");
  revalidatePath("/observatoire/rss.xml");
  revalidatePath("/sitemap.xml");
  for (const t of new Set(territoires.filter(Boolean) as string[])) revalidatePath(`/observatoire/${territoireParId(t).slug}`);
  for (const s of new Set(slugs.filter(Boolean) as string[])) revalidatePath(`/observatoire/${s}`);
  revalidatePath("/admin/observatoire");
};

/**
 * Enregistre un article, et selon le bouton : le publie, le laisse en brouillon ou le retire du
 * site. La publication est refusée tant que la fiche n’est pas complète (mêmes règles que la base).
 */
export const enregistrerArticle = async (_e: EtatFormulaire, fd: FormData): Promise<EtatFormulaire> => {
  await exigerRole("consultant");
  const id = texte(fd, "id");
  const intention = String(fd.get("intention") ?? "enregistrer");

  const type = texte(fd, "type") === "dossier" ? "dossier" : "fiche";
  const territoire = TERRITOIRES.find((t) => t.id === texte(fd, "territoire"))?.id;
  if (!territoire) return { ok: false, message: "Choisissez le territoire de la publication." };
  const titre = texte(fd, "titre");
  if (!titre) return { ok: false, message: "Le titre est obligatoire, même pour un brouillon." };
  const slug = texte(fd, "slug") ?? "";
  if (!slugValide(slug)) {
    return { ok: false, message: "L’adresse ne doit contenir que des minuscules sans accents, des chiffres et des tirets (et ne pas reprendre un nom de territoire)." };
  }
  const decisionUrl = texte(fd, "decision_url");
  if (decisionUrl && !/^https?:\/\/\S+$/.test(decisionUrl)) return { ok: false, message: "Le lien du texte intégral doit commencer par https://." };
  const decisionDate = texte(fd, "decision_date");
  if (decisionDate && !/^\d{4}-\d{2}-\d{2}$/.test(decisionDate)) return { ok: false, message: "La date de la décision n’est pas valide." };
  const stade = STADES.find((s) => s.id === texte(fd, "stade_procedure"))?.id ?? null;

  const questions = Object.fromEntries(QUESTIONS_DIFFUSION.map((q) => [q.cle, fd.get(q.cle) === "oui"])) as Record<(typeof QUESTIONS_DIFFUSION)[number]["cle"], boolean>;

  const champs = {
    type,
    territoire,
    titre,
    slug,
    titre_seo: texte(fd, "titre_seo"),
    meta_description: texte(fd, "meta_description"),
    accroche: texte(fd, "accroche"),
    faits: texte(fd, "faits"),
    reproches: texte(fd, "reproches"),
    defense: texte(fd, "defense"),
    decision: texte(fd, "decision"),
    point_anm: texte(fd, "point_anm"),
    question: texte(fd, "question"),
    juridiction: texte(fd, "juridiction"),
    decision_date: decisionDate,
    decision_numero: texte(fd, "decision_numero"),
    decision_url: decisionUrl,
    stade_procedure: stade,
    stade_precision: texte(fd, "stade_precision"),
    corps: texte(fd, "corps"),
    sources: texte(fd, "sources"),
    ...questions,
  } satisfies Partial<Article>;

  const supabase = await createClient();
  const existant = id
    ? (await supabase.from("observatoire_articles").select("statut, publie_le, slug, territoire").eq("id", id).maybeSingle<Pick<Article, "statut" | "publie_le" | "slug" | "territoire">>()).data
    : null;
  if (id && !existant) return { ok: false, message: "Cet article n’existe plus. Rechargez la page." };

  const statut = intention === "publier" ? "publie" : intention === "depublier" ? "brouillon" : (existant?.statut ?? "brouillon");
  if (statut === "publie") {
    const manques = bloquantsPublication(champs as ChampsPublication);
    if (manques.length) {
      return {
        ok: false,
        message: `${existant?.statut === "publie" ? "Enregistrement refusé : la page est en ligne et" : "Publication impossible :"} il manque ${manques.join(", ")}.`,
      };
    }
  }
  const maintenant = new Date().toISOString();
  const ligne = {
    ...champs,
    statut,
    publie_le: statut === "publie" ? (existant?.publie_le ?? maintenant) : (existant?.publie_le ?? null),
    ...(existant?.statut === "publie" && statut === "publie" && fd.get("signaler_maj") === "oui" ? { mis_a_jour_le: maintenant } : {}),
  };

  const { data, error } = id
    ? await supabase.from("observatoire_articles").update(ligne).eq("id", id).select("id").single()
    : await supabase.from("observatoire_articles").insert(ligne).select("id").single();
  if (error) {
    if (error.code === "23505") return { ok: false, message: "Cette adresse est déjà prise par une autre publication : modifiez-la." };
    if (error.code === "23514") return { ok: false, message: "La base a refusé l’enregistrement : une information obligatoire manque ou n’est pas au bon format." };
    return { ok: false, message: "L’article n’a pas pu être enregistré. Réessayez." };
  }

  const enLigneAvant = existant?.statut === "publie";
  if (statut === "publie" || enLigneAvant) revaliderSite([slug, existant?.slug], [territoire, existant?.territoire]);
  else revalidatePath("/admin/observatoire");
  revalidatePath(`/admin/observatoire/${data.id}`);

  // Première publication (jamais publié auparavant) : les inscrits « Être prévenu » reçoivent un
  // email. Une republication après retrait du site ne renvoie rien. La publication est déjà faite :
  // l’envoi ne peut plus l’annuler, le message dit seulement ce qui est parti.
  const premierePublication = statut === "publie" && !existant?.publie_le;
  const parution = premierePublication ? await annoncerParution(supabase, { titre, slug, type, territoire, accroche: champs.accroche }) : null;

  if (!id) {
    const email = parution ? `&email=${parution.envoyes}-${parution.inscrits}-${parution.ok ? 1 : 0}` : "";
    redirect(`/admin/observatoire/${data.id}?cree=${statut === "publie" ? "publie" : "brouillon"}${email}`);
  }

  if (intention === "publier" && !enLigneAvant) {
    return { ok: true, message: `Publié. La page est en ligne à l’adresse /observatoire/${slug}.${parution ? ` ${messageParution(parution)}` : ""}` };
  }
  if (intention === "depublier") return { ok: true, message: "Retiré du site. L’article redevient un brouillon ; sa date de première publication est conservée." };
  if (statut === "publie") {
    return {
      ok: true,
      message:
        existant?.slug && existant.slug !== slug
          ? `Enregistré. Attention : l’ancienne adresse /observatoire/${existant.slug} ne fonctionne plus.`
          : "Enregistré. La page en ligne est à jour.",
    };
  }
  return { ok: true, message: "Brouillon enregistré. Il n’est visible que dans l’espace de travail." };
};

/** Supprime un brouillon. Un article publié se retire d’abord du site. */
export const supprimerBrouillon = async (fd: FormData) => {
  await exigerRole("consultant");
  const id = texte(fd, "id");
  if (!id) return;
  const supabase = await createClient();
  await supabase.from("observatoire_articles").delete().eq("id", id).eq("statut", "brouillon");
  revalidatePath("/admin/observatoire");
  redirect("/admin/observatoire");
};
