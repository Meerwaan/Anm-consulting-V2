/**
 * Les emails envoyés par le site : textes et mise en forme. Serveur uniquement (checklists.ts contient
 * les dix points de chaque checklist, qui ne doivent jamais partir dans le JavaScript de la page).
 *
 * Typographie française : espace insécable ( ) avant « : » et dans les chevrons, espace fine
 * insécable ( ) avant ; ! ?, apostrophe courbe.
 */
import { CHECKLISTS_COMPLETES } from "@/content/checklists";
import { OFFRES } from "@/content/offres";
import { OBSERVATOIRE, territoireParId } from "@/content/observatoire";
import { CHECKLISTS, SITUATIONS_CONTACT, type ChecklistId } from "@/content/vitrine";
import { typographie } from "@/lib/observatoire/typographie";
import type { Article } from "@/lib/observatoire/article";
import { ADRESSE_CONTACT, type Email } from "./envoi";
import { composer } from "./gabarit";

const NB = " ";

/** URL absolue du site (NEXT_PUBLIC_SITE_URL, https://anm-consulting.fr en production). */
export const urlSite = (chemin: string) =>
  `${(process.env.NEXT_PUBLIC_SITE_URL ?? "https://anm-consulting.fr").replace(/\/$/, "")}${chemin.startsWith("/") ? chemin : `/${chemin}`}`;

export const urlDesinscription = (jeton: string) => urlSite(`/desinscription?jeton=${encodeURIComponent(jeton)}`);

/** En-têtes de désinscription en un clic (RFC 8058), attendus par Gmail et Yahoo pour les envois groupés. */
const enTetesDesinscription = (jeton: string) => ({
  "List-Unsubscribe": `<${urlSite(`/desinscription/un-clic?jeton=${encodeURIComponent(jeton)}`)}>`,
  "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
});

/* ------------------------------------------------------------------ */
/* Formulaire de contact                                               */
/* ------------------------------------------------------------------ */

export interface DemandeContact {
  email: string;
  nom: string | null;
  societe: string | null;
  telephone: string | null;
  effectif: number | null;
  sites: number | null;
  siren: string | null;
  situation: string | null;
  offre: string | null;
  urgence: boolean;
  estimationHT: number | null;
  message: string | null;
}

const libelleSituation = (v: string | null) => SITUATIONS_CONTACT.find((s) => s.valeur === v)?.label ?? v;
const libelleOffre = (v: string | null) => OFFRES.find((o) => o.id === v)?.nom ?? v;
const euros = (n: number) => `${new Intl.NumberFormat("fr-FR", { maximumFractionDigits: 0 }).format(n)}${NB}€ HT`;

/** Accusé de réception envoyé au visiteur qui a rempli le formulaire de contact. */
export const accuseReceptionContact = (d: DemandeContact): Email => {
  const { html, text } = composer({
    apercu: `Nous revenons vers vous sous 48${NB}h ouvrées pour fixer un premier échange.`,
    surtitre: "Demande de premier échange",
    titre: "Votre demande est bien reçue.",
    blocs: [
      { type: "paragraphe", texte: d.nom ? `Bonjour ${d.nom},` : "Bonjour," },
      {
        type: "paragraphe",
        texte: `Merci pour votre message. Nous revenons vers vous sous 48${NB}h ouvrées, plus vite si un contrôle est annoncé, pour fixer un premier échange de trente minutes.`,
      },
      {
        type: "champs",
        lignes: [
          ["Situation", libelleSituation(d.situation)],
          ["Offre", libelleOffre(d.offre)],
          ["Société", d.societe],
          ["Effectif", d.effectif != null ? `${d.effectif} salariés` : null],
          ["Sites", d.sites != null ? String(d.sites) : null],
        ],
      },
      ...(d.message ? [{ type: "citation" as const, texte: d.message }] : []),
      { type: "paragraphe", texte: "Un élément a changé depuis votre demande, une date de contrôle est tombée ? Répondez simplement à cet email." },
    ],
    mentions: [
      "Vous recevez cet email parce que vous avez rempli le formulaire de contact du site d’ANM Consulting. Aucun autre envoi automatique ne suivra.",
      `Vos données servent uniquement à vous répondre. Politique de confidentialité${NB}: ${urlSite("/confidentialite")}`,
    ],
  });
  return { to: d.email, subject: "Votre demande est bien reçue · ANM Consulting", html, text };
};

/** Notification interne à contact@anm-consulting.fr : la demande complète et le lien vers l’espace de travail. */
export const notificationContact = (d: DemandeContact): Email => {
  const qui = [d.nom, d.societe].filter(Boolean).join(" · ") || d.email;
  const { html, text } = composer({
    apercu: `${libelleSituation(d.situation) ?? "Nouvelle demande"} · ${d.email}`,
    surtitre: d.urgence ? `Nouvelle demande · contrôle sous 7${NB}jours` : "Nouvelle demande du site",
    titre: qui,
    blocs: [
      {
        type: "champs",
        lignes: [
          ["Nom", d.nom],
          ["Société", d.societe],
          ["Email", d.email],
          ["Téléphone", d.telephone],
          ["Situation", libelleSituation(d.situation)],
          ["Offre", libelleOffre(d.offre)],
          ["Urgence", d.urgence ? `Contrôle sous 7${NB}jours` : null],
          ["Effectif", d.effectif != null ? String(d.effectif) : null],
          ["Sites", d.sites != null ? String(d.sites) : null],
          ["SIREN", d.siren],
          ["Estimation vue", d.estimationHT != null ? euros(d.estimationHT) : null],
        ],
      },
      ...(d.message ? [{ type: "citation" as const, texte: d.message }] : []),
      { type: "bouton", libelle: "Ouvrir dans l’espace de travail", url: urlSite("/admin/commercial") },
      { type: "paragraphe", texte: "Répondre à cet email écrit directement au demandeur.", discret: true },
    ],
    mentions: ["Notification interne envoyée par le site à chaque demande reçue par le formulaire de contact."],
  });
  return {
    to: ADRESSE_CONTACT,
    replyTo: d.email,
    subject: `${d.urgence ? "[Urgent] " : ""}Nouvelle demande${NB}: ${qui}`,
    html,
    text,
  };
};

/* ------------------------------------------------------------------ */
/* Checklists                                                          */
/* ------------------------------------------------------------------ */

/** La checklist complète, dans le corps de l’email. Envoi unique, sans suite automatique. */
export const emailChecklist = (id: ChecklistId, email: string): Email => {
  const checklist = CHECKLISTS.find((c) => c.id === id) ?? CHECKLISTS[0];
  const points = CHECKLISTS_COMPLETES[id];
  const nombre = points.length === 10 ? "dix" : String(points.length);
  const { html, text } = composer({
    apercu: `Les ${nombre} points à vérifier avant un contrôle ${checklist.organisme}.`,
    surtitre: `Checklist · ${checklist.organisme}`,
    titre: `La checklist ${checklist.organisme}, en ${nombre}${NB}points.`,
    blocs: [
      {
        type: "paragraphe",
        texte: `Voici les ${nombre} points que nous vérifions en premier avant un contrôle ${checklist.organisme}. Chacun se prouve par une pièce${NB}: si vous ne la retrouvez pas en quelques minutes, c’est là que le contrôleur s’arrêtera.`,
      },
      { type: "liste", items: points },
      {
        type: "paragraphe",
        texte: "Un point vous pose question, ou un contrôle est déjà annoncé ? Répondez à cet email ou demandez un premier échange de trente minutes.",
      },
      { type: "bouton", libelle: "Demander un premier échange", url: urlSite("/contact") },
    ],
    mentions: [
      `Vous recevez cet email parce que vous avez demandé cette checklist sur le site d’ANM Consulting. C’est un envoi unique${NB}: aucun autre email ne suivra sans nouvelle demande de votre part.`,
      `Politique de confidentialité${NB}: ${urlSite("/confidentialite")}`,
    ],
  });
  return { to: email, subject: `Votre checklist ${checklist.organisme} · ANM Consulting`, html, text };
};

/* ------------------------------------------------------------------ */
/* L’Observatoire ANM                                                  */
/* ------------------------------------------------------------------ */

const MENTION_OBSERVATOIRE = `Vous recevez cet email parce que vous avez demandé, sur le site d’ANM Consulting, à être prévenu des parutions de ${OBSERVATOIRE.nom}. Un email par nouvelle publication, rien d’autre.`;

/** Confirmation d’inscription à l’avis de parution. */
export const confirmationObservatoire = (email: string, jeton: string): Email => {
  const { html, text } = composer({
    apercu: "Un email à chaque nouvelle publication, rien d’autre.",
    surtitre: OBSERVATOIRE.nom,
    titre: "Votre inscription est confirmée.",
    blocs: [
      {
        type: "paragraphe",
        texte: `Vous recevrez un email à chaque nouvelle publication de ${OBSERVATOIRE.nom}${NB}: une décision lue en entier, vérifiée à sa source officielle, et ce qu’elle change pour une entreprise de sécurité privée.`,
      },
      { type: "paragraphe", texte: "Pas de relance commerciale. Chaque email porte un lien pour vous désinscrire en un clic." },
      { type: "bouton", libelle: "Voir l’Observatoire", url: urlSite("/observatoire") },
    ],
    mentions: [MENTION_OBSERVATOIRE],
    desinscription: urlDesinscription(jeton),
  });
  return { to: email, subject: `Inscription confirmée${NB}: ${OBSERVATOIRE.nom}`, html, text, headers: enTetesDesinscription(jeton) };
};

/** Avis de parution d’un article, envoyé une seule fois, à sa première publication. */
export const parutionObservatoire = (
  article: Pick<Article, "titre" | "slug" | "type" | "territoire" | "accroche">,
  email: string,
  jeton: string,
): Email => {
  const territoire = territoireParId(article.territoire);
  const nature = article.type === "dossier" ? "Nouveau dossier" : "Nouvelle fiche";
  const titre = typographie(article.titre);
  const { html, text } = composer({
    apercu: article.accroche ? typographie(article.accroche) : `${nature} de ${OBSERVATOIRE.nom}.`,
    surtitre: `${OBSERVATOIRE.nom} · ${territoire.libelle}`,
    titre,
    blocs: [
      ...(article.accroche ? [{ type: "paragraphe" as const, texte: typographie(article.accroche) }] : []),
      { type: "bouton", libelle: article.type === "dossier" ? "Lire le dossier" : "Lire la fiche", url: urlSite(`/observatoire/${article.slug}`) },
    ],
    mentions: [MENTION_OBSERVATOIRE],
    desinscription: urlDesinscription(jeton),
  });
  return { to: email, subject: `${nature}${NB}: ${titre}`, html, text, headers: enTetesDesinscription(jeton) };
};
