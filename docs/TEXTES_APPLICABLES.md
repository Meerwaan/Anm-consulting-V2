# Les textes qui fondent chaque contrôle

Source unique : `src/content/textes.ts`. La table Supabase `legal_texts` en est générée
(`node --experimental-strip-types scripts/gen_textes_sql.mjs`). Vérifié sur Légifrance le
**8 septembre 2026**.

## Ce que ce référentiel dit, et ce qu'il ne dit pas

Il dit **quel texte s'applique à quel domaine de contrôle**. Il ne dit jamais ce qu'un
article prescrit, et il ne remplace pas la vérification : la numérotation bouge (le code
de déontologie allait jusqu'à R631-32 en 2020, il va jusqu'à R631-33 aujourd'hui). La règle
du pack tient : **référence vérifiée et datée avant publication d'un constat au client**.

C'est aussi la ligne de crête. Citer le texte applicable relève du travail d'audit ;
dire ce qu'il implique juridiquement pour un dossier donné relève de l'avocat ou de
l'expert-comptable.

## Le rattachement

| Domaine de contrôle | Textes principaux | Complémentaires |
|---|---|---|
| **CNAPS** | CSI Livre VI · Code de déontologie · Référentiels CNAPS | Décret Dracar Ultimate · Travail dissimulé |
| **Social** | Code du travail · CCN 1351 | Code de la sécurité sociale |
| **Paie** | Code du travail · CCN 1351 · CSS · BOSS | — |
| **Temps de travail** | Code du travail · CCN 1351 | Travail dissimulé |
| **URSSAF** | CSS · Procédure de contrôle (R243-59 s.) · BOSS · Travail dissimulé | Code du travail |
| **Inspection / SST** | Code du travail · DUERP (L4121-3, R4121-1 s.) | CSS (AT/MP) |
| **Sous-traitance** | Obligation de vigilance (L8222-1 s.) · Travail dissimulé · CSI Livre VI | Code de commerce |
| **Fiscal / DGFiP** | LPF garanties (L47 s.) · LPF FEC (L47 A) · CGI · BOFiP | Code de commerce |
| **Gouvernance** | CSI Livre VI · Code de commerce | RGPD |
| **Opérationnel** | RGPD | CSI Livre VI · Code du travail |

Deux textes servent de charnière entre les administrations, et c'est ce qui fait la valeur
d'un audit croisé : le **travail dissimulé** (Code du travail, art. L8221-1 s.) est le
terrain commun de l'URSSAF, du CNAPS et de l'inspection ; l'**obligation de vigilance**
(art. L8222-1 s.) expose le donneur d'ordre à la solidarité financière pour les dettes de
son sous-traitant.

## L'état des références point par point

Le champ `reference` du pack mélangeait de vraies sources et des restes de colonnes Excel.
Chaque point porte désormais un `reference_kind` :

| | Points | Ce que ça veut dire |
|---|---|---|
| `source` | 96 | Le pack cite une source exploitable. |
| `interne` | 24 | Point d'organisation interne, sans texte opposable — normal, ne pas chercher. |
| `a_qualifier` | 88 | **Rien dans le pack.** 24 CNAPS, 24 fiscal, 20 inspection, 20 URSSAF. |

Les 88 points `a_qualifier` s'affichent dans l'écran de travail avec « Référence à établir
avant publication ». Ils restent auditables — ils ne sont simplement pas encore rattachés à
un texte précis. C'est un chantier à mener domaine par domaine, pas une urgence : le
référentiel de textes ci-dessus donne déjà, pour chacun, le code où chercher.

## Faire évoluer le référentiel

1. Modifier `src/content/textes.ts`.
2. `node --experimental-strip-types scripts/gen_textes_sql.mjs`
3. Appliquer la migration régénérée.

Ne jamais éditer `supabase/migrations/0010_textes_applicables.sql` à la main : il est généré.
