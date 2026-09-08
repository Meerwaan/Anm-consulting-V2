# Décisions de la consultante — 8 septembre 2026

Réponses données après présentation du point d'étape. Elles priment sur les hypothèses
de `docs/VISION_PRODUIT.md` quand les deux divergent (les divergences sont signalées ici).

| # | Question | Réponse | Conséquence |
|---|---|---|---|
| 01 | Offre fiscale DGFiP | **Sur devis uniquement** | Offre lancée et affichée, sans montant. `offres.fiscal.statut = "valide"`, `baseHT = null`. Le calculateur de devis doit gérer l'absence de base. |
| 02 | Tarifs sur le site | **La grille complète** | Les 6 fourchettes sont publiques. Toutes les offres passent en `statut: "valide"`. |
| 03 | Organisation de l'écran de travail | **Par étape de la méthode** | Changement structurant — voir ci-dessous. |
| 04 | Notes partagées pendant l'audit | **Rien avant le rapport** | Le partage de notes en cours d'audit est abandonné. |
| 05 | Forme du compte rendu | **Les deux** | Synthèse en 2 axes pour le dirigeant, puis détail classé par criticité. |
| 06 | Relance des pièces manquantes | **Automatique** | Tous les 3 jours par défaut, cadence réglable par mission. |
| 07 | Le client coche ses actions | **Oui** | Avec notification à la consultante. |
| 08 | Son nom sur le site | **Avec son nom et son parcours** | Une page « à propos » personnelle est à écrire — il faut sa bio. |
| 09 | Ton du site | **Direct et terrain** | Les textes de la vitrine sont à réécrire dans ce registre. |

## 03 — L'écran s'organise par étape, pas par module

C'est la décision la plus lourde. Le portail était pensé comme un classeur (4 modules,
comme ses fichiers Excel) ; il devient un **déroulé de mission** : les 15 étapes, du premier
entretien à la réunion de restitution. Les modules ne disparaissent pas — ils restent le
classement des pièces, des constats et du rapport — mais ils cessent d'être la navigation.

Traduit en base par `0006_decisions_maman.sql` :

- `method_steps.kind` (`step_kind`) dit à l'écran **quelle surface afficher** : `entretien`,
  `perimetre`, `collecte`, `analyse`, `echantillon`, `controle`, `rapprochement`,
  `qualification`, `plan_actions`, `rapport`, `restitution`.
- `method_steps.domaines` (`audit_domain[]`) dit **quels points de contrôle** l'étape couvre.
- Vue `mission_step_completeness` : par étape, points totaux / points traités.
- Vue `mission_points_hors_etape` : le filet de sécurité de sa règle « rien ne manque ».

Répartition vérifiée en base (208 points au total) :

| Étape | Domaines | Points |
|---|---|---|
| 4 · Analyse documentaire | gouvernance, sous_traitance | 20 |
| 6 · Contrôle CNAPS | cnaps | 49 |
| 7 · Contrôle social et URSSAF | social, paie, urssaf | 50 |
| 8 · Contrôle du temps de travail | temps | 15 |
| 9 · Inspection du travail / SST | inspection_sst | 40 |
| 10 · Rapprochement planning → paie | operationnel | 10 |
| — | **fiscal** | **24, rattachés à aucune étape** |

### ⚠ Question ouverte : le fiscal n'a pas d'étape

Les 15 étapes ont été écrites avant l'ajout du 5ᵉ pilier. Les 24 points fiscaux ne sont
donc couverts par aucune étape. Ils ne sont pas perdus — `mission_points_hors_etape` les
compte et l'écran doit les afficher — mais **il faut lui demander** si elle veut une 16ᵉ
étape « Contrôle fiscal / DGFiP », et où elle la place (probablement après l'étape 9).
Le rattachement gouvernance + sous_traitance à l'étape 4 est également à lui confirmer.

## 04 — Ce que ça retire

Sa demande initiale disait : « les clients verront les avancées, les notes qu'elle met le
temps que l'audit n'est pas fini ». Elle a tranché l'inverse. Concrètement :

- `mission_notes.visible_to_client` reste en base mais n'est plus exploité côté client ;
- `notification_kind` `note_publiee` et `constat_publie` ne servent plus pendant l'audit ;
- l'espace client pendant l'audit se réduit à : avancement, pièces demandées, fil d'échange.

C'est une simplification : moins d'écrans à construire, et une ligne de crête plus nette
(rien de factuel non qualifié ne sort avant d'être vérifié).

## Ce qu'il reste à lui demander

1. Une 16ᵉ étape pour le fiscal ? (bloque l'écran de travail pour les missions fiscales)
2. Le format de la mission fiscale : combien de jours ?
3. Sa bio pour la page « à propos » : parcours, dates, ce qu'elle veut dire d'elle.
4. Valide-t-elle le rattachement gouvernance + sous-traitance à l'étape 4 ?
