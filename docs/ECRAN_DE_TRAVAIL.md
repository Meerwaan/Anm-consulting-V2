# L'écran de travail d'une mission

Décision 03 : l'écran s'organise **par étape de la méthode**, pas par module.
`/admin/missions/<id>/etapes/<ordre>`.

## Le principe

Les 15 étapes forment la colonne de gauche, dans l'ordre où la mission se déroule.
Chaque étape porte, en base :

- `kind` — sa nature, qui décide de la surface affichée ;
- `domaines` — les domaines de points de contrôle qu'elle couvre ;
- `objectif` — une phrase de rappel.

Les points affichés sont **restreints aux modules actifs de la mission** : une mission
CNAPS ne voit pas les 208 points du référentiel, elle en voit 49. Vérifié : une mission
`audit_360` affiche 184 points répartis sur 6 étapes, une mission `fiscal` en affiche 24.

## Le bloc « hors étape »

Les 15 étapes sont antérieures au 5ᵉ pilier : **aucune ne couvre le fiscal**. Une mission
fiscale a donc aujourd'hui 0 point dans ses étapes et 24 hors étape. Plutôt que de les
ranger de force dans une étape approximative, l'écran affiche un bloc « Hors étape » qui
les rend visibles et travaillables. La règle « rien ne manque » tient, et la question reste
posée à la consultante : veut-elle une 16ᵉ étape ?

## Ce que l'écran fait gagner

Trois postes de temps perdu ont été traités directement dans l'interface.

| Avant | Après | Pourquoi ça compte |
|---|---|---|
| Réclamer les pièces une par une, puis relancer à la main | **Un bouton** « demander les N pièces manquantes », puis relance automatique tous les 3 jours | C'est le premier poste d'attente d'une mission : chaque aller-retour coûte des jours |
| Cocher les 184 points un par un | **Un bouton** « marquer conformes les points restants », qui ne touche que ceux encore à vérifier | Sur une mission saine, l'essentiel est conforme : le temps doit aller aux écarts, pas à la saisie de la normalité |
| Chercher dans quel classeur se trouve le point qu'on est en train de contrôler | Les points arrivent **au moment de l'étape** où on les contrôle | Supprime la navigation entre modules pendant la journée d'audit |

Le compteur en haut à gauche répond en permanence à la seule question qui compte pendant
une mission : *est-ce qu'il me manque quelque chose ?*

## La validité des pièces

« Rien ne manque » ne suffit pas : une attestation de vigilance de sept mois ne vaut rien
le jour du contrôle. Chaque pièce dont la durée est connue porte son échéance, et surtout
**la nature de cette durée** :

| Nature | Ce que ça veut dire | Exemples |
|---|---|---|
| `texte` | Un texte impose la périodicité | Attestation de vigilance : tous les 6 mois (C. trav. art. L8222-1) · DUERP : au moins annuel |
| `pratique` | L'usage l'exige, aucun texte | Kbis : moins de 3 mois — **un Kbis n'a pas de durée de validité légale** |
| `date_du_document` | L'échéance est écrite sur la pièce | Carte professionnelle, autorisation d'exercer, agrément dirigeant |
| `indefinie` | Sans péremption | Organigramme, contrats |

Cette distinction n'est pas cosmétique : dire « périmé » d'un Kbis de quatre mois serait
faux. On dit « au-delà des trois mois habituellement exigés ».

Le seuil d'effectif est respecté : la mise à jour annuelle du DUERP ne s'impose qu'aux
entreprises d'au moins onze salariés (R4121-2). Sous ce seuil, l'écran n'alarme pas —
une fausse alerte dans un outil de préparation au contrôle est pire que pas d'alerte.

Chaque pièce datée alimente automatiquement la table `deadlines`, qui est la matière de
l'offre d'abonnement (alertes 90 / 60 / 30 jours).

### Les pièces de la vigilance, absentes du pack

Le pack demandait « la liste des sous-traitants » et **aucune** des pièces qui prouvent la
vigilance. Quatre modèles ont été ajoutés : contrats signés, attestations de vigilance de
moins de six mois, Kbis des sous-traitants, autorisations CNAPS des sous-traitants. Le
manquement expose le dirigeant à la solidarité financière des dettes de son sous-traitant
(C. trav. art. L8222-2).

## Le contrôle croisé (étape 10)

Six rapprochements, chacun entre deux sources qui devraient dire la même chose. Le système
calcule l'écart et le compare à une tolérance ; **il ne conclut rien** — un écart n'est pas
un constat, c'est la consultante qui le qualifie.

| Rapprochement | Tolérance par défaut | Pourquoi |
|---|---|---|
| Agents avec carte valide ↔ effectif en paie | 0 % | Un agent payé sans carte, c'est de l'exercice illégal |
| Heures planifiées ↔ heures pointées | 5 % | Un écart large signale un planning que personne ne tient |
| Heures pointées ↔ heures payées | 1 % | Des heures travaillées non payées = travail dissimulé (L8221-5) |
| Heures payées ↔ heures facturées | 10 % | Interroge la sous-traitance non déclarée, ou la réalité des prestations |
| Sous-traitants actifs ↔ attestations à jour | 0 % | Chaque manquant = solidarité financière |
| Effectif en paie ↔ effectif en DSN | 0 % | Le cas d'école du contrôle URSSAF |

## Du point de contrôle au constat, puis au plan d'actions

C'est le dernier gros poste de saisie qui restait. Sur une mission 360°, 184 points :
retaper à la main chaque écart dans le rapport prenait la fin de mission.

**Étapes de contrôle (6, 7, 8, 9)** — un point marqué en écart affiche « Rédiger le
constat ». Le constat s'ouvre déjà rempli avec ce que le référentiel sait :

| Champ | Pré-rempli depuis |
|---|---|
| Titre | Thème et sous-thème du point |
| Le fait | La note de saisie si elle existe, sinon la trame du pack + la question du point |
| La preuve | La colonne « preuves à examiner » du référentiel |
| La référence | Les textes **principaux** du domaine (`textes.ts`), marqués « à vérifier » |
| Criticité | La gravité retenue à la saisie, sinon le risque initial du point |
| Priorité | Déduite de la criticité : Critique → P1, Majeur → P2, Modéré → P3, Mineur → P4 |
| Axe | `partiel` → amélioration · `non_conforme` → risque de contrôle |

Elle ne rédige que ce qui est propre au dossier.

**Étapes 11 et 12 (qualification)** — tous les constats, dans l'ordre de la chaîne du pack :
fait, preuve, référence, recommandation, puis criticité, axe et statut.

### Ce qui reste à faire est visible sans rien ouvrir

Un constat n'est **fini** que quand la chaîne du pack est complète : le fait (pas la trame
pré-remplie), la preuve, la référence, sa vérification, la recommandation. L'écran s'en sert :

- en-tête de section : « 3 à finir · 4 prêts · 2 publiés » ;
- les constats **à finir** sont ouverts, avec la liste de ce qui manque sous le formulaire ;
- les constats **prêts** se replient sur une ligne, dépliables si besoin.

Elle ne fait plus défiler vingt formulaires identiques pour retrouver lesquels sont finis.
Sur les étapes de contrôle, un point qui porte un constat affiche « constat à finir » ou
« constat prêt », en lien direct vers l'étape 11.

### Le verrou

**Un constat ne part au client que s'il est COMPLET** : le fait, la preuve, la référence,
sa vérification, la recommandation. Vérifier la seule référence ne suffisait pas — un
constat a réellement été publié avec la trame « [fait précis à compléter] » dedans. La
chaîne du pack est indivisible, le verrou l'est aussi.

Et rien n'échoue en silence : si la publication est demandée sur un constat incomplet,
l'écran répond « enregistré, mais NON publié : il manque la preuve, la recommandation ».
Chaque écriture confirme ce qu'elle a fait.

**Les champs ne sont jamais pré-remplis d'une trame à trous.** Un encadré qui paraît plein
mais compte comme vide fait chercher un champ manquant qui n'existe pas. Ce que dit le
référentiel — le point vérifié, les preuves à examiner — s'affiche **sous** le champ, en
gris ; le champ, lui, est vide avec un exemple en filigrane.

Un point de contrôle ne peut porter qu'**un** constat par mission (index unique, migration
0014) : deux clics rapprochés sur « Rédiger le constat » ne créent plus de jumeaux, ce que
la garde applicative seule laissait passer.

**Étape 13 (plan d'actions)** — un bouton génère une action par constat qui n'en a pas
encore, avec l'échéance conseillée : P1 à 7 jours, P2 à 30, P3 à 90, P4 à 180. Le client
coche ensuite ce qu'il a fait et la consultante est notifiée (décision 07).

## Reste à construire

- Dépôt de pièce côté client et fil d'échange.
- Job d'envoi Resend sur la vue `document_requests_a_relancer`.
