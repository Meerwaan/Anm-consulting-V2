# ANM Consulting — site & plateforme de formation

Next.js 15 (App Router) · TypeScript · Tailwind v4 · Supabase · Vercel.
Pilotage du projet : Notion « ANM Consulting — Pilotage du projet ».

## Démarrer
```bash
npm install
cp .env.example .env.local   # puis remplir les clés Supabase
npm run dev                  # http://localhost:3000
```

## Structure
- `src/app/(marketing)/` — site vitrine public (accueil, audit, formation, abonnement, à propos, contact, ressources)
- `src/app/(auth)/` — connexion / inscription (phase 4)
- `src/app/app/` — espace apprenant protégé (phase 4)
- `src/app/admin/` — back-office (phase 4)
- `src/app/api/` — routes API (leads, webhook Stripe)
- `content/` — leçons et articles en MDX
- `supabase/migrations/` — schéma SQL versionné

## Règle
Chaque contenu publié cite ses sources officielles datées :
FAIT → PREUVE → RISQUE → RECOMMANDATION → RÉFÉRENCE.
