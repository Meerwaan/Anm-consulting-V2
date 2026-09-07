# Cartographie — Pack complet V2 ↔ Notion ↔ repo ↔ Figma

Mis à jour le 07/09/2026. Référence unique : le dossier `Pack_Complet_Consultant_Securite_Privee_2026/` (fichiers numérotés 00 → 21). Les fichiers V1 non numérotés sont des doublons à archiver (voir §3).

## 1. Où vit chaque élément du pack

| N° | Fichier du pack | Rôle métier | Notion | Repo | Figma |
|---|---|---|---|---|---|
| 00 | `00_SOMMAIRE.txt` | Positionnement (6 mots-clés, 5 piliers) | Hub › Résumé | `src/content/piliers.ts` › `POSITIONNEMENT` | Accueil (hero) |
| 01 | `01_Bible_Consultant_V2_Controle_Fiscal_2026.docx` | 44 fiches pratiques (blocs A→G), criticité, formule de constat, sources | Modules › colonne « Outil source » | `piliers.ts` (CRITICITE), `methode.ts` (REGLE_OR, FORMULE_CONSTAT), `sources.ts` | Design system › fiche de constat |
| 02 | `02_Mallette_Audit_360.xlsx` | 120 points (8 domaines), échantillon, croisement heures, plan d'actions | Inventaire §1 · Modules SOC-04 | `supabase/seed/0001_control_points.sql` (A360-001…120) | Portail admin › saisie constat |
| 03 | `03_Module_Audit_CNAPS.xlsx` | 24 tests CNAPS, titres, Dracar, contrats, sous-traitance, visite | Inventaire §2 · Modules CNA-01…06 | seed `CNA-001…024` · `deadlines` (carte_pro) | Portail › échéances |
| 04 | `04_Module_URSSAF_Inspection.xlsx` | 20 tests URSSAF + 20 tests Inspection, score risque, bulletins, temps | Inventaire §3 · Modules SOC-URS, TPS, SST | seed `URS-001…020`, `INS-001…020` | — |
| 05 | `05_Module_Controle_Fiscal.xlsx` | 24 points DGFiP : procédure, FEC, CA, TVA, charges, sous-traitance | Modules FIS-01…04 (nouveau parcours « Fiscal / DGFiP ») | seed `FIS-001…024` · `document_templates` catégorie `fiscal` · offre `fiscal` | À créer |
| 06 | `06_Procedure_Mission_Audit_360.docx` | Déroulé 7 phases (J-10 → J+7), pièces, échantillonnage, restitution | Architecture › mission_phases · Modules SOC-01/02/03/05 | `mission_phases` (seed inline dans 0002) · `methode.ts` › `PHASES_MISSION` | Portail client › avancement |
| 07 | `07_Modele_Rapport_Diagnostic_360.docx` | Rapport 10 sections | Architecture › génération PDF | `methode.ts` › `SECTIONS_RAPPORT` | Portail admin › rapport |
| 08 | `08_Pack_Client_Dossier_Mission.docx` | 10 modèles (email, formulaire 20 champs, pièces, bordereau, entretien, visite, constat, restitution, clôture, classement) | Pack commercial › Questionnaire prospect · Inventaire | `interviews`, `site_visits`, `mission_documents` (0002) | Portail › pièces |
| 09 | `09_Dossier_Mission_Client.xlsx` | **Modèle de données du portail** (8 feuilles) | Architecture › modèle de données | `supabase/migrations/0002_portail_mission.sql` · `seed/0002_document_templates.sql` · vue `mission_dashboard` | Portail client › mission 360° |
| 10 | `10_Pack_Commercial_Contractuel.docx` | Offre, questionnaire, proposition, lettre de mission (11 art.), script, objections, RDV, facturation | Pack commercial (11 livrables, statut Brouillon) | `src/content/offres.ts` › `OFFRES` | Vitrine › Audit / Abonnement |
| 11 | `11_Pilotage_Commercial_Tarifs.xlsx` | Tarifs, calculateur, prospection, pipeline, 4 abonnements | Pack commercial › Grille tarifaire, Abonnement | `offres.ts` › `ABONNEMENTS`, `chiffrer()` · `subscriptions` (0002) | Vitrine › Abonnement |
| 12 | `12_Programme_Entrainement_30_Jours.docx` | 4 semaines, 9 compétences | Backlog › Contenu formation (piste : former d'autres consultants) | — (phase 5) | — |
| 13-20 | Cas pratiques 01→04 + corrigés | Matière pédagogique (Audit 360, URSSAF, CNAPS, Inspection) | Modules (quiz / ateliers, phase 5) | `content/lecons/` (phase 5) | — |
| 21 | Site web V2 (HTML statique, dans `fwd`) | Brief de contenu vitrine : Accueil / Prestations (5) / Méthode en 4 temps / À propos / Ressources / Contact | Inventaire | `methode.ts` › `METHODE_4_TEMPS` · pages `(marketing)/*` | Vitrine › Accueil (fait) |
| — | `Fiche_Globale_Consultant_1_Page.docx` (V1, pas d'équivalent V2) | Pitch 1 page : 4 piliers + fiscal, cibles, valeur ajoutée | Pack commercial › Argumentaire | `piliers.ts` › `POSITIONNEMENT.cibles / valeurAjoutee` | Accueil › sections |
| — | `Manuel_Terrain_Consultant_2026.docx` (V1) | 12 fiches avec « formulation de constat recommandée » — précurseur de la Bible | Inventaire (base des modules) | — | — |

## 2. Diff V1 → V2 (vérifié fichier par fichier le 07/09)

- **Seul le 01 change** : `01_Bible_V2` = `Bible_V1` + bloc G « Contrôles fiscaux & DGFiP » (fiches 37 à 44) + annexe fiscale sécurité privée. Le titre interne dit encore « Version 1 » (coquille à corriger dans le docx).
- **Nouveau sans V1** : `05_Module_Controle_Fiscal.xlsx`, `07_Modele_Rapport`, `02_Mallette` (V1 absente du projet mais décrite dans Notion), `04_Module_URSSAF` (idem), `00_SOMMAIRE`.
- **Identiques bit à bit** : 03, 09, 11 (xlsx, md5 identiques). **Identiques en contenu** : 06, 08, 10, 12, 13→20.
- **V1 sans équivalent V2** : Fiche globale 1 page, Manuel terrain (à garder comme sources, pas comme doublons).

## 3. Incohérences à traiter (le 5ᵉ pilier n'est pas propagé)

Le pilier DGFiP / Fiscal existe dans 00, 01 (bloc G), 05 et la Fiche globale, mais **pas** dans :

| Fichier | Manque | Décision prise dans le repo |
|---|---|---|
| 09 `CONSTATS` › Domaine | pas de valeur « Fiscal » | enum `audit_domain` inclut `fiscal` |
| 09 `SUIVI_DOCUMENTS` | aucune pièce fiscale | 6 pièces `fiscal` ajoutées au seed (FEC, balances, liasses/TVA, journaux, factures, frais) |
| 10 §2 offre / 11 `TARIFS` | pas d'offre ni de tarif « Préparation contrôle fiscal » | offre `fiscal` créée avec `baseHT: null`, statut `a_valider` |
| 07 section 6 | 6 domaines, pas de fiscal | `DOMAINES_RAPPORT` liste « Fiscal (à intégrer au modèle 07) » |
| 08 formulaire / 06 pièces / 12 programme | pas de volet fiscal, pas de cas pratique n°5 | à faire côté pack (Maman) — tâche Backlog |
| Sous-titres de 06, 07, 08, 10, 12, 13-20 | 5 mots-clés sans « DGFiP / Fiscal » | à aligner sur 00_SOMMAIRE |

Autre point à réconcilier : Notion Architecture et le script Figma `30_portail_client_mission360.js` parlent de **15 étapes** de mission ; le pack ne définit que **7 phases** (06 §2). La table `mission_phases` suit le pack.

## 4. Régénérer les seeds

```bash
pip install openpyxl
python3 scripts/seed_control_points.py ~/Downloads/fwd/Pack_Complet_Consultant_Securite_Privee_2026
```
