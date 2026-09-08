# RGPD — registre, obligations et points ouverts

Sources vérifiées le 08/09/2026 : `service-public.gouv.fr` (fiche F31228), `cnil.fr`, `vercel.com/legal`.
Le contenu affiché sur le site est généré depuis `src/content/legal.ts` — modifier ce fichier, pas les pages.

## 1. Ce qui bloque la mise en ligne

Les mentions légales sont obligatoires et leur absence est pénalement sanctionnée (jusqu'à 1 an
d'emprisonnement et 75 000 € d'amende, art. 6-III LCEN). Or elles exigent des informations qui
**n'existent pas encore** : dénomination, forme juridique, capital, siège, RCS, SIREN, TVA.

Tant que la société n'est pas immatriculée (Backlog phase 1), ces champs valent `À COMPLÉTER`
dans `src/content/legal.ts`. **Ne pas mettre le site en production avant de les avoir remplis.**

Une fois la déclaration d'activité de formation déposée (NDA), renseigner
`ACTIVITE_REGLEMENTEE.numeroDeclarationActivite` : le numéro doit figurer dans les mentions légales
**et** sur chaque convention de formation, avec la phrase « cet enregistrement ne vaut pas agrément
de l'État ».

## 2. Le point le plus important : ANM est sous-traitant

Pendant une mission, le client transmet des pièces qui contiennent des données personnelles de
**ses** salariés : cartes professionnelles, plannings, bulletins de paie, DPAE, suivi de santé,
accidents du travail. Certaines relèvent de catégories sensibles (santé).

Conséquence juridique : sur ces données, le **client reste responsable de traitement** et
**ANM Consulting est sous-traitant** au sens de l'article 28 du RGPD. Cela impose un **contrat écrit**
précisant l'objet, la durée, la nature et la finalité du traitement, les catégories de données, les
obligations du sous-traitant, et le sort des données en fin de mission.

**Ce contrat n'existe pas encore.** Le plus simple est un article dédié dans la lettre de mission
(10_Pack_Commercial §5) plutôt qu'un document séparé. À faire relire par l'avocat en même temps que
la lettre de mission et les CGV.

Points à y traiter :

- restitution ou suppression des pièces en fin de mission, au choix du client ;
- interdiction de recourir à un sous-traitant ultérieur sans autorisation ;
- obligation d'assistance en cas de demande d'exercice de droits d'un salarié du client ;
- notification au client en cas de violation de données.

## 3. Registre des traitements

Le registre est tenu dans `src/content/legal.ts` (constante `TRAITEMENTS`) et affiché sur la page
de confidentialité. Quatre traitements : prospects, comptes du portail, dossiers de mission,
suivi de formation.

Attention à deux durées de conservation :

- **Dossiers de mission** — archivage 5 ans à des fins de preuve, mais suppression ou restitution
  sur demande du client, puisqu'il en est responsable de traitement.
- **Suivi de formation** — la réglementation de la formation professionnelle impose une conservation
  longue des preuves de suivi (inscriptions, tentatives de quiz, connexions). Ne pas purger ces
  tables sans vérifier la durée applicable au moment de la purge.

## 4. Cookies : pas de bandeau, et c'est volontaire

Le site ne dépose aucun traceur publicitaire, aucun bouton social, aucun analytics tiers. Le seul
cookie est celui de session du portail, **exempté de consentement** en tant que mécanisme
d'authentification (doctrine CNIL).

Un bandeau n'est donc pas requis — et en poser un serait trompeur, puisque le visiteur ne pourrait
pas refuser sans perdre l'accès à son dossier.

**Ce qui ferait basculer l'obligation** : ajouter Google Analytics, un pixel publicitaire, un
widget social, ou tout outil de mesure d'audience qui ne remplit pas les conditions d'exemption
CNIL. Dans ce cas : consentement préalable, refus aussi simple que l'acceptation, et mise à jour de
`COOKIES` dans `legal.ts` **avant** activation de l'outil.

Si un outil de mesure d'audience devient nécessaire, privilégier une solution configurable pour
entrer dans l'exemption (pas de croisement, pas de suivi inter-sites, durée de vie limitée), ce qui
évite le bandeau.

## 5. Ce qui reste à faire

| Sujet | Qui | Quand |
|---|---|---|
| Remplir les `À COMPLÉTER` de `legal.ts` | Merwan, après immatriculation | Bloque la mise en ligne |
| Article sous-traitance RGPD dans la lettre de mission | Avocat | Avant la 1ʳᵉ mission |
| CGV audit + CGV formation | Avocat | Avant la 1ʳᵉ vente |
| Numéro de déclaration d'activité | Maman, après NDA | Avant la 1ʳᵉ formation vendue |
| Vérifier l'adresse de l'hébergeur | Merwan | À chaque refonte |

## 6. Limite de ce document

Ce document et les pages qu'il décrit ont été rédigés à partir des textes publics et de la doctrine
CNIL. Ils couvrent la structure et les obligations courantes, mais **ne remplacent pas une relecture
par un avocat** — en particulier sur l'article de sous-traitance, les CGV et les clauses de
responsabilité, qui engagent directement l'entreprise.
