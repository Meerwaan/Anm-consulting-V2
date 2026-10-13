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
import { fmtDate, fmtDateHeure, fmtEuros } from "@/lib/sous-traitance/format";
import { ADRESSE_CONTACT, type Email, type PieceJointe } from "./envoi";
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

/* ------------------------------------------------------------------ */
/* Devis                                                               */
/* ------------------------------------------------------------------ */

/** Ce que les trois emails d’un devis ont en commun. */
export interface DevisEmail {
  numero: string;
  client: string;
  intitule: string;
  totalHT: number;
  totalTTC: number;
  /** TVA non applicable (franchise en base) : le montant s’annonce hors taxe seulement. */
  franchise: boolean;
  /** Suivi de conformité : le montant est mensuel. */
  mensuel: boolean;
  acomptePct: number;
  /** Client d’exemple : l’email le dit, pour que personne ne le prenne pour un vrai devis. */
  exemple: boolean;
}

const montantDevis = (d: DevisEmail) =>
  `${fmtEuros(d.totalHT)} HT${d.franchise ? ", TVA non applicable" : ` · ${fmtEuros(d.totalTTC)} TTC`}${d.mensuel ? " par mois" : ""}`;

const conditionsDevis = (d: DevisEmail): string | null =>
  d.mensuel ? "Facturation mensuelle" : d.acomptePct > 0 && d.acomptePct < 100 ? typographie(`Acompte de ${d.acomptePct} % à la commande, solde à la remise des livrables`) : null;

const objetDevis = (d: DevisEmail, objet: string) => `${d.exemple ? "[Exemple] " : ""}${objet}`;
const MENTION_EXEMPLE = "Ceci est un exemple, sans valeur : il sert à découvrir l’outil, aucun client réel n’est concerné.";

/** Le devis part chez le client : le PDF en pièce jointe, et le lien pour l’accepter en ligne. */
export const emailDevis = (
  d: DevisEmail & { email: string; nom: string | null; valableJusquau: string; url: string; mot: string | null; pdf: PieceJointe },
): Email => {
  const { html, text } = composer({
    apercu: typographie(`Devis n° ${d.numero} : ${montantDevis(d)}, valable jusqu’au ${fmtDate(d.valableJusquau)}.`),
    surtitre: typographie(`Devis n° ${d.numero}`),
    titre: "Voici notre devis.",
    blocs: [
      { type: "paragraphe", texte: d.nom ? `Bonjour ${d.nom},` : "Bonjour," },
      ...(d.mot ? [{ type: "paragraphe" as const, texte: typographie(d.mot) }] : []),
      {
        type: "paragraphe",
        texte: typographie(`Vous trouverez en pièce jointe notre devis pour ${d.client} : la prestation, son prix, le calendrier et les livrables.`),
      },
      {
        type: "champs",
        lignes: [
          ["Prestation", d.intitule],
          ["Montant", montantDevis(d)],
          ["Conditions", conditionsDevis(d)],
          ["Valable jusqu’au", fmtDate(d.valableJusquau)],
        ],
      },
      { type: "paragraphe", texte: typographie("Pour l’accepter, rien à imprimer : relisez-le en ligne et donnez votre accord en un clic.") },
      { type: "bouton", libelle: "Lire et accepter le devis", url: d.url },
      { type: "paragraphe", texte: typographie("Une question, un point à ajuster ? Répondez simplement à cet email.") },
    ],
    mentions: [
      ...(d.exemple ? [typographie(MENTION_EXEMPLE)] : []),
      typographie(
        `Vous recevez cet email parce qu’ANM Consulting a établi ce devis pour ${d.client}. Le lien est personnel : il permet d’accepter le devis au nom de ${d.client}. Ne le transférez qu’à une personne habilitée à l’engager.`,
      ),
      `Politique de confidentialité${NB}: ${urlSite("/confidentialite")}`,
    ],
  });
  return { to: d.email, subject: objetDevis(d, `Votre devis ${d.numero} · ANM Consulting`), html, text, attachments: [d.pdf] };
};

export interface AccordDevis {
  nom: string;
  fonction: string | null;
  /** Instant de l’accord (ISO). */
  le: string;
}

const signataire = (a: AccordDevis) => `${a.nom}${a.fonction ? `, ${a.fonction}` : ""}`;

/** Notification interne à contact@anm-consulting.fr : un client vient d’accepter un devis en ligne. */
export const notificationAccordDevis = (d: DevisEmail & { id: string; accord: AccordDevis; emailClient: string | null }): Email => {
  const { html, text } = composer({
    apercu: typographie(`${signataire(d.accord)} a donné son accord en ligne. Il reste à créer la mission.`),
    surtitre: "Accord du client",
    titre: typographie(`${d.client} accepte le devis ${d.numero}.`),
    blocs: [
      {
        type: "champs",
        lignes: [
          ["Signataire", signataire(d.accord)],
          ["Date", fmtDateHeure(d.accord.le)],
          ["Prestation", d.intitule],
          ["Montant accepté", montantDevis(d)],
          ["Email du client", d.emailClient],
        ],
      },
      { type: "bouton", libelle: "Créer la mission et le contrat", url: urlSite(`/admin/commercial/devis/${d.id}`) },
      {
        type: "paragraphe",
        texte: "L’accord est enregistré avec le devis, qui ne se modifie plus. Rien n’est créé tant que vous ne l’avez pas confirmé dans l’outil.",
        discret: true,
      },
    ],
    mentions: [
      ...(d.exemple ? [typographie(MENTION_EXEMPLE)] : []),
      "Notification interne envoyée par le site quand un client accepte un devis en ligne.",
    ],
  });
  return {
    to: ADRESSE_CONTACT,
    ...(d.emailClient ? { replyTo: d.emailClient } : {}),
    subject: objetDevis(d, `Devis ${d.numero} accepté${NB}: ${d.client}`),
    html,
    text,
  };
};

/** Confirmation au client : son accord est enregistré, le devis qui le mentionne est joint. */
export const confirmationAccordDevis = (d: DevisEmail & { email: string; accord: AccordDevis; pdf: PieceJointe }): Email => {
  const { html, text } = composer({
    apercu: typographie(`Votre accord sur le devis n° ${d.numero} est enregistré. Le devis qui le mentionne est en pièce jointe.`),
    surtitre: typographie(`Devis n° ${d.numero}`),
    titre: "Votre accord est enregistré.",
    blocs: [
      { type: "paragraphe", texte: `Bonjour ${d.accord.nom},` },
      {
        type: "paragraphe",
        texte: typographie(
          `Nous avons bien reçu votre accord sur le devis n° ${d.numero}, donné le ${fmtDateHeure(d.accord.le)} pour ${d.client}. Vous trouverez en pièce jointe le devis, qui porte la mention de cet accord.`,
        ),
      },
      {
        type: "champs",
        lignes: [
          ["Prestation", d.intitule],
          ["Montant", montantDevis(d)],
          ["Conditions", conditionsDevis(d)],
        ],
      },
      {
        type: "paragraphe",
        texte: typographie("La suite : nous vous adressons le contrat de prestation de services, qui reprend ces conditions, puis nous arrêtons ensemble le calendrier de la mission."),
      },
      { type: "paragraphe", texte: typographie("Une question ? Répondez simplement à cet email.") },
    ],
    mentions: [
      ...(d.exemple ? [typographie(MENTION_EXEMPLE)] : []),
      typographie(
        "Vous recevez cet email parce qu’un devis d’ANM Consulting vient d’être accepté en ligne à votre nom. Si vous n’êtes pas à l’origine de cet accord, répondez à cet email sans attendre.",
      ),
      `Politique de confidentialité${NB}: ${urlSite("/confidentialite")}`,
    ],
  });
  return { to: d.email, subject: objetDevis(d, `Votre accord est enregistré · devis ${d.numero}`), html, text, attachments: [d.pdf] };
};
