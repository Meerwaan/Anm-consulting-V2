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

## Reste à construire

- Transformer un point en écart directement en constat qualifié (fait / preuve / risque /
  référence pré-remplis depuis le référentiel) — le prochain gain de temps important.
- Dépôt de pièce côté client et fil d'échange.
- Job d'envoi Resend sur la vue `document_requests_a_relancer`.
