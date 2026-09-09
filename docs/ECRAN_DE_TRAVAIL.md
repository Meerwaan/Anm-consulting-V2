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

**Étapes 11 et 12 (qualification)** — tous les constats, dans l'ordre de la règle d'or :
fait, preuve, **risque encouru**, référence vérifiée, action et délai, puis criticité et axe.

### La règle d'or, en entier

`FAIT → PREUVE → RISQUE → RÉFÉRENCE VÉRIFIÉE → ACTION → DÉLAI` (01 Bible §1). La fiche n'en
portait que cinq maillons : **le risque encouru n'existait ni comme champ ni comme colonne**,
alors que le sous-titre de l'étape 11 le promettait et que la formule type (01 annexe 2)
l'écrit mot pour mot. Corrigé en migration 0021.

Une criticité n'est pas un risque. « Critique » dit à la consultante dans quel ordre traiter ;
ça ne dit pas au dirigeant qu'il encourt une requalification en travail dissimulé, un
redressement ou un retrait d'autorisation. C'est cette phrase-là qu'il retient et qui justifie
la mission — et c'est celle que le pack demande d'écrire.

Le champ reste **factuel et prudent** : la formule affichée en filigrane est « Cette situation
peut exposer l'entreprise à …, sous réserve de confirmation de la règle applicable ». Le
portail ne qualifie pas juridiquement ; il décrit une exposition et renvoie la qualification à
l'avocat ou à l'expert-comptable (règle de conception 1).

La chaîne est affichée en haut de l'étape 11 : c'est elle, maillon par maillon, que reprend le
contrôle de complétude.

### L'escalade — le maillon qui protège la consultante

Le Manuel de terrain énumère **six** éléments de constat : Fait, Preuve, Risque, Référence,
Action, **Escalade** — « avocat, expert-comptable ou autre spécialiste lorsque le sujet
dépasse votre périmètre ». Chaque fiche de la Bible et du Manuel porte une section « Quand
escalader ». Le modèle 07 §9 demande les sujets à faire valider. Le corrigé du cas 01 en fait
un tableau entier.

Dans le portail, « avocat » et « expert-comptable » n'apparaissaient **que sur la vitrine**.
Aucun constat ne pouvait porter cette décision — alors que c'est la frontière de responsabilité
de la consultante et le cœur de son positionnement : « je ne remplace ni l'avocat ni
l'expert-comptable ».

Chaque constat porte désormais un spécialiste (les six que nomme le pack, plus « aucune ») et
une ligne d'explication. L'étape 14 en tire la section « Sujets à faire valider par un
spécialiste », groupée par métier. Migration 0023.

**Question ouverte pour Sofia** : l'escalade doit-elle être obligatoire sur un constat critique
ou majeur avant publication ? Elle n'est aujourd'hui pas bloquante — une décision non prise
s'affiche « à trancher ».

### Les délais du plan sont ceux du pack

`P1 immédiat · P2 sous 30 jours · P3 sous 90 jours · P4 amélioration continue` — la procédure
§10, le Manuel de terrain et le modèle 07 §3 disent la même chose, mot pour mot.

Le code posait **P1 à 7 jours** et **P4 à 180 jours**. Deux chiffres inventés. « Immédiat »
n'est pas « sous une semaine » : un P1, c'est un titre manquant, du travail dissimulé ou un
risque santé-sécurité grave — écrire J+7 sur le plan remis au dirigeant lui accorde une semaine
que la méthode ne lui donne pas. Et « amélioration continue » n'a pas de date : en inventer une
fabrique une échéance que personne n'a décidée et qui déclenchera des relances. Une action P4
naît donc **sans échéance**, et son absence n'est pas comptée comme un oubli.

### Les tolérances des contrôles croisés repassent à zéro

La procédure §7 dit : « **investiguer tout écart** — erreur de saisie, remplacement, heure non
payée, heure non déclarée, double facturation, sous-traitant différent ». Le pack ne donne
aucun seuil, nulle part.

Le code posait 5 % entre planning et pointage, 1 % entre pointage et paie, 10 % entre paie et
facturation. Mes chiffres. Sur un site à 1 000 heures, 5 % laissaient passer 40 heures sans que
personne ne les regarde — et c'est exactement le terrain du travail dissimulé. Tolérances à
zéro par défaut ; la consultante peut les relever mission par mission, mais c'est alors une
décision prise, pas un réglage hérité.

### Ce qui reste à faire est visible sans rien ouvrir

Un constat n'est **fini** que quand la chaîne du pack est complète : le fait (pas la trame
pré-remplie), la preuve, la référence, sa vérification, la recommandation. L'écran s'en sert :

- en-tête de section : « 3 à finir · 4 prêts · 2 pour le client » ;
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

### Ce qui n'est pas dans la grille

Les 208 points couvrent ce qu'on sait chercher. Un audit sur site fait remonter autre
chose : une pratique, une organisation, un propos du dirigeant. En bas de l'étape 11,
**« écrire un constat qui ne vient d'aucun point de contrôle »** ouvre un constat vide,
soumis exactement aux mêmes exigences que les autres. Sans cette porte, ce constat-là
finit sur un carnet et n'entre jamais au rapport. Il s'affiche « hors grille » là où les
autres portent leur code de point.

### Défaire

Un clic sur le mauvais point crée un constat qui fausse ensuite tous les compteurs des
étapes 12, 13 et 14. **« Supprimer ce constat »**, replié sous chaque formulaire, efface
le constat et l'action générée depuis lui, et rend le point de contrôle disponible. Deux
gestes volontaires, pas de confirmation par fenêtre : l'écran fonctionne sans JavaScript.

### Ce que la base garde en plus

- `reference_checked_on` — le pack exige une référence « vérifiée **et datée** ». La date
  se pose seule au moment où elle coche, et repart si elle décoche **ou si elle change le
  texte de la référence** : une date qui survit au texte qu'elle datait ferait dire à
  l'écran « vérifiée le 8 septembre » pour un article jamais ouvert.
- `updated_at` — quand le constat a été retouché pour la dernière fois, affiché sous le
  formulaire. Utile en reprenant une mission une semaine plus tard.
- `status` — passe à `valide` quand la chaîne est complète. Il restait à `ouvert` pour
  tout le monde, donc il mentait.
- La place dans la synthèse est **unique en base** (migration 0019). Si elle est prise,
  l'étape 12 **échange** les deux constats au lieu de refuser : elle vient de dire lequel
  passe devant, l'obliger à défaire l'autre d'abord serait absurde.

### Le nombre de constats mis en avant appartient à la mission

Le rang était plafonné à 5, repris du modèle 07 §5 qui dessine cinq blocs « Constat
prioritaire n°1 » à « n°5 ». **Ce n'est pas une règle** : c'est le nombre de blocs qui
tiennent dans le gabarit Word, comme le plan d'actions y tient sur dix lignes et le tableau
de rapprochement sur cinq. Personne n'a jamais soutenu qu'un plan d'actions s'arrête à dix
actions.

Le pack se contredit d'ailleurs lui-même : section 4, le message clé au dirigeant demande
« les **3** principaux risques » ; section 5, cinq blocs. Deux nombres dans le même
document — c'est la preuve que le nombre est illustratif.

Plafond retiré (migration 0022). Il reste le plancher (une place commence à 1) et
l'unicité. **Zéro est un résultat légitime** : un client bien tenu n'a pas de constat qui
doit ouvrir son rapport. L'étape 14 ne le compte comme bloquant que si la mission porte au
moins un écart critique ou majeur — sinon la synthèse s'ouvrirait sur rien pendant que le
dirigeant est exposé.

### Deux opérations indivisibles

L'échange de rang et la suppression touchent chacun plusieurs lignes. Écrits en trois
requêtes depuis l'action serveur, une coupure entre deux laissait la base à moitié
modifiée — un rang de synthèse perdu, ou une action effacée alors que son constat existe
toujours — pendant que l'écran annonçait un succès qu'il n'avait pas vérifié.

Ils passent désormais par deux fonctions Postgres (migration 0020), exécutées dans une
seule transaction : `definir_rang_constat` et `supprimer_constat`. Elles sont en
`security invoker`, donc les politiques RLS s'appliquent comme si la consultante écrivait
elle-même. Le message affiché est celui que rend la fonction : il décrit ce qui s'est
réellement passé, pas ce que l'écran espérait.

### Une seule règle de complétude

« Ce constat est-il fini ? » se calculait à quatre endroits : l'étape 11, le tableau des
points, l'action serveur et l'étape 14. La quatrième copie ne testait que la référence :
un constat sans fait ni preuve, mais avec la case cochée, ne bloquait pas la sortie du
rapport et déclenchait « tout est en place » — l'inverse de ce que disait l'étape 11.

La règle vit maintenant dans `src/content/constat.ts` (`cequiManque`), avec la table des
criticités, celle des domaines et les priorités. Les écrans et les actions serveur
l'importent. Ce fichier n'est **pas** un module `use server` : un fichier d'actions
serveur ne peut exporter que des fonctions asynchrones, et y laisser une table de
constantes casse `next build` sans que `tsc` ne dise rien.

**Étape 13 (plan d'actions)** — un bouton génère une action par constat qui n'en a pas
encore, avec l'échéance conseillée : P1 à 7 jours, P2 à 30, P3 à 90, P4 à 180. Le client
coche ensuite ce qu'il a fait et la consultante est notifiée (décision 07).

Si la criticité d'un constat change **après** la génération, l'action garde son ancienne
priorité et le plan promet 180 jours pour un écart devenu critique. L'étape 13 le signale
et propose de réaligner la priorité. Elle ne touche pas à l'échéance : celle-là a pu être
négociée avec le dirigeant en restitution, la réécrire effacerait un engagement pris.

### L'espace client n'est pas ouvert

La case dit **« prêt à montrer au client »**, pas « publié ». C'est un choix de séquence
assumé : l'écran de la consultante d'abord, l'espace client ensuite. Tant qu'il n'existe
pas, écrire « publié » ferait croire à un envoi qui n'a pas lieu.

## La chaîne complète, du point de contrôle au rapport

| Étape | Ce qu'on y décide | Ce que ça alimente |
|---|---|---|
| 6-9 | Point conforme ou en écart | Ouvre un constat pré-rempli |
| **11** | On écrit le constat : fait, preuve, risque encouru, référence, recommandation, criticité, axe | La criticité fixe la priorité de l'action |
| **12** | Le rang 1 à 5 des constats **mis en avant** | L'ouverture de la synthèse dirigeant |
| **13** | **Qui fait quoi, pour quand** : responsable, échéance, statut. Actions libres possibles | Le plan remis au client |
| **14** | Rien — on vérifie l'assemblage et ce qui bloque encore | Le PDF (à construire) |
| 15 | La restitution | La proposition de suivi |

Chaque étape décide quelque chose que la suivante utilise. Aucune ne répète la précédente.

### 12 — classement et mise en avant

**Le rapport contient tous les constats.** C'est un dossier complet : rien ne s'en exclut.
Un constat relevé puis écarté du dossier serait un constat que le dirigeant ne verrait
jamais — exactement ce qu'un audit doit empêcher.

L'étape 12 ne choisit donc pas ce qui entre, seulement ce qui est **mis en avant** : le rang
1 à 5 des constats que le dirigeant lit en premier (« les 5 constats prioritaires » du
modèle 07). Le reste suit, classé par criticité. L'écran signale deux rangs identiques et
les constats dont la référence n'est pas vérifiée.

### 13 — un plan réellement planifiable

Une action générée depuis un constat n'a ni responsable ni date : ce sont les deux choses
qui se négocient en restitution. Elles se saisissent donc ici, avec le statut et un
commentaire. On peut aussi ajouter une action qui ne vient d'aucun constat — une procédure
à écrire, un classement à reprendre : tout ne naît pas d'un écart.

L'en-tête compte ce qui manque : « 8 actions · 3 sans responsable · 2 sans date ».

### 14 — la vérification avant génération

Assemble ce qui a été décidé et liste ce qui bloque : aucun constat retenu, aucun rang
attribué, une référence non vérifiée, une action sans responsable ou sans date. Rien ne se
ressaisit.

## Reste à construire

- Dépôt de pièce côté client et fil d'échange.
- Job d'envoi Resend sur la vue `document_requests_a_relancer`.
