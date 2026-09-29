# Authentification — adresse email et mot de passe

Mis à jour le 29/09/2026, d'après le code.

Depuis le 21/09/2026, la connexion se fait avec **une adresse email et un mot de passe**.
Le lien magique (décision du 08/09) a été retiré : sans domaine d'envoi, le serveur d'email
de Supabase ne délivre qu'aux membres de l'équipe du projet, et sur iPad un lien ouvert depuis
l'app Gmail s'ouvre dans son navigateur intégré, pas dans Safari (la session n'arrive donc pas
dans Safari). Le mot de passe, retenu par le trousseau iCloud et rempli par Face ID, ne dépend
d'aucun email.

**Aucun email n'est envoyé par l'authentification.** Les comptes se créent et se réinitialisent
depuis la machine de Merwan, avec `scripts/compte.mjs`.

## Le parcours

```text
/connexion ──(server action seConnecter)──► supabase.auth.signInWithPassword
                                                     │
                                     lecture de profiles.role
                                                     │
                                  consultant ──► /admin     autre ──► /app
```

| Fichier | Rôle |
| --- | --- |
| `src/app/(auth)/connexion/page.tsx` | Page de connexion. Une session déjà ouverte est renvoyée vers l'accueil de son rôle. Affiche aussi le retour d'un lien qui n'a pas abouti (voir plus bas). |
| `src/app/(auth)/connexion/formulaire.tsx` | Champs `autoComplete="username"` / `"current-password"` (trousseau iCloud), cibles de 48 px. |
| `src/app/(auth)/connexion/actions.ts` | `seConnecter` : contrôle de l'adresse, `signInWithPassword`, puis redirection selon le rôle. |
| `src/app/admin/compte/` | « Mon compte » : changement du mot de passe. |
| `src/app/auth/deconnexion/route.ts` | Déconnexion, en **POST uniquement** (un lien ne doit pas pouvoir déconnecter). Renvoie vers `/connexion`. |
| `src/app/auth/confirm/route.ts` | Ancien retour du lien magique, conservé (voir plus bas). |

### Messages d'échec de la connexion

- Identifiants refusés : toujours « Adresse ou mot de passe incorrect. », que l'adresse existe
  ou non. Un message différent permettrait de savoir quels comptes existent.
- Compte non confirmé (`email_not_confirmed`) : Supabase ne le signale qu'une fois le mot de
  passe reconnu, on peut donc le dire. Correction : `scripts/compte.mjs confirmer`.
- Trop de tentatives (HTTP 429) et panne du service (5xx) ont chacune leur message.
- Tout refus autre que `invalid_credentials` est tracé dans les journaux du serveur
  (`[connexion] refus`, `[connexion] échec serveur`).

### Changer son mot de passe (« Mon compte »)

`changerMotDePasse` (`src/app/admin/compte/actions.ts`) :

- 10 caractères au minimum, saisis deux fois, différents de l'actuel ;
- **le mot de passe actuel est revérifié** avant le changement : une session laissée ouverte
  sur l'iPad ne suffit pas à prendre le compte ;
- un mot de passe refusé par Supabase comme faible ou présent dans des listes de fuites
  reçoit un message dédié.

Réservé au rôle `consultant` à ce jour.

### `/auth/confirm` (liens reçus par email)

La route accepte encore un lien Supabase sous ses deux formes (`?token_hash=…&type=…` ou
`?code=…`, flux PKCE). Rien dans l'application n'en envoie aujourd'hui ; elle sert aux anciens
emails de connexion encore dans une boîte, et restera utile si des liens sont réintroduits
(invitation d'un client, par exemple).

En cas d'échec, la cause technique est tracée (`[auth/confirm] échec`) mais jamais montrée ;
la route renvoie vers `/connexion?erreur=expire` (lien expiré) ou `/connexion?erreur=lien`
(lien invalide ou déjà utilisé). La page de connexion affiche alors « Ce lien a expiré. » ou
« Ce lien n'est pas valide, ou il a déjà servi. », suivi de la marche à suivre : se connecter
avec l'adresse et le mot de passe.

## Créer, réinitialiser, confirmer un compte : `scripts/compte.mjs`

À lancer depuis la racine du projet, avec les variables de `.env.local`
(`NEXT_PUBLIC_SUPABASE_URL` et `SUPABASE_SERVICE_ROLE_KEY`). La clé `service_role` ne quitte
jamais cette machine : elle n'est ni dans le dépôt, ni dans le navigateur.

```bash
node --env-file=.env.local scripts/compte.mjs creer <email> "<Prénom Nom>"
node --env-file=.env.local scripts/compte.mjs reinitialiser <email>
node --env-file=.env.local scripts/compte.mjs confirmer <email>
```

| Commande | Effet |
| --- | --- |
| `creer` | Pose une invitation `consultant` (avec le nom complet, obligatoire : il figure dans l'en-tête et sur le rapport), puis crée le compte **déjà confirmé** avec un mot de passe provisoire. Refuse si un compte existe déjà pour l'adresse. |
| `reinitialiser` | Remplace le mot de passe par un nouveau mot de passe provisoire, et confirme l'adresse au passage. |
| `confirmer` | Confirme un compte créé à la main dans le tableau de bord Supabase sans « Auto Confirm User » : sans confirmation, Supabase refuse toute connexion, même avec le bon mot de passe. Le mot de passe ne change pas. |

Le mot de passe provisoire (trois groupes de quatre caractères, sans caractères ambigus comme
0/O ou 1/l) **s'affiche une seule fois** dans le terminal. Il se transmet de vive voix ou par un
canal sûr, puis la personne le change dans « Mon compte ».

« Mot de passe oublié » : il n'y a pas de réinitialisation par email. La page de connexion
renvoie vers Merwan, qui lance `reinitialiser`.

`creer` ne sait créer que des comptes `consultant`. Les comptes clients ne sont pas encore
ouverts (voir « L'espace client » plus bas).

## Profils et rôles

Rôles (`public.user_role`) : `consultant`, `client`, `learner` (ce dernier n'est utilisé
nulle part pour l'instant).

`profiles.id` référence `auth.users`. **Sans ligne de profil, `current_role()` et
`current_org()` renvoient NULL et la RLS ne laisse rien passer** : l'utilisateur connecté voit
une application vide, sans message d'erreur. Le déclencheur `on_auth_user_created`
(fonction `handle_new_user`, migration 0008) crée donc le profil en même temps que le compte.

Le rôle et l'organisation viennent d'une **invitation** (`public.invitations`) :

- la ligne dont l'adresse correspond (sans tenir compte de la casse) est consommée à la
  création du compte et marquée `accepted_at` ; elle donne `role`, `org_id` et `full_name` ;
- sans invitation, le profil naît `client` **sans organisation** : la personne ne voit
  strictement rien. Le défaut est inutile plutôt que risqué.

Après connexion, `accueilDuRole` envoie le `consultant` vers `/admin`, tout autre rôle vers
`/app`.

## Où le contrôle se fait

| Couche | Rôle |
| --- | --- |
| `src/middleware.ts` | Rafraîchit la session (`auth.getUser()`, qui revalide le jeton et fait tourner le refresh token) et renvoie vers `/connexion` tout visiteur anonyme de `/app` et `/admin`. **Pas de contrôle de rôle ici** : il coûterait une requête en base à chaque navigation. Il ajoute `?suite=<chemin demandé>`, que la page de connexion n'exploite pas encore. |
| `src/app/admin/layout.tsx` | `exigerRole("consultant")` : la garde de rôle de tout `/admin`. Les server actions de l'outil rappellent `exigerRole("consultant")` elles-mêmes. |
| `src/app/app/page.tsx` | `exigerRole("client")`. |
| RLS Postgres | La seule barrière qui compte. Même une faille d'interface ne donne accès à rien. |

`exigerRole` (`src/lib/supabase/session.ts`) : sans session, retour à `/connexion` ; avec un
autre rôle, retour à l'accueil de ce rôle.

### RLS

- Deux fonctions `security definer` lisent le profil de l'utilisateur courant :
  `public.current_role()` et `public.current_org()` (migration 0002).
- Tables de travail de la consultante (grilles, sous-traitance, non-conformités, textes du
  rapport, contrats, factures, devis…) : une seule politique « `_consultant` » `for all`,
  `using` et `with check` sur `current_role() = 'consultant'`. Le rôle `anon` n'a aucun droit.
- Tables partagées avec le client (missions, pièces, messages) : le client ne voit que les
  lignes de sa société (`org_id = current_org()`), et les politiques d'écriture ont un
  `with check` pour qu'une ligne ne puisse pas être déplacée vers une autre société.
- Référentiels : lecture par tout compte connecté, écriture par la consultante.
- Stockage : les fichiers des pièces et les rapports émis sont dans le bucket privé `pieces`,
  réservé à la consultante (politiques de `storage.objects`, migration 0028) et servi par des
  routes de l'application.

## L'espace client

Aucun compte client n'existe à ce jour et `scripts/compte.mjs` n'en crée pas. L'ouverture de
l'espace client est en préparation (migration `0045_espace_client.sql`, **pas encore appliquée**
au 29/09/2026). Sa relecture des politiques a relevé des points à corriger **avant** de créer le
moindre compte client, dont un critique : aujourd'hui un compte connecté peut modifier son
propre `profiles.role`. Tant que 0045 n'est pas appliquée, ne créer aucun compte autre que
`consultant`, et garder l'inscription publique fermée (Supabase → Authentication → Sign In /
Providers → désactiver « Allow new users to sign up ») : les comptes se créent par le script.

Ce document sera à compléter quand l'invitation des clients sera en place.

## Diagnostiquer un échec de connexion

1. Le message affiché dit déjà l'essentiel (voir « Messages d'échec »).
2. Journaux du serveur Next : `[connexion] refus` donne le code d'erreur Supabase.
3. Dans Supabase → SQL Editor :

```sql
select email, email_confirmed_at, last_sign_in_at
from auth.users
order by created_at;
```

- `email_confirmed_at` vide → `scripts/compte.mjs confirmer <email>`.
- Mot de passe perdu → `scripts/compte.mjs reinitialiser <email>`.
- Connexion réussie mais écran vide → vérifier la ligne `profiles` (rôle, organisation).
