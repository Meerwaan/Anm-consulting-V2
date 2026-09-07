# Vision produit — ANM Consulting (cadrage du 07/09/2026)

Formulée par Merwan d'après la demande de Maman. C'est la référence pour arbitrer ce qu'on construit, dans quel ordre.

## Ce qu'elle veut

**Une vitrine** pour vendre ses compétences et sa capacité d'audit. Elle ne remplace ni le comptable ni l'avocat : elle est la **courroie de transmission** sur les dossiers complexes en contrôle administratif, pour que l'entreprise soit préparée au mieux.

**Un portail pour elle** : un dossier / espace de travail par client, rangé par module (Mallette 360, CNAPS, URSSAF-Inspection, Fiscal), avec les feuilles Excel remplies et les pièces fournies par le client. Rien ne doit manquer. C'est là qu'elle passera le plus de temps.

**Un accès pour les clients** : ils voient l'avancement et les notes qu'elle partage tant que l'audit n'est pas fini ; un espace pour communiquer, échanger et demander / déposer les fichiers manquants, avec notification email pour ne pas attendre. À la fin, un **compte rendu adapté à l'audit** avec les axes d'amélioration et les axes qui montrent un vrai risque en cas de contrôle.

## Les 5 objectifs (dans cet ordre)

1. **Prévenir les risques.**
2. **Créer une organisation.**
3. **Donner des conseils qu'un avocat ou un comptable ne peut pas donner** — ligne de crête, code de déontologie.
4. **Préparer un contrôle pour faciliter le travail des avocats et des comptables.**
5. **Mettre en avant une organisation qui soulage le brouillon administratif** et libère le temps des patrons pour le cœur de métier.

→ `src/content/vision.ts` (OBJECTIFS, LIGNE_DE_CRETE, PORTAIL_CONSULTANTE, PORTAIL_CLIENT, AXES_RAPPORT).

## Comment le repo la traduit

| Besoin | Implémentation |
|---|---|
| Un dossier par client, rangé par module | `missions` + `audit_modules` (4 classeurs du pack) + `mission_modules` ; chaque pièce, note, constat porte un `module_id` |
| Rien ne manque | vue `mission_module_completeness` : points traités / total, pièces reçues / attendues, demandes ouvertes, par module |
| Feuilles Excel remplies | `mission_control_results` (la feuille AUDIT_* point par point) ; feuilles annexes déposées comme `mission_documents.kind = 'feuille_travail'` |
| Sa méthode | `method_steps` (15 étapes de la note de cadrage) + `mission_phases` (7 phases J-10 → J+7 du 06) |
| Notes visibles par le client pendant l'audit | `mission_notes.visible_to_client` (factuel uniquement) ; `findings.visible_to_client` pour les constats validés |
| Communiquer / demander des fichiers | `mission_messages`, `document_requests` (ouverte → relancée → reçue), dépôt direct par le client dans `mission_documents` |
| Notifier par mail | `notifications` (créées par trigger à chaque demande / message ; job Resend à écrire → `email_sent_at`) |
| Compte rendu final en deux axes | `findings.nature` = `risque_controle` / `amelioration` ; `reports` (PDF structure 07, publié ou non) |
| Ligne de crête | RLS : le client ne voit jamais la feuille de travail brute ni les notes non publiées ; chaque constat cite une référence officielle datée |

## Parcours

**Consultante** : crée la mission (les modules, les 15 étapes, les 7 phases et la checklist de pièces s'initialisent seuls) → demande les pièces manquantes (le client est notifié) → travaille module par module : coche les points, dépose ses feuilles, écrit ses notes → transforme les points sensibles en constats qualifiés (fait / preuve / risque / référence / recommandation, nature risque ou amélioration) → publie ce qu'elle veut montrer → génère le rapport → restitution → propose le suivi conformité.

**Client** : reçoit son accès → dépose les pièces demandées → suit l'avancement, lit les notes partagées, échange → reçoit le rapport et le plan d'actions → met à jour le statut de ses actions → passe éventuellement en abonnement (échéances, revues).

## Ce que ça change dans l'ordre de construction (phase 4)

1. Admin : créer une mission, écran module (points + pièces + notes), demande de pièce.
2. Client : dépôt de pièces, fil d'échange, avancement + notes partagées.
3. Emails Resend sur `notifications`.
4. Constats + rapport PDF en deux axes.
5. Plan d'actions côté client, puis abonnement / échéances.
