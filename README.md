# ANM Consulting — vitrine & portail de suivi d'audit

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Supabase · Vercel.
Un seul projet, deux applications : la **vitrine** (acquisition) et le **portail** (suivi d'audit 360° pour les clients, admin de saisie pour la consultante, formation).

Pilotage : Notion « ANM Consulting — Pilotage du projet ». Maquettes : Figma (`design/figma/`).
Matière première : le **Pack complet Consultant Sécurité Privée 2026** (fichiers 00 → 21) — voir [`docs/PACK_V2_MAPPING.md`](docs/PACK_V2_MAPPING.md) pour savoir où chaque fichier du pack est repris.

## Démarrer
```bash
npm install
cp .env.example .env.local   # puis remplir les clés Supabase
npm run dev                  # http://localhost:3000
```

## Base de données (Supabase)
```bash
# dans l'ordre, via le SQL editor Supabase ou `supabase db push`
supabase/migrations/0001_leads.sql            # phase 2 : leads
supabase/migrations/0002_portail_mission.sql  # phase 4 : portail (dérivé du 09_Dossier_Mission_Client.xlsx)
supabase/seed/0001_control_points.sql         # 208 points de contrôle (02, 03, 04, 05)
supabase/seed/0002_document_templates.sql     # 33 pièces standard (09 + fiscal)
supabase/migrations/0003_espace_travail_echanges.sql  # espace de travail par module, 15 étapes, notes, échanges, demandes de pièces, notifications, rapport 2 axes
supabase/migrations/0004_durcissement_rls.sql         # vues en security_invoker, fonctions hors API REST
supabase/migrations/0005_revoke_execute_public.sql    # revoke EXECUTE à PUBLIC (le grant par défaut de Postgres)
supabase/migrations/0006_decisions_maman.sql          # décisions du 08/09 : étapes porteuses de périmètre, relances, actions client
supabase/migrations/0007_revoke_actions_client_guard.sql  # revoke EXECUTE (public, anon, authenticated) sur la fonction de trigger
supabase/migrations/0008_auth_invitations.sql         # profils créés avec le compte, invitations, portée des points par mission
supabase/migrations/0009_notes_par_etape.sql          # mission_notes.step_id
supabase/migrations/0010_textes_applicables.sql       # référentiel des codes et textes par domaine (généré)
supabase/migrations/0011_categorie_sous_traitance.sql  # catégorie de pièces manquante
supabase/migrations/0012_validite_pieces_et_rapprochements.sql  # durée de validité des pièces, échéances, contrôles croisés
supabase/migrations/0013_echeances_correctifs.sql     # statut à la création + seuil d'effectif dans le déclencheur
supabase/migrations/0014_un_constat_par_point.sql     # un seul constat par point de contrôle et par mission
supabase/migrations/0015_constats_nettoyage_trame.sql  # retire la trame à trous et dépublie les constats incomplets
supabase/migrations/0016_rang_rapport.sql             # rang 1-5 des constats prioritaires du rapport
supabase/migrations/0017_vues_hors_portee_anonyme.sql  # retire les vues de la surface API anonyme
supabase/migrations/0018_tout_au_rapport.sql          # le rapport contient tous les constats
```
Avant toute PR touchant le portail : `python3 scripts/audit_coherence.py` — vérifie que chaque
champ lu par une action serveur est bien envoyé par un formulaire, et que chaque valeur proposée
dans un menu existe dans l'énumération correspondante. C'est la famille de bugs qui ne se voit ni
au typage ni au lint : l'écriture part avec une valeur invalide et la base la refuse sans un mot.

Les seeds se régénèrent depuis les xlsx du pack : `python3 scripts/seed_control_points.py <dossier du pack>`.

## Structure
- `src/app/(marketing)/` — vitrine publique (accueil, audit, formation, abonnement, à propos, contact, ressources)
- `src/app/(auth)/connexion/` — connexion par lien magique · `src/app/auth/confirm/` et `src/app/auth/deconnexion/` — retour du lien et déconnexion (voir [`docs/AUTHENTIFICATION.md`](docs/AUTHENTIFICATION.md))
- `src/app/app/` — portail client : mission 360°, constats publiés, plan d'actions, pièces, échéances, formation (phase 4)
- `src/app/admin/` — espace de travail de la consultante : liste des missions, puis l'écran d'une mission **organisé par étape de la méthode** (voir [`docs/ECRAN_DE_TRAVAIL.md`](docs/ECRAN_DE_TRAVAIL.md))
- `src/lib/portail/` — accès aux données d'une mission · `src/components/portail/` — rail des étapes, feuille de contrôle, pièces, notes
- `src/app/api/` — routes API (leads, webhook Stripe, alertes d'échéances)
- `src/lib/supabase/` — accès Supabase : `client.ts` (composants client), `server.ts` (Server Components / actions / routes),
  `middleware.ts` (rafraîchissement de session, câblé dans `src/middleware.ts` sur `/app`, `/admin`, `/connexion`), `env.ts` (variables)
- `src/content/` — **contenu structuré issu du pack** : `piliers.ts` (positionnement, 5 piliers, criticité), `offres.ts` (offres, abonnements, calculateur de devis), `methode.ts` (règle d'or, 15 étapes + 7 phases, structure du rapport), `vision.ts` (5 objectifs, ligne de crête, portail consultante / client), `textes.ts` (**les codes et textes qui fondent chaque contrôle**), `sources.ts` (sources officielles)
- `content/` — leçons et articles en MDX (phase 5)
- `supabase/` — migrations et seeds versionnés
- `design/figma/` — scripts de génération des maquettes
- `docs/` — `TEXTES_APPLICABLES.md` (quel code s'applique à quel contrôle) · `AUTHENTIFICATION.md` (lien magique, invitations, mise en service) · `ECRAN_DE_TRAVAIL.md` · `DECISIONS_MAMAN.md` (**les 9 arbitrages du 08/09, ils priment**) · `VISION_PRODUIT.md` (5 objectifs, parcours) · `PACK_V2_MAPPING.md` (pack ↔ Notion ↔ repo ↔ Figma) · `RGPD.md`

## Règles
- Chaque constat suit la chaîne **FAIT → PREUVE → RISQUE → RÉFÉRENCE VÉRIFIÉE → ACTION → DÉLAI** ; la référence officielle datée est obligatoire avant publication au client. Le texte applicable par domaine est dans `src/content/textes.ts` — il dit où chercher, pas ce que l'article prescrit.
- Les tarifs de `src/content/offres.ts` sont indicatifs tant que `statut !== "valide"`.
- Jamais de promesse de garantie contre un contrôle ou un redressement ; les questions juridiques / fiscales réglementées sont renvoyées à l'avocat ou à l'expert-comptable.
- RLS sur toutes les tables client (`org_id`) ; le rôle `consultant` voit tout.
- Après toute migration, relancer le linter Supabase (`get_advisors`) : les vues doivent être en `security_invoker`, et toute nouvelle fonction `security definer` doit être révoquée à `PUBLIC`.

## Projet Supabase
`anm-consulting` (région eu-west-3, Paris). Migrations 0001 → 0005 appliquées et référentiel chargé : 208 points de contrôle, 33 pièces modèles, 4 modules, 15 étapes, 7 phases.
