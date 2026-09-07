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
```
Les seeds se régénèrent depuis les xlsx du pack : `python3 scripts/seed_control_points.py <dossier du pack>`.

## Structure
- `src/app/(marketing)/` — vitrine publique (accueil, audit, formation, abonnement, à propos, contact, ressources)
- `src/app/(auth)/` — connexion (phase 4)
- `src/app/app/` — portail client : mission 360°, constats publiés, plan d'actions, pièces, échéances, formation (phase 4)
- `src/app/admin/` — back-office consultante : missions, saisie des constats, rapport (phase 4)
- `src/app/api/` — routes API (leads, webhook Stripe, alertes d'échéances)
- `src/content/` — **contenu structuré issu du pack** : `piliers.ts` (positionnement, 5 piliers, criticité), `offres.ts` (offres, abonnements, calculateur de devis), `methode.ts` (règle d'or, 15 étapes + 7 phases, structure du rapport), `vision.ts` (5 objectifs, ligne de crête, portail consultante / client), `sources.ts` (sources officielles)
- `content/` — leçons et articles en MDX (phase 5)
- `supabase/` — migrations et seeds versionnés
- `design/figma/` — scripts de génération des maquettes
- `docs/` — `VISION_PRODUIT.md` (ce qu'elle veut, 5 objectifs, parcours) · `PACK_V2_MAPPING.md` (pack ↔ Notion ↔ repo ↔ Figma)

## Règles
- Chaque constat suit la chaîne **FAIT → PREUVE → RISQUE → RÉFÉRENCE VÉRIFIÉE → ACTION → DÉLAI** ; la référence officielle datée est obligatoire avant publication au client.
- Les tarifs de `src/content/offres.ts` sont indicatifs tant que `statut !== "valide"`.
- Jamais de promesse de garantie contre un contrôle ou un redressement ; les questions juridiques / fiscales réglementées sont renvoyées à l'avocat ou à l'expert-comptable.
- RLS sur toutes les tables client (`org_id`) ; le rôle `consultant` voit tout.
- Après toute migration, relancer le linter Supabase (`get_advisors`) : les vues doivent être en `security_invoker`, et toute nouvelle fonction `security definer` doit être révoquée à `PUBLIC`.

## Projet Supabase
`anm-consulting` (région eu-west-3, Paris). Migrations 0001 → 0005 appliquées et référentiel chargé : 208 points de contrôle, 33 pièces modèles, 4 modules, 15 étapes, 7 phases.
