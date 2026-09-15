# Authentification — lien magique

Décision de la consultante du 08/09/2026 : pas de mot de passe. On saisit une adresse,
on reçoit un lien, on est connecté. C'est aussi le mécanisme qui servira à inviter
chaque client dans son dossier.

## Le parcours

```
/connexion  ──(server action)──►  supabase.auth.signInWithOtp
                                          │
                                    email au client
                                          │
                                          ▼
                            /auth/confirm?token_hash=…&type=email
                                    ou ?code=…
                                          │
                              verifyOtp / exchangeCodeForSession
                                          │
                          consultant ──► /admin      client ──► /app
```

`src/app/auth/confirm/route.ts` accepte **les deux formes** : `token_hash` (gabarit
`{{ .TokenHash }}`, la forme recommandée côté serveur) et `code` (gabarit par défaut avec
PKCE, qui exige d'ouvrir le lien dans le navigateur qui l'a demandé). La connexion marche
donc que le gabarit d'email ait été personnalisé ou non.

## Profils et rôles

`profiles.id` référence `auth.users`. **Sans ligne de profil, `current_role()` et
`current_org()` renvoient NULL et la RLS ne laisse rien passer** : l'utilisateur connecté
voit une application vide, sans message d'erreur. Le trigger `on_auth_user_created`
(migration 0008) crée donc le profil en même temps que le compte.

Le rôle et l'organisation viennent d'une **invitation** :

- une ligne dans `public.invitations` (email, rôle, organisation) est consommée à la
  première connexion et marquée `accepted_at` ;
- sans invitation, le profil naît `client` **sans organisation** : la personne ne voit
  strictement rien. Le défaut est inutile plutôt que risqué.

C'est pourquoi la page de connexion répond la même chose que l'adresse soit connue ou non :
un message différent permettrait d'énumérer les comptes.

## Mise en service — à faire une fois

### 1. Dans Supabase → Authentication → URL Configuration

Ajouter aux **Redirect URLs** :

```
https://anm-consulting.vercel.app/auth/confirm
http://localhost:3000/auth/confirm
```

Sans ça le lien magique renverra sur la page d'accueil et la connexion échouera.
Le jour du nom de domaine, ajouter aussi `https://anm-consulting.fr/auth/confirm`.

### 2. Créer l'accès de la consultante

Dans Supabase → SQL Editor, **avant sa première connexion** :

```sql
insert into public.invitations (email, role, full_name)
values ('adresse.de.maman@exemple.fr', 'consultant', 'Prénom Nom');
```

Puis elle va sur `/connexion`, saisit cette adresse, clique le lien reçu : son compte est
créé avec le rôle `consultant`.

### 3. Inviter un client sur une mission

```sql
insert into public.invitations (email, role, org_id, full_name)
values ('dirigeant@societe.fr', 'client',
        (select id from public.organizations where name = 'SECURIS 93'),
        'Prénom Nom');
```

### 4. OBLIGATOIRE en pratique — gabarit d'email

Supabase → Authentication → Email Templates → *Magic Link*, remplacer le lien par :

```
{{ .SiteURL }}/auth/confirm?token_hash={{ .TokenHash }}&type=email
```

Le lien devient ouvrable depuis **n'importe quel navigateur**.

Sans ce changement, le gabarit par défaut utilise le flux PKCE : le lien n'est valable que
dans le navigateur **qui l'a demandé**, parce que la clé de vérification est un cookie posé
à ce moment-là. Demander le lien dans un navigateur et l'ouvrir dans un autre — ou dans
l'application mail — échoue, et le lien est consommé au passage : il faut en redemander un.

C'est exactement ce qui s'est produit le 09/09 : jeton validé côté Supabase, `last_sign_in_at`
inchangé, session jamais créée. Le cas se reproduira chez chaque client tant que le gabarit
n'est pas changé — un dirigeant ouvrira le lien depuis son téléphone.

### Diagnostiquer un échec de connexion

```sql
select email, last_sign_in_at, recovery_sent_at,
       (recovery_token is not null and recovery_token <> '') as jeton_en_attente
from auth.users;
```

- `jeton_en_attente` vrai → le lien n'a pas encore été cliqué.
- jeton vide **et** `last_sign_in_at` non mis à jour → le lien a été cliqué, mais l'échange
  a échoué côté application : navigateur différent, ou lien déjà utilisé.
- `last_sign_in_at` à jour → la connexion a réussi ; le problème est ailleurs.

La cause exacte est aussi tracée dans les journaux du serveur Next (`[auth/confirm] échec`).

## Où le contrôle se fait

| Couche | Rôle |
|---|---|
| `src/middleware.ts` | Rafraîchit la session et barre `/app` et `/admin` aux visiteurs anonymes. **Pas de contrôle de rôle ici** : il coûterait une requête en base à chaque navigation. |
| `src/app/admin/layout.tsx` | `exigerRole("consultant")` — la garde de rôle, une fois par rendu. |
| RLS Postgres | La seule barrière qui compte. Même une faille d'interface ne donne accès à rien. |
