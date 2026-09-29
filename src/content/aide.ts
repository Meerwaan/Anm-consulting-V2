/**
 * La page Aide de l’espace de travail (/admin/aide), écrite pour Sofia.
 *
 * Chaque instruction correspond à un écran, un bouton ou un libellé qui existe réellement dans
 * l’outil au 29/09/2026 : les libellés entre « » sont ceux de l’interface. Quand un écran change,
 * c’est ce fichier qu’on met à jour.
 *
 * Petite syntaxe dans les textes (rendue par <Inline>, typographie française appliquée à l’affichage) :
 *   [libellé](/admin/…)   un lien vers un écran ;
 *   [libellé](mission:…)  un écran de mission (pieces, dgfip, contrat…), ouvert dans la mission de démo ;
 *   **mot**               du gras.
 * Pas d’astérisque isolé : il serait lu comme de l’italique.
 */
import { QUESTIONS_DIFFUSION, STADES } from "@/content/observatoire";
import { LIMITE_DESCRIPTION, LIMITE_TITRE_SEO } from "@/lib/observatoire/article";
import { normaliserRecherche } from "@/lib/aide/recherche";

export type BlocAide =
  | { type: "p"; texte: string }
  | { type: "etapes"; items: string[] }
  | { type: "liste"; items: string[] }
  | { type: "encadre"; ton: "info" | "attention"; titre: string; texte?: string; items?: string[] }
  | { type: "tableau"; legende: string; colonnes: string[]; lignes: string[][] }
  | { type: "partage"; gauche: { titre: string; items: string[] }; droite: { titre: string; items: string[] } }
  | { type: "syntaxe"; lignes: { saisie: string; effet: string }[] };

export interface FicheAide {
  id: string;
  titre: string;
  blocs: BlocAide[];
}

export interface SectionAide {
  id: string;
  titre: string;
  resume: string;
  /** Les fiches s’affichent en questions dépliables (FAQ). */
  faq?: boolean;
  fiches: FicheAide[];
  /** Ce qui suit les fiches, toujours visible. */
  fin?: BlocAide[];
}

const NB = "\u00a0";

export const SECTIONS_AIDE: SectionAide[] = [
  /* ------------------------------------------------------------------ 1 */
  {
    id: "demarrer",
    titre: "Démarrer",
    resume: "Se connecter, se déconnecter, changer son mot de passe, travailler sur l’iPad, et savoir ce qui s’enregistre tout seul.",
    fiches: [
      {
        id: "connexion",
        titre: "Se connecter",
        blocs: [
          {
            type: "p",
            texte:
              "La connexion se fait avec votre **adresse email** et votre **mot de passe**, sur la page [Connexion](/connexion). Aucun lien n’est envoyé par email : depuis le 21 septembre, tout passe par le mot de passe.",
          },
          {
            type: "etapes",
            items: [
              "Ouvrez la page [Connexion](/connexion).",
              "Saisissez votre adresse email. Sur l’iPad, le trousseau iCloud propose l’adresse enregistrée et Face ID remplit le mot de passe.",
              "Touchez « Afficher » si vous voulez relire ce que vous avez tapé, puis « Se connecter ».",
              "Vous arrivez sur la page [Missions](/admin), l’accueil de votre espace.",
            ],
          },
          {
            type: "p",
            texte:
              "Mot de passe oublié : il n’y a pas de bouton pour le récupérer vous-même. Demandez à Merwan de le réinitialiser, puis changez-le dans [Mon compte](/admin/compte).",
          },
        ],
      },
      {
        id: "deconnexion",
        titre: "Se déconnecter",
        blocs: [
          {
            type: "p",
            texte:
              "Touchez « Déconnexion », tout en haut à droite de chaque page. Vous revenez sur la page de connexion. Sur un ordinateur que d’autres utilisent, déconnectez-vous toujours en partant.",
          },
        ],
      },
      {
        id: "mot-de-passe",
        titre: "Changer son mot de passe",
        blocs: [
          {
            type: "etapes",
            items: [
              "Touchez votre nom, en haut à droite : il ouvre [Mon compte](/admin/compte).",
              `Dans « Changer le mot de passe », saisissez le mot de passe actuel, puis le nouveau (10${NB}caractères au minimum), puis le nouveau une seconde fois.`,
              "Touchez « Changer le mot de passe ». Le message « Mot de passe changé » confirme ; l’iPad propose alors de l’enregistrer dans le trousseau.",
            ],
          },
          {
            type: "p",
            texte:
              "Si l’écran répond « Ce mot de passe est trop faible ou connu des listes de fuites », choisissez-en un autre, plus long.",
          },
        ],
      },
      {
        id: "reperes",
        titre: "Se repérer dans l’espace",
        blocs: [
          {
            type: "p",
            texte:
              "En haut de chaque page : [Missions](/admin), [Commercial](/admin/commercial), [Observatoire](/admin/observatoire), [Cabinet](/admin/cabinet), puis [Aide](/admin/aide), votre nom (votre compte) et « Déconnexion ».",
          },
          {
            type: "encadre",
            ton: "info",
            titre: "Sur un téléphone",
            texte:
              "L’écran est trop étroit pour tout afficher : seuls « Aide », votre nom et « Déconnexion » restent en haut. Tournez le téléphone, ou passez par les liens de cette page. Sur l’iPad, tout s’affiche.",
          },
        ],
      },
      {
        id: "ipad",
        titre: "Travailler sur l’iPad",
        blocs: [
          {
            type: "liste",
            items: [
              "Dans une mission, l’iPad tenu à l’horizontale affiche la barre des étapes en entier, à gauche. Tenu à la verticale, la barre devient une colonne de numéros : le bouton « Menu », tout en haut, l’ouvre en grand.",
              "Les grands tableaux défilent de côté : faites glisser le tableau lui-même avec le doigt.",
              "Pour une pièce, « Déposer le fichier » ouvre le choix de l’iPad : Photos, appareil photo ou Fichiers. Vous pouvez en choisir plusieurs ; ils partent l’un après l’autre, avec un pourcentage.",
              "Ne quittez pas la page pendant un envoi : Safari vous demanderait de confirmer, et l’envoi serait coupé.",
              `Un fichier ne peut pas dépasser 50${NB}Mo.`,
              "Les PDF (devis, contrat, rapport, factures) s’ouvrent dans un nouvel onglet : le bouton de partage de Safari permet de les enregistrer ou de les envoyer.",
            ],
          },
        ],
      },
      {
        id: "enregistrement",
        titre: "Ce qui s’enregistre tout seul, et ce qui demande un bouton",
        blocs: [
          {
            type: "p",
            texte:
              "C’est la source de confusion la plus fréquente. Les écrans d’audit enregistrent au fil de l’eau ; les documents (devis, contrat, article, textes du rapport) attendent que vous touchiez leur bouton.",
          },
          {
            type: "tableau",
            legende: "Comment chaque écran enregistre",
            colonnes: ["Où", "Quand c’est enregistré", "Comment le voir"],
            lignes: [
              ["Réponses des grilles (« Oui », « Non », « À vérifier », « Sans objet ») et choix de conclusion", "Dès que vous touchez la réponse", "Une petite coche verte ; un triangle rouge veut dire « non enregistré »"],
              ["Observations et textes de conclusion des grilles", "Quand vous quittez le champ (touchez ailleurs)", "La même coche verte"],
              ["Lignes des tableaux (ventes, paie, agents, factures des sous-traitants…)", "Quand vous quittez la ligne", "Une coche au bout de la ligne ; en cas d’erreur, le message s’affiche sous la ligne"],
              ["Plan d’actions", "Quand vous quittez un champ, ou dès que vous touchez un statut", "« Enregistré » en bas de l’action"],
              ["Pièces : fichier déposé, menu « Sans fichier »", "Tout de suite", "L’état de la pièce change"],
              ["Pièces : date", "Bouton « Enregistrer la date »", "L’état de la pièce change"],
              ["Heures : période et repères, coût de revient (DGFiP)", "Bouton « Enregistrer les repères » ou « Enregistrer »", "Message vert sous le bouton"],
              ["Textes du rapport", "Bouton « Valider ce texte » ou « Enregistrer mon texte »", "« Ton texte, enregistré »"],
              ["Devis, contrat, fiche du client, Cabinet", "Bouton « Enregistrer… » du formulaire", "Message vert sous le bouton"],
              ["Observatoire", "Bouton « Enregistrer le brouillon », « Publier » ou « Enregistrer la page en ligne »", "Message sous les boutons"],
            ],
          },
        ],
      },
      {
        id: "entrainement",
        titre: "S’entraîner sans risque",
        blocs: [
          {
            type: "liste",
            items: [
              "Pour l’audit : la mission « Démo — Horizon Sécurité Privée », dans [Missions](/admin). Elle contient de vraies anomalies à trouver. Il n’existe pas de bouton pour la remettre à zéro : ce que vous y saisissez y reste. Pour repartir d’une démo propre, demandez-le à Merwan.",
              "Pour le commercial : le bouton « Créer un exemple », en haut de [Commercial](/admin/commercial). Une fausse demande arrive, et vous déroulez tout : devis, mission, contrat, factures. Tout porte le numéro « EXEMPLE » et s’efface avec « Effacer l’exemple ».",
            ],
          },
          {
            type: "encadre",
            ton: "attention",
            titre: "Jamais de vrai client pour « essayer »",
            texte:
              "Un devis ou une facture créés pour un vrai client prennent un vrai numéro, pour toujours, et une facture émise ne se supprime pas. Pour voir à quoi ressemble un document, utilisez l’exemple, ou les boutons qui ne créent rien : « Aperçu du contrat (PDF) », « Voir le rapport », « Aperçu de la page ».",
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ 2 */
  {
    id: "parcours",
    titre: "Le parcours d’un client, de bout en bout",
    resume:
      "De la demande reçue sur le site à la dernière facture. Pour chaque étape : où toucher, ce qui se passe, ce que reçoit le client.",
    fiches: [
      {
        id: "demande",
        titre: "1. Une demande arrive du site",
        blocs: [
          {
            type: "p",
            texte:
              "Quand un dirigeant remplit le formulaire de contact ou l’estimateur du site, sa demande arrive dans [Commercial, « Les demandes reçues du site »](/admin/commercial#demandes), avec le forfait choisi, l’effectif, les sites et l’estimation qu’il a vue. Sur la page [Missions](/admin), un bandeau vert signale les nouvelles demandes.",
          },
          {
            type: "encadre",
            ton: "attention",
            titre: "Vous n’êtes pas prévenue par email",
            texte:
              "Aucun email ne vous signale une nouvelle demande, et le prospect ne reçoit aucun accusé de réception, même si le site le lui annonce. Ouvrez Commercial régulièrement, et rappelez-le vous-même.",
          },
          {
            type: "liste",
            items: [
              "« Préparer le devis » : crée la fiche du client et son devis (étape suivante).",
              "« Rappelé, en cours » : vous l’avez eu au téléphone ; la demande reste dans la liste.",
              "« Sans suite » : la demande quitte la liste. Elle reste consultable dans « Demandes déjà traitées », avec un bouton « Rouvrir ».",
            ],
          },
          {
            type: "encadre",
            ton: "attention",
            titre: "Les inscriptions ne sont pas des demandes de devis",
            texte:
              "Les inscriptions aux checklists (« Checklist CNAPS », « Checklist URSSAF »…) et à l’Observatoire (« Alerte Observatoire ») arrivent dans la même liste. Ne touchez pas « Préparer le devis » pour elles : cela créerait un vrai devis numéroté. Leur adresse email est affichée : c’est à vous d’envoyer la checklist, l’outil ne le fait pas encore.",
          },
        ],
      },
      {
        id: "devis",
        titre: "2. Préparer et envoyer le devis",
        blocs: [
          {
            type: "etapes",
            items: [
              "Touchez « Préparer le devis ». L’outil crée le client et le devis, chiffré avec la grille du site, et ouvre sa page. Le devis reçoit tout de suite son numéro (D2026-0001, D2026-0002…).",
              "Vérifiez « Le client ». Avec le SIREN, « Compléter depuis le SIREN » va chercher la forme juridique, le siège et le dirigeant dans l’annuaire des entreprises. Si vous corrigez quelque chose, touchez « Enregistrer la fiche ».",
              "Relisez « Le devis » : prix, conditions, contrôle en cours, calendrier, livrables. Touchez « Enregistrer le devis ».",
              "« Ouvrir le devis (PDF) », puis envoyez-le vous-même au client, par email : l’outil n’envoie rien.",
              "De retour sur le devis, touchez « Marquer comme envoyé ».",
            ],
          },
          {
            type: "p",
            texte:
              "Un client qui vous a appelé sans passer par le site : dans [Commercial, « Les devis »](/admin/commercial#devis), le cadre « Un client qui a appelé directement » crée le client et son devis à partir de son nom et de son SIREN.",
          },
        ],
      },
      {
        id: "acceptation",
        titre: "3. Le devis est accepté : la mission et le contrat se créent",
        blocs: [
          {
            type: "etapes",
            items: [
              "Quand le client vous renvoie le devis signé « Bon pour accord », ouvrez-le et touchez « Accepté : créer la mission et le contrat ».",
              "L’outil crée la mission (référence 2026-01, 2026-02…) et prépare son contrat avec tout ce que contient le devis. Vous arrivez directement sur [Contrat et factures](mission:contrat).",
            ],
          },
          {
            type: "encadre",
            ton: "attention",
            titre: "Un seul toucher, sans confirmation",
            texte:
              "Ce bouton ne demande pas de confirmation et ne se défait pas depuis l’outil. Ne le touchez qu’avec le devis signé en main. En cas d’erreur, contactez Merwan.",
          },
          {
            type: "p",
            texte: "Si le client décline, touchez « Refusé ». Un devis refusé peut revenir en arrière avec « Remettre en brouillon ».",
          },
          {
            type: "p",
            texte:
              "Une mission peut aussi se créer sans devis : sur la page [Missions](/admin), le cadre « Nouvelle mission » (client, SIREN, référence, nature de la mission, effectif, contrôle en cours, période contrôlée), puis « Créer la mission ». La mission s’ouvre sur ses pièces justificatives.",
          },
        ],
      },
      {
        id: "contrat",
        titre: "4. Faire signer le contrat",
        blocs: [
          {
            type: "p",
            texte:
              "Dans une mission, « Contrat et factures » est tout en bas de la barre des étapes, sous « Administratif » (sur l’iPad tenu à la verticale : l’icône de reçu, sous les numéros).",
          },
          {
            type: "etapes",
            items: [
              "Relisez « Les parties » : la fiche du client, et les informations d’ANM reprises de la page [Cabinet](/admin/cabinet). Ce qui manque est écrit en rouge « À compléter ».",
              "Relisez le contrat : il reprend votre modèle mot pour mot, rempli avec le devis. Touchez « Enregistrer le contrat » (ou « Enregistrer les modifications »).",
              "Touchez « Ouvrir le contrat (PDF) » et envoyez-le au client pour signature, par vos moyens habituels.",
              "Une fois signé, indiquez la date dans « Signé le » et touchez « Marquer comme signé ». Le PDF signé est archivé dans la mission, et le contrat ne se modifie plus.",
            ],
          },
          {
            type: "p",
            texte: "Pour corriger un contrat signé : « Rouvrir pour le modifier », corrigez, enregistrez, puis marquez-le de nouveau comme signé.",
          },
        ],
      },
      {
        id: "portail-client",
        titre: "5. Le client et son espace",
        blocs: [
          {
            type: "encadre",
            ton: "attention",
            titre: "L’espace client n’est pas encore ouvert",
            texte:
              "Il n’existe pas de bouton pour inviter un client, et aucun email d’invitation ne part. Les comptes sont créés par Merwan ; un client connecté ne verrait aujourd’hui qu’un message d’attente (« Votre espace de suivi ouvrira ici »).",
          },
          {
            type: "p",
            texte:
              "En attendant, tout ce que reçoit le client, c’est vous qui le lui envoyez : le devis, le contrat, la liste des pièces, le rapport, le plan d’actions (fichier Excel) et les factures.",
          },
        ],
      },
      {
        id: "pieces",
        titre: "6. Réunir les pièces",
        blocs: [
          {
            type: "etapes",
            items: [
              "Ouvrez la mission : elle s’ouvre sur l’étape 1, [Pièces justificatives](mission:pieces).",
              "En haut, « Copier la liste des N pièces manquantes » copie la liste, prête à coller dans votre email au client. L’outil note la date de la demande sur chaque pièce.",
              "Quand le client vous transmet une pièce, déposez-la avec « Déposer le fichier » (ou « Ajouter un fichier » s’il y en a déjà un).",
            ],
          },
          {
            type: "encadre",
            ton: "info",
            titre: "Pas de relance automatique",
            texte:
              "L’outil ne relance pas le client. Pour relancer, copiez de nouveau la liste : elle ne contient que ce qui manque encore. Les états des pièces sont expliqués dans [Étape 1 : Pièces justificatives](/admin/aide#audit-pieces).",
          },
        ],
      },
      {
        id: "suite",
        titre: "7. Mener l’audit, conclure, remettre le rapport",
        blocs: [
          {
            type: "etapes",
            items: [
              "Étapes 2 à 6 : les heures, la sous-traitance, puis les contrôles DGFiP, URSSAF et CNAPS. Tout est détaillé dans [Mener un audit](/admin/aide#audit).",
              "Étape 7 : le [Plan d’actions](mission:actions), que l’entreprise garde après l’audit.",
              "Étape 8 : le [Rapport](mission:rapport). Émettez la version, ouvrez-la depuis « Versions émises » et envoyez le PDF au client.",
            ],
          },
        ],
      },
      {
        id: "facturer",
        titre: "8. Facturer",
        blocs: [
          {
            type: "etapes",
            items: [
              "Dans [Contrat et factures](mission:contrat), partie « Les factures », l’outil propose ce qui peut être émis : d’abord la « Facture d’acompte » (au pourcentage du contrat), puis la « Facture de solde » ; ou la « Facture unique (100 %) » sans acompte.",
              "Touchez celle qui convient : un cadre récapitule les montants. « Émettre la facture » la numérote (F2026-0001…) et archive son PDF ; « Ne rien faire » annule.",
              "Envoyez le PDF au client (bouton « PDF »).",
              "Quand le virement arrive, touchez « Marquer payée ». Une facture non payée après son échéance s’affiche « en retard », ici et dans Commercial.",
            ],
          },
          {
            type: "p",
            texte: "Toutes les factures du cabinet sont réunies dans [Commercial, « Les factures »](/admin/commercial#factures).",
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ 3 */
  {
    id: "audit",
    titre: "Mener un audit",
    resume: "Les huit étapes d’une mission, dans l’ordre de la barre latérale. Les liens de cette partie ouvrent la mission de démo.",
    fiches: [
      {
        id: "regle",
        titre: "La règle : l’outil calcule, vous qualifiez",
        blocs: [
          {
            type: "encadre",
            ton: "info",
            titre: "L’outil calcule et fait ressortir les écarts. Il ne qualifie pas.",
            items: [
              "Une « Alerte » ou un « À vérifier » signale un écart chiffré ou une pièce qui manque. Ce n’est ni une infraction ni un constat : c’est un point à regarder.",
              "La qualification juridique (travail dissimulé, prêt illicite de main-d’œuvre, facture de complaisance…) reste la vôtre, et celle de l’avocat ou de l’expert-comptable du client.",
              "Les textes que l’outil propose pour le rapport partent de vos réponses : ils sont à relire avant de partir chez le client.",
            ],
          },
        ],
      },
      {
        id: "barre",
        titre: "La barre des étapes",
        blocs: [
          {
            type: "p",
            texte:
              "Chaque mission suit huit étapes, en quatre temps : **Préparer** (1 Pièces justificatives), **Saisir** (2 Heures de l’entreprise, 3 Sous-traitance), **Contrôler** (4 DGFiP, 5 URSSAF, 6 CNAPS), **Conclure** (7 Plan d’actions, 8 Rapport). Sous « Administratif » : Contrat et factures.",
          },
          {
            type: "p",
            texte:
              "À côté de chaque étape : un cercle vide (à faire), un demi-cercle (en cours) ou une coche (fait), avec une ligne de détail. En bas de chaque page, « Étape suivante » vous mène plus loin.",
          },
          {
            type: "tableau",
            legende: "Quand une étape passe à « fait »",
            colonnes: ["Étape", "Elle est cochée quand…"],
            lignes: [
              ["1 · Pièces justificatives", "toutes les pièces qui s’appliquent sont reçues"],
              ["2 · Heures de l’entreprise", "la période est renseignée et chaque mois a ses heures vendues et ses heures payées"],
              ["3 · Sous-traitance", "chaque sous-traitant a sa conclusion"],
              ["4, 5, 6 · DGFiP, URSSAF, CNAPS", "la conclusion de l’étape est choisie"],
              ["7 · Plan d’actions", "toutes les actions sont « Régularisé »"],
              ["8 · Rapport", "une version est émise"],
            ],
          },
        ],
      },
      {
        id: "audit-pieces",
        titre: "Étape 1 · Pièces justificatives",
        blocs: [
          {
            type: "p",
            texte: "Les [pièces](mission:pieces) sont rangées par thème (Entreprise, CNAPS, Social, Paie…). Chacune affiche son état :",
          },
          {
            type: "liste",
            items: [
              "« Manquante » : rien n’est reçu.",
              "« Reçue » : reçue, sans durée de validité à suivre.",
              "« À jour » : reçue, et encore valable.",
              "« Date à saisir » : reçue, mais l’outil a besoin de sa date pour savoir si elle est encore valable.",
              "« Bientôt périmée » et « Périmée » : une pièce dépassée ne vaut rien le jour du contrôle ; redemandez la version à jour.",
              "« Sans objet » : la pièce ne concerne pas cette entreprise.",
            ],
          },
          {
            type: "p",
            texte:
              "Pour une pièce sans fichier, le menu « Sans fichier » propose « Manquante », « Reçue, original vu sur place » et « Sans objet pour cette entreprise ». Le champ « Date de la pièce » (ou « Échéance portée par la pièce »), puis « Enregistrer la date », calcule sa validité ; une date saisie vaut réception.",
          },
          {
            type: "p",
            texte:
              "Toucher le nom d’un fichier l’ouvre dans un nouvel onglet. Pour le retirer : la corbeille, puis « Confirmer la suppression » (la demande s’annule seule au bout de quelques secondes).",
          },
        ],
      },
      {
        id: "audit-heures",
        titre: "Étape 2 · Heures de l’entreprise",
        blocs: [
          {
            type: "p",
            texte:
              "Tout le contrôle de la sous-traitance part d’[ici](mission:sous-traitance/heures) : A, les heures vendues aux clients ; B, les heures payées aux salariés. A − B, le « capacitaire », est le volume de sous-traitance à expliquer.",
          },
          {
            type: "etapes",
            items: [
              "« Période et repères de calcul » : la période contrôlée et les repères du calcul, puis « Enregistrer les repères ».",
              "« A · Heures vendues aux clients » : une ligne par bon de commande ou par facture client (« Ajouter une vente »).",
              "« Facturation, TVA et règlements » : pour chaque vente, le numéro de facture, la TVA, le TTC et ce que le client a réellement payé.",
              "« B · Heures payées aux salariés » : une ligne par mois (« Ajouter un mois »).",
              "« SMIC horaire brut » : chaque valeur avec sa date d’entrée en vigueur et sa source (« Ajouter une valeur du SMIC »). Elle sert à toutes les missions.",
            ],
          },
          {
            type: "encadre",
            ton: "info",
            titre: "Coller depuis Excel",
            texte:
              "Sous chaque tableau, « Coller depuis Excel » accepte des lignes copiées d’un tableur, dans l’ordre des colonnes indiqué, avec les formats français (1 234,50 · 31/03/2026 · 03/2026). Touchez ensuite « Ajouter ces lignes ».",
          },
        ],
      },
      {
        id: "audit-sous-traitance",
        titre: "Étape 3 · Sous-traitance",
        blocs: [
          {
            type: "p",
            texte:
              "La [page Sous-traitance](mission:sous-traitance) compare, mois par mois, les heures vendues, les heures payées et les heures facturées par les sous-traitants. « Reste inexpliqué » : ce que rien ne couvre. « Facturé en trop par les sous-traitants » : l’inverse. Seuls les sous-traitants de rang 1 comptent dans ce total.",
          },
          {
            type: "etapes",
            items: [
              "Dans « Ajouter un sous-traitant » : raison sociale, SIREN, rang (1 : travaille directement pour le client ; 2 : sous-traitant d’un sous-traitant, avec « Travaille pour »). Puis « Créer et ouvrir son dossier ».",
              "Le dossier a quatre onglets : « Vue d’ensemble » (alertes, faisabilité, paiements), « Pièces et chiffres » (identification, attestations, factures, paiements), « Contrôle » (la grille) et « Conclusion ».",
              "De retour sur la page Sous-traitance, remplissez « Ta conclusion sur le rapprochement » : elle figure au rapport.",
            ],
          },
          {
            type: "p",
            texte:
              "La faisabilité compare les heures facturées par le sous-traitant à ce que son effectif déclaré (sur l’attestation de vigilance) permet de produire. « Supprimer ce sous-traitant », puis « Oui, supprimer le dossier », efface aussi ses attestations, factures et paiements.",
          },
        ],
      },
      {
        id: "audit-controles",
        titre: "Étapes 4, 5 et 6 · DGFiP, URSSAF, CNAPS",
        blocs: [
          {
            type: "p",
            texte:
              "Les trois contrôles se lisent de la même façon : en haut, les chiffres repris des étapes 2 et 3 (rien n’est à ressaisir) ; puis les alertes ; puis la grille « Points de contrôle » ; enfin la conclusion.",
          },
          {
            type: "liste",
            items: [
              "La grille est rangée en sections dépliables : touchez un titre pour l’ouvrir. Le compteur (« 6 / 11 ») montre ce qui est rempli, et combien de « non » ressortent.",
              "Chaque point se répond au toucher : « Oui », « Non », « À vérifier », « Sans objet ». La bulle, à droite, ouvre une observation ; elle s’ouvre seule après un « Non ».",
              "Dans DGFiP, la section des indices s’inverse : répondez « Oui » quand l’indice est constaté.",
              "« Créer une action », à côté de chaque alerte, l’envoie au plan d’actions ; le bouton devient « Action créée ».",
            ],
          },
          {
            type: "tableau",
            legende: "Ce que chaque contrôle regarde",
            colonnes: ["Étape", "Ce qu’elle regarde", "À saisir sur place"],
            lignes: [
              ["[4 · DGFiP](mission:dgfip)", "Factures fictives et de complaisance : commande, facture, prestation réalisée, paiement au bon destinataire", "Le coût de revient horaire de référence, avec sa source, puis « Enregistrer » : l’outil n’en propose aucun"],
              ["[5 · URSSAF](mission:urssaf)", "Travail dissimulé, dissimulation d’activité, prêt illicite de main-d’œuvre, marchandage", "Les salariés de l’entreprise (« Ajouter un salarié ») : contrat, DPAE, registre, identité et titre de travail"],
              ["[6 · CNAPS](mission:cnaps)", "Les fiches Dracar Ultimate, puis le reste du contrôle CNAPS", "Les agents (« Ajouter un agent ») et leur carte professionnelle ; une carte qui expire dans les 30 jours est signalée"],
            ],
          },
          {
            type: "p",
            texte: "Les salariés saisis dans URSSAF et les agents saisis dans CNAPS forment une seule et même liste.",
          },
        ],
      },
      {
        id: "audit-actions",
        titre: "Étape 7 · Plan d’actions",
        blocs: [
          {
            type: "p",
            texte:
              "Dans le [plan d’actions](mission:actions), chaque anomalie devient une action, dans l’ordre de votre méthode : 1 Constat objectif (et le document vérifié), 2 Risque, 3 Action corrective, 4 Justificatif à produire, 5 Responsable, 6 Échéance, 7 Contrôle de régularisation (« À faire », « En cours », « Régularisé »).",
          },
          {
            type: "liste",
            items: [
              "Les actions viennent des alertes (« Créer une action ») ou du bouton « Nouvelle action », en bas de la liste.",
              "Le champ « Risque » décrit ce que la situation expose, sous réserve de la qualification par l’avocat ou l’expert-comptable.",
              "Une échéance dépassée s’affiche « En retard ».",
              "« Exporter pour Excel » télécharge le tableau, prêt à ouvrir dans Excel : c’est l’outil que l’entreprise garde après l’audit.",
              "« Supprimer », puis « Supprimer l’action », retire une action créée par erreur.",
            ],
          },
        ],
      },
      {
        id: "audit-rapport",
        titre: "Étape 8 · Rapport",
        blocs: [
          {
            type: "p",
            texte: "Le [rapport](mission:rapport) se construit à partir de ce que vous avez saisi et conclu.",
          },
          {
            type: "etapes",
            items: [
              "« Avant la version définitive : N points » liste ce qui manque ; « Y aller » vous emmène au bon endroit.",
              "« Les textes du rapport » : pour chacun (objet et périmètre, synthèse, conclusion, limites), l’outil propose une rédaction marquée « Proposition de l’outil, à relire ». Relisez, modifiez, puis touchez « Valider ce texte » ou « Enregistrer mon texte ».",
              "« Voir le rapport » ouvre le PDF tel qu’il serait émis maintenant, sans rien archiver.",
              "« Émettre la version v1 » produit le PDF, le date, le numérote et l’archive. Tant qu’il manque un point, le bouton ajoute « (de travail) » et le PDF porte la mention « Version de travail ».",
              "Chaque version est gardée dans « Versions émises » : c’est ce PDF que vous envoyez au client. L’outil ne l’envoie pas.",
            ],
          },
          {
            type: "encadre",
            ton: "attention",
            titre: "Toujours toucher le bouton du texte",
            texte:
              "Tant qu’un texte n’a jamais été validé, vos modifications ne s’enregistrent pas seules : si vous quittez la page sans toucher « Enregistrer mon texte », elles sont perdues. Une fois le texte validé une première fois, les retouches s’enregistrent en quittant le champ.",
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ 4 */
  {
    id: "commercial",
    titre: "Devis, contrats, factures",
    resume: "La numérotation, ce qui se modifie et ce qui est figé, ce qu’il faut avant une facture, et la fiche Cabinet.",
    fiches: [
      {
        id: "numerotation",
        titre: "La numérotation",
        blocs: [
          {
            type: "tableau",
            legende: "Les numéros et leur moment",
            colonnes: ["Document", "Numéro", "Quand il est attribué"],
            lignes: [
              ["Devis", "D2026-0001, D2026-0002…", "Dès sa création, même s’il reste en brouillon"],
              ["Facture", "F2026-0001, F2026-0002…, à la suite, sans trou", "Quand vous touchez « Émettre la facture »"],
              ["Avoir", "AV2026-0001…", "Quand vous touchez « Émettre l’avoir »"],
              ["Mission", "2026-01, 2026-02…", "À l’acceptation du devis, ou proposé dans « Nouvelle mission »"],
              ["Exemple", "EXEMPLE-D-0001, EXEMPLE-F-0001…", "Hors des vraies séries : la première vraie facture reste F2026-0001"],
            ],
          },
          { type: "p", texte: "Les séries des devis, des factures et des avoirs repartent à 0001 chaque année." },
        ],
      },
      {
        id: "fige",
        titre: "Ce qui se modifie, ce qui est figé",
        blocs: [
          {
            type: "tableau",
            legende: "Jusqu’où chaque document se modifie",
            colonnes: ["Document", "Modifiable", "Figé", "Pour corriger ensuite"],
            lignes: [
              ["Devis", "Tant qu’il n’est pas accepté", "Dès « Accepté : créer la mission et le contrat »", "Corrigez le contrat de la mission"],
              ["Contrat", "Jusqu’à « Marquer comme signé »", "Une fois signé ; son PDF est archivé", "« Rouvrir pour le modifier »"],
              ["Facture", "Jamais", "Dès l’émission ; seul « Marquer payée » (ou « Payée · annuler ») reste possible", "« Annuler par un avoir », puis émettre une facture corrigée"],
            ],
          },
          {
            type: "liste",
            items: [
              "Un devis ne se supprime pas : s’il ne se fait pas, marquez-le « Refusé ».",
              "Une facture émise ne se supprime jamais. L’avoir porte son propre numéro et ne se supprime pas non plus.",
              "Un acompte déjà déduit d’une facture de solde ne s’annule qu’après le solde.",
              "Une facture garde pour toujours les informations d’ANM et du client du jour de son émission.",
            ],
          },
        ],
      },
      {
        id: "avant-facture",
        titre: "Avant d’émettre une facture",
        blocs: [
          {
            type: "p",
            texte:
              "Tant qu’une de ces informations manque, les boutons de facture restent grisés et un cadre « Avant d’émettre une facture, il manque : » dit laquelle :",
          },
          {
            type: "liste",
            items: [
              "le SIREN d’ANM Consulting (page [Cabinet](/admin/cabinet)) ;",
              "l’adresse d’ANM Consulting (page Cabinet) ;",
              "l’adresse du client (sa fiche, dans « Les parties » du contrat) ;",
              "le SIREN du client ;",
              "le prix de la mission, dans le contrat enregistré.",
            ],
          },
        ],
      },
      {
        id: "cabinet",
        titre: "La fiche Cabinet",
        blocs: [
          {
            type: "p",
            texte:
              "[Cabinet](/admin/cabinet) réunit les informations d’ANM, saisies une fois et reprises sur chaque contrat et chaque facture : raison sociale, forme juridique, capital, SIREN, greffe du RCS, TVA (assujettie à 20 % ou franchise en base), adresse, représentante, email, téléphone, IBAN et BIC, délai de paiement (60 jours au plus) et acompte proposé. Touchez « Enregistrer ».",
          },
          {
            type: "liste",
            items: [
              "Le numéro de TVA intracommunautaire se calcule seul à partir du SIREN.",
              "L’IBAN est imprimé sur les factures, pour le virement.",
              "Un changement ne vaut que pour les documents suivants : une facture déjà émise garde les informations du jour de son émission.",
            ],
          },
          {
            type: "encadre",
            ton: "attention",
            titre: "Informations légales en cours de mise à jour",
            texte:
              "Les informations légales d’ANM (forme, capital, siège, SIREN, TVA) seront mises à jour après la modification des statuts en cours. Comme une facture émise les garde pour toujours, mieux vaut attendre cette mise à jour pour émettre la première vraie facture.",
          },
        ],
      },
      {
        id: "exemple",
        titre: "Essayer sans rien casser : l’exemple",
        blocs: [
          {
            type: "etapes",
            items: [
              "Dans [Commercial](/admin/commercial), touchez « Créer un exemple ». Une demande d’« Exemple — Garde Sécurité Services » arrive, comme si elle venait du site.",
              "Déroulez tout : « Préparer le devis », « Accepté : créer la mission et le contrat », signature, factures.",
              "Les documents portent « EXEMPLE » et une mention en filigrane : ils n’entament pas la vraie numérotation.",
              "Quand vous avez fini, « Effacer l’exemple » supprime tout : demande, devis, mission, contrat, factures et PDF. « Recommencer l’exemple » repart de zéro.",
            ],
          },
          { type: "p", texte: "Une fois le devis d’exemple accepté, sa mission apparaît aussi dans la liste des [Missions](/admin), jusqu’à ce que vous effaciez l’exemple." },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ 5 */
  {
    id: "observatoire",
    titre: "L’Observatoire, le blog du site",
    resume: "Écrire, vérifier et publier une fiche ou un dossier. L’outil structure et publie ; l’analyse reste la vôtre.",
    fiches: [
      {
        id: "observatoire-partage",
        titre: "Ce que l’outil fait, ce que vous seule pouvez faire",
        blocs: [
          {
            type: "partage",
            gauche: {
              titre: "L’outil",
              items: [
                "range votre texte dans la structure de la note méthodologique ;",
                "met la page en forme, avec la typographie française (apostrophes, espaces insécables) ;",
                "bloque la publication tant qu’il manque un élément obligatoire ou une des cinq questions ;",
                "publie la page à son adresse et la range dans son territoire (CNAPS, URSSAF, DGFiP…) ;",
                "prépare la page pour Google : titre, description, plan du site, données structurées ;",
                "crée l’image de partage pour LinkedIn et les messageries ;",
                "ajoute la publication au flux RSS.",
              ],
            },
            droite: {
              titre: "Vous seule",
              items: [
                "choisissez la décision ou le sujet ;",
                "lisez la décision en entier, sur sa source ;",
                "distinguez les faits, les griefs, la défense et ce qui a été jugé ;",
                "rédigez le point ANM et la question au dirigeant ;",
                "vérifiez chaque source, chaque date, chaque citation mot pour mot ;",
                "répondez honnêtement aux cinq questions avant diffusion ;",
                "décidez de publier.",
              ],
            },
          },
          {
            type: "p",
            texte:
              "Google découvre ensuite la page à son rythme : l’outil la rend lisible par Google, il ne peut pas garantir sa place dans les résultats.",
          },
          {
            type: "encadre",
            ton: "info",
            titre: "Votre règle",
            texte:
              "« Montrer où se trouve le risque sans donner gratuitement toute la méthode permettant de le neutraliser. » Ni grille, ni méthode de rapprochement, ni check-list, ni plan correctif. Les règles publiques sont dans la [note méthodologique](/observatoire/note-methodologique).",
          },
        ],
      },
      {
        id: "fiche-dossier",
        titre: "Fiche ou dossier ?",
        blocs: [
          {
            type: "liste",
            items: [
              "Une **fiche** décrypte une décision, une sanction ou un contrôle, dans l’ordre de la note méthodologique : [Nouvelle fiche](/admin/observatoire/nouveau?type=fiche).",
              "Un **dossier** est un contenu permanent, rédigé en sections, comme « Contrôle CNAPS : quels éléments sont vérifiés ? » : [Nouveau dossier](/admin/observatoire/nouveau?type=dossier).",
            ],
          },
          {
            type: "p",
            texte:
              "Les deux boutons sont aussi en haut de [Observatoire](/admin/observatoire), avec vos brouillons et ce qui est en ligne. Le type se change encore dans le formulaire, en haut (« Type de publication »), comme le territoire.",
          },
        ],
      },
      {
        id: "sept-blocs",
        titre: "Écrire une fiche : les sept éléments",
        blocs: [
          {
            type: "p",
            texte: "Une fiche suit les sept éléments de la note méthodologique. Dans le formulaire, ils portent ces noms :",
          },
          {
            type: "tableau",
            legende: "Les sept éléments d’une fiche",
            colonnes: ["N°", "Dans la note", "Dans le formulaire", "Pour publier"],
            lignes: [
              ["1", "Une accroche destinée au dirigeant", "« L’accroche », dans « Le sujet »", "Obligatoire"],
              ["2", "Les faits utiles", "« 01 · Ce qui s’est passé »", "Obligatoire"],
              ["3", "Ce qui était reproché", "« 02 · Ce qui était reproché »", "Obligatoire"],
              ["—", "Ce que l’entreprise a fait valoir", "« 03 · Ce que l’entreprise a fait valoir »", "Facultatif : vide, il ne s’affiche pas"],
              ["4", "La décision effectivement rendue", "« 04 · Ce qui a été décidé »", "Obligatoire"],
              ["5", "Pourquoi l’affaire mérite l’attention", "« 05 · Le point ANM »", "Obligatoire"],
              ["6", "La question « Et chez vous ? »", "« 06 · Et chez vous ? »", "Obligatoire"],
              ["7", "La référence de la décision", "« La référence de la décision » : juridiction, date, numéro, lien, stade", "Obligatoire, sauf le lien et la précision sur la suite"],
            ],
          },
          {
            type: "p",
            texte:
              "Sous chaque bloc, une aide grise rappelle votre consigne. Le titre : direct, compréhensible par un dirigeant, sans dramatisation. L’accroche : deux ou trois lignes. « Sources » : une par ligne, le libellé puis l’adresse ; facultatif pour une fiche, recommandé pour un dossier.",
          },
        ],
      },
      {
        id: "stade",
        titre: "Le stade de la procédure",
        blocs: [
          {
            type: "p",
            texte: "Obligatoire pour une fiche : un référé n’est jamais présenté comme une décision définitive. Le menu « Stade de la procédure » propose :",
          },
          { type: "liste", items: STADES.map((s) => `**${s.libelle}** : ${s.portee}`) },
          {
            type: "p",
            texte: "« Précision sur la suite » (facultatif) : ce que l’on sait de la suite, appel formé, pourvoi pendant, renvoi.",
          },
        ],
      },
      {
        id: "google",
        titre: "L’aperçu Google",
        blocs: [
          {
            type: "p",
            texte: "La partie « Référencement Google » est facultative : sans rien y mettre, Google reçoit le titre et l’accroche.",
          },
          {
            type: "liste",
            items: [
              `« Titre pour Google » : ${LIMITE_TITRE_SEO}${NB}caractères au plus, mots importants au début (« Contrôle CNAPS », « sous-traitance », « URSSAF »).`,
              `« Description pour Google » : ${LIMITE_DESCRIPTION}${NB}caractères au plus. Au-delà, l’accroche est coupée au dernier mot entier.`,
              "Le compteur passe à l’orange près de la limite, au rouge au-delà.",
              "Le cadre « Aperçu dans Google » montre le résultat tel qu’il apparaîtra : l’adresse, le titre, la description.",
            ],
          },
        ],
      },
      {
        id: "cinq-questions",
        titre: "Les cinq questions avant diffusion",
        blocs: [
          {
            type: "p",
            texte: "En bas du formulaire. Tant qu’une case reste vide, « Publier » reste grisé. Cochez-les en conscience : c’est votre dernier contrôle.",
          },
          { type: "etapes", items: QUESTIONS_DIFFUSION.map((q) => q.texte) },
        ],
      },
      {
        id: "publier",
        titre: "Publier, mettre à jour, retirer",
        blocs: [
          {
            type: "p",
            texte:
              "Le cadre « Publication » (à droite, ou sous le formulaire quand l’écran est plus étroit) indique « Brouillon » ou « En ligne ».",
          },
          {
            type: "etapes",
            items: [
              "« Enregistrer le brouillon » garde votre travail. Un brouillon n’est visible que dans l’espace de travail.",
              "« Aperçu de la page », en haut une fois le brouillon enregistré, montre la page telle que le lecteur la verra.",
              "Quand « Pour publier, il manque : » a disparu et que « Tout est en place » s’affiche, touchez « Publier ». La page est en ligne ; « Voir en ligne » l’ouvre.",
            ],
          },
          {
            type: "liste",
            items: [
              "Une page en ligne se corrige avec « Enregistrer la page en ligne ». Pour une correction de fond, cochez « Mise à jour de fond » : les lecteurs verront « Mis à jour le ». Pas pour une coquille.",
              "« Retirer du site » remet la page en brouillon ; sa date de première publication est conservée.",
              "« Supprimer le brouillon », en bas d’un brouillon, efface tout son contenu tout de suite : pas de confirmation, pas de retour possible.",
            ],
          },
        ],
      },
      {
        id: "adresse",
        titre: "L’adresse de la page",
        blocs: [
          {
            type: "liste",
            items: [
              "Elle se crée toute seule à partir du titre : minuscules, sans accents, mots séparés par des tirets, après /observatoire/.",
              "Vous pouvez la raccourcir à la main ; « Reprendre le titre » la recalcule.",
              "Certaines adresses sont réservées (les noms des territoires, « note-methodologique »…) : l’outil le signale.",
              "Après la publication, n’y touchez plus : l’ancienne adresse cesse de fonctionner, et les liens déjà partagés (LinkedIn, emails, Google) mènent à une page introuvable.",
            ],
          },
        ],
      },
      {
        id: "dossier",
        titre: "Écrire un dossier",
        blocs: [
          {
            type: "p",
            texte: "Un dossier n’a qu’un grand champ, « Texte ». Quelques signes suffisent pour la mise en forme :",
          },
          {
            type: "syntaxe",
            lignes: [
              { saisie: "## Ce que regarde le contrôleur", effet: "un intertitre (le sommaire du dossier se construit tout seul)" },
              { saisie: "- premier point", effet: "une liste à puces" },
              { saisie: "**mot**", effet: "du gras" },
              { saisie: "[Légifrance](https://www.legifrance.gouv.fr/…)", effet: "un lien" },
              { saisie: "une ligne vide", effet: "un nouveau paragraphe" },
            ],
          },
          {
            type: "p",
            texte:
              "Apostrophes courbes et espaces insécables sont ajoutées automatiquement sur le site : tapez normalement. Votre squelette éditorial : expliquer le risque, le mécanisme, ce que l’administration regarde, ce que la jurisprudence retient. Jamais la grille complète, les méthodes de rapprochement ni la procédure corrective.",
          },
        ],
      },
      {
        id: "brouillons",
        titre: "Les brouillons préparés",
        blocs: [
          {
            type: "p",
            texte:
              "Des fiches et des dossiers ont été préparés pour le lancement. Ils ne sont pas dans l’outil : **les brouillons préparés vous sont transmis par Merwan**.",
          },
          {
            type: "etapes",
            items: [
              "Lisez le brouillon jusqu’au bout : ses sources, les points « À vérifier », et ce que vous devez y apporter.",
              "Ouvrez « Nouvelle fiche » ou « Nouveau dossier », et collez chaque partie dans le bloc qui lui correspond.",
              "Relisez toute citation mot pour mot sur la source avant de publier.",
              "Écrivez le point ANM avec vos mots : c’est lui qui fait la valeur de la fiche.",
            ],
          },
        ],
      },
      {
        id: "alertes",
        titre: "Les inscriptions « Être prévenu »",
        blocs: [
          {
            type: "p",
            texte:
              "Tant qu’une page de l’Observatoire n’a aucune publication, elle propose au visiteur de laisser son email pour être prévenu. Les inscriptions arrivent dans [Commercial](/admin/commercial#demandes), marquées « Alerte Observatoire ».",
          },
          {
            type: "encadre",
            ton: "attention",
            titre: "Aucun email ne part",
            texte:
              "Ce n’est pas encore branché : personne n’est prévenu à la publication d’une fiche. Et le formulaire d’inscription disparaît de la page d’accueil de l’Observatoire dès la première publication ; il ne reste que sur les territoires encore vides.",
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ 6 */
  {
    id: "automatique",
    titre: "Ce qui est automatique, et ce qui ne l’est pas",
    resume: "Sur tout l’outil, en un tableau. En un mot : l’outil calcule, remplit, numérote et archive ; il n’envoie aucun email.",
    fiches: [
      {
        id: "recapitulatif",
        titre: "Le tableau récapitulatif",
        blocs: [
          {
            type: "tableau",
            legende: "Ce que fait l’outil, ce qui reste à vous",
            colonnes: ["Sujet", "L’outil", "Vous"],
            lignes: [
              ["Enregistrer vos saisies d’audit", "Oui, au fil de l’eau (réponses, tableaux, actions)", "Toucher le bouton des devis, contrats, fiches, articles et textes du rapport"],
              ["Calculer écarts, capacitaire, faisabilité, paiements, alertes", "Oui, à chaque saisie", "Les interpréter"],
              ["Qualifier juridiquement un écart", "Non, jamais", "Vous, avec l’avocat ou l’expert-comptable du client"],
              ["Suivre l’avancement des étapes", "Oui, dans la barre latérale", "—"],
              ["Calculer la validité des pièces", "Oui, dès que leur date est saisie", "Saisir la date"],
              ["Compléter la fiche d’un client", "Oui, depuis le SIREN (annuaire des entreprises)", "Vérifier, corriger"],
              ["Chiffrer un devis", "Oui, avec la grille du site et la demande", "Relire, ajuster"],
              ["Créer la mission et le contrat", "Oui, en un bouton, à l’acceptation du devis", "Toucher le bouton, relire le contrat"],
              ["Numéroter devis, factures et avoirs", "Oui, sans trou", "—"],
              ["Archiver les PDF (contrat signé, factures, versions du rapport)", "Oui", "—"],
              ["Proposer les textes du rapport", "Oui, une proposition tirée de vos réponses", "Relire, corriger, valider"],
              ["Envoyer un email, quel qu’il soit", "Non : aucun email ne part de l’outil", "Envoyer devis, contrat, liste des pièces, rapport et factures"],
              ["Relancer les pièces manquantes", "Non", "Copier la liste des manquantes et relancer par email"],
              ["Relancer une facture en retard", "Non : elle s’affiche « en retard »", "Relancer le client"],
              ["Vous prévenir d’une nouvelle demande du site", "Non : seulement le bandeau de la page Missions", "Consulter Commercial"],
              ["Accuser réception au prospect", "Non, même si le site l’annonce", "Le rappeler"],
              ["Envoyer la checklist demandée sur le site", "Non, pas encore branché", "L’envoyer depuis votre messagerie"],
              ["Prévenir les inscrits « Être prévenu » de l’Observatoire", "Non, pas encore branché", "—"],
              ["Ouvrir son espace au client", "Non : l’espace client n’est pas encore ouvert", "—"],
              ["Mettre en page et publier un article de l’Observatoire", "Oui : typographie, image de partage, flux RSS, plan du site, données pour Google", "Choisir, lire, rédiger, vérifier, décider de publier"],
            ],
          },
        ],
      },
    ],
  },

  /* ------------------------------------------------------------------ 7 */
  {
    id: "bloquee",
    titre: "Je suis bloquée",
    resume: "Les messages que l’outil peut afficher, et quoi faire. Touchez une question pour l’ouvrir.",
    faq: true,
    fiches: [
      {
        id: "faq-identifiants",
        titre: "« Adresse ou mot de passe incorrect »",
        blocs: [
          {
            type: "p",
            texte:
              "Vérifiez l’adresse, et touchez « Afficher » pour relire le mot de passe. Le message est volontairement le même quand l’adresse n’existe pas. Après plusieurs essais, l’écran répond « Trop de tentatives en peu de temps » : attendez quelques minutes. Toujours bloquée : demandez à Merwan de réinitialiser votre mot de passe.",
          },
        ],
      },
      {
        id: "faq-active",
        titre: "« Ce compte n’est pas encore activé »",
        blocs: [{ type: "p", texte: "Votre mot de passe est le bon, mais le compte n’a pas été activé. Seul Merwan peut le faire." }],
      },
      {
        id: "faq-service",
        titre: "« Le service de connexion ne répond pas »",
        blocs: [{ type: "p", texte: "Le service est momentanément indisponible. Réessayez dans un instant ; si cela dure, prévenez Merwan." }],
      },
      {
        id: "faq-lien",
        titre: "Mon lien de connexion reçu par email a expiré",
        blocs: [
          {
            type: "p",
            texte:
              "La connexion ne passe plus par un lien envoyé par email : elle se fait avec votre adresse et votre mot de passe, sur [Connexion](/connexion). Un ancien email de connexion ne sert plus à rien.",
          },
        ],
      },
      {
        id: "faq-publier-grise",
        titre: "Le bouton « Publier » est grisé",
        blocs: [
          {
            type: "p",
            texte:
              "Regardez le cadre « Publication » : sous « Pour publier, il manque : », la liste dit exactement quoi (un bloc, la juridiction, le stade de la procédure, une question avant diffusion…). Complétez : le bouton s’active dès que la liste disparaît. Les cinq cases des questions avant diffusion comptent aussi. Détail dans [Les sept éléments](/admin/aide#sept-blocs).",
          },
        ],
      },
      {
        id: "faq-publication-impossible",
        titre: "« Publication impossible : il manque… » ou « Enregistrement refusé : la page est en ligne et il manque… »",
        blocs: [
          {
            type: "p",
            texte:
              "Même liste que ci-dessus. Sur une page en ligne, un bloc obligatoire vidé empêche d’enregistrer : remplissez-le, ou touchez d’abord « Retirer du site ».",
          },
        ],
      },
      {
        id: "faq-adresse-prise",
        titre: "« Cette adresse est déjà prise par une autre publication »",
        blocs: [{ type: "p", texte: "Deux pages ne peuvent pas avoir la même adresse. Modifiez l’« Adresse de la page » : ajoutez un mot, ou l’année." }],
      },
      {
        id: "faq-adresse-format",
        titre: "« L’adresse ne doit contenir que des minuscules sans accents… »",
        blocs: [
          {
            type: "p",
            texte:
              "L’adresse n’accepte que des minuscules sans accents, des chiffres et des tirets, et pas un nom de territoire. Touchez « Reprendre le titre » pour la recalculer.",
          },
        ],
      },
      {
        id: "faq-lien-decision",
        titre: "« Le lien du texte intégral doit commencer par https:// »",
        blocs: [
          {
            type: "p",
            texte: "Copiez l’adresse complète depuis la barre du navigateur, sur Légifrance ou sur le site de la juridiction, et collez-la telle quelle.",
          },
        ],
      },
      {
        id: "faq-pdf",
        titre: "Le rapport PDF ne s’ouvre pas",
        blocs: [
          {
            type: "p",
            texte:
              "« Voir le rapport » ouvre un nouvel onglet : laissez-lui quelques secondes. Si la page affiche « Le rapport n’a pas pu être produit », réessayez ; si l’erreur revient, prévenez Merwan en lui disant sur quelle mission.",
          },
        ],
      },
      {
        id: "faq-archive",
        titre: "« Le PDF n’a pas pu être archivé. Réessaie. »",
        blocs: [
          {
            type: "p",
            texte: "Rien n’a été émis ni archivé, qu’il s’agisse du rapport ou du contrat. Réessayez dans un instant.",
          },
        ],
      },
      {
        id: "faq-texte-perdu",
        titre: "Mes modifications d’un texte du rapport ont disparu",
        blocs: [
          {
            type: "p",
            texte:
              "Un texte jamais validé ne s’enregistre qu’avec le bouton (« Valider ce texte » ou « Enregistrer mon texte »). Réécrivez-le, et touchez le bouton avant de quitter la page.",
          },
        ],
      },
      {
        id: "faq-facture-manque",
        titre: "« Avant d’émettre une facture, il manque : … »",
        blocs: [
          {
            type: "p",
            texte:
              "Le cadre dit quoi compléter : le SIREN ou l’adresse d’ANM dans [Cabinet](/admin/cabinet) ; l’adresse ou le SIREN du client dans sa fiche (« Compléter depuis le SIREN ») ; ou le prix dans le contrat.",
          },
        ],
      },
      {
        id: "faq-facture-erreur",
        titre: "Je me suis trompée sur une facture émise",
        blocs: [
          {
            type: "p",
            texte:
              "Elle ne se modifie ni ne se supprime. Touchez « Annuler par un avoir », puis « Émettre l’avoir » : la facture est annulée, et vous pouvez en émettre une corrigée. S’il s’agit d’un acompte déjà déduit d’un solde, annulez d’abord le solde.",
          },
        ],
      },
      {
        id: "faq-contrat-signe",
        titre: "« Le contrat est signé : rouvre-le avant de le modifier »",
        blocs: [
          {
            type: "p",
            texte: "Touchez « Rouvrir pour le modifier », corrigez, enregistrez, puis marquez-le de nouveau comme signé.",
          },
        ],
      },
      {
        id: "faq-devis-accepte",
        titre: "« Ce devis est accepté : il ne se modifie plus »",
        blocs: [
          {
            type: "p",
            texte: "Le prix et les conditions vivent maintenant dans le contrat de la mission : touchez « Ouvrir le contrat et les factures ».",
          },
        ],
      },
      {
        id: "faq-devis-erreur",
        titre: "J’ai accepté un devis par erreur",
        blocs: [
          {
            type: "p",
            texte:
              "La mission et le contrat ont été créés. Rien ne se défait depuis l’outil : contactez Merwan, et n’émettez aucune facture sur cette mission en attendant.",
          },
        ],
      },
      {
        id: "faq-siren",
        titre: "« Ce SIREN est introuvable dans l’annuaire des entreprises… »",
        blocs: [
          {
            type: "p",
            texte: `Vérifiez les 9${NB}chiffres avec le client. L’annuaire peut aussi être momentanément indisponible : saisissez alors la forme, l’adresse et le dirigeant à la main, puis « Enregistrer la fiche ». Si l’outil prévient que la société est fermée, vérifiez le SIREN avec le client.`,
          },
        ],
      },
      {
        id: "faq-invitation",
        titre: "Le client n’a pas reçu son invitation, ou ne peut pas se connecter",
        blocs: [
          {
            type: "p",
            texte:
              "L’outil n’envoie pas d’invitation : l’espace client n’est pas encore ouvert. Ce que le client doit recevoir, envoyez-le-lui par email.",
          },
        ],
      },
      {
        id: "faq-rien-recu",
        titre: "Le client n’a rien reçu (devis, liste des pièces, rapport)",
        blocs: [
          {
            type: "p",
            texte: "L’outil n’envoie aucun email. Ouvrez le PDF (ou copiez la liste) et envoyez-le depuis votre messagerie.",
          },
        ],
      },
      {
        id: "faq-depot",
        titre: "Le dépôt d’un fichier échoue",
        blocs: [
          {
            type: "liste",
            items: [
              "« La connexion a été perdue pendant l’envoi » : touchez « Réessayer » quand le réseau revient.",
              `« … au-delà de la limite de 50${NB}Mo » : découpez ou compressez le fichier (un PDF par mois, par exemple).`,
              "« Le stockage n’a pas répondu » : réessayez dans un instant.",
              "« Retirer » efface de la liste un envoi raté.",
            ],
          },
        ],
      },
      {
        id: "faq-piece-fichiers",
        titre: "« Cette pièce a N fichiers déposés. Supprime-les d’abord… »",
        blocs: [
          {
            type: "p",
            texte:
              "Une pièce qui a des fichiers ne peut pas être déclarée manquante ou sans objet. Supprimez d’abord ses fichiers : la corbeille, puis « Confirmer la suppression ».",
          },
        ],
      },
      {
        id: "faq-non-enregistre",
        titre: "Un triangle rouge ou « Non enregistré » à côté d’une réponse",
        blocs: [
          {
            type: "p",
            texte:
              "La réponse n’a pas été enregistrée, souvent à cause du réseau : touchez-la de nouveau. Pour une ligne de tableau, le message sous la ligne dit quoi corriger, par exemple « Date illisible. Exemple : 31/10/2026. ».",
          },
        ],
      },
      {
        id: "faq-etape-en-cours",
        titre: "Une étape reste « en cours » alors que j’ai fini",
        blocs: [
          {
            type: "p",
            texte:
              "Une étape de contrôle n’est cochée que lorsque sa conclusion est choisie ; la sous-traitance, lorsque chaque sous-traitant a la sienne. Voir [La barre des étapes](/admin/aide#barre).",
          },
        ],
      },
      {
        id: "faq-telephone",
        titre: "Je ne vois pas Commercial, Observatoire ou Cabinet sur mon téléphone",
        blocs: [{ type: "p", texte: "L’écran est trop étroit : tournez le téléphone, ou utilisez les liens de cette page." }],
      },
      {
        id: "faq-creer-action",
        titre: "« Créer une action » affiche « Réessayer »",
        blocs: [
          {
            type: "p",
            texte:
              "L’action n’a pas été créée. Touchez « Réessayer » ; si cela persiste, créez-la à la main avec « Nouvelle action » dans le [Plan d’actions](mission:actions).",
          },
        ],
      },
      {
        id: "faq-page-erreur",
        titre: "Une page affiche une erreur ou reste blanche",
        blocs: [{ type: "p", texte: "Rechargez la page. Si le problème revient, notez son adresse et contactez Merwan." }],
      },
    ],
    fin: [
      {
        type: "encadre",
        ton: "info",
        titre: "En dernier recours : contactez Merwan",
        texte:
          "Pour qu’il vous aide vite, dites-lui sur quelle page vous étiez (l’adresse en haut du navigateur), ce que vous avez touché, et le message exact affiché. Une capture d’écran suffit souvent.",
      },
    ],
  },
];

/** Le texte brut d’une fiche (sans la syntaxe des liens ni le gras), pour la recherche. */
export const texteBrut = (fiche: FicheAide): string => {
  const morceaux: string[] = [fiche.titre];
  for (const b of fiche.blocs) {
    if (b.type === "p") morceaux.push(b.texte);
    else if (b.type === "etapes" || b.type === "liste") morceaux.push(...b.items);
    else if (b.type === "encadre") morceaux.push(b.titre, b.texte ?? "", ...(b.items ?? []));
    else if (b.type === "tableau") morceaux.push(b.legende, ...b.colonnes, ...b.lignes.flat());
    else if (b.type === "partage") morceaux.push(b.gauche.titre, ...b.gauche.items, b.droite.titre, ...b.droite.items);
    else if (b.type === "syntaxe") morceaux.push(...b.lignes.flatMap((l) => [l.saisie, l.effet]));
  }
  return normaliserRecherche(morceaux.join(" ").replace(/\[([^\]]+)\]\([^)]*\)/g, "$1").replace(/\*\*/g, ""));
};
