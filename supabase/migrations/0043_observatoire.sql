-- 0043 — L’Observatoire ANM, le blog du site (consignes de Sofia du 26 au 28/09/2026, docs/observatoire/).
-- Deux types de contenus : la « fiche » décrypte une décision selon la structure de la note
-- méthodologique (accroche, faits, reproches, défense, décision, point ANM, « Et chez vous ? »,
-- référence) ; le « dossier » est un contenu permanent (« Contrôle CNAPS : quels éléments sont
-- vérifiés ? »), rédigé en sections.
--
-- L’outil structure et publie ; il ne rédige rien. La base refuse la publication tant que les cinq
-- « questions avant diffusion » du squelette éditorial ne sont pas cochées et, pour une fiche, tant
-- que la référence (juridiction, date, numéro) et le stade de la procédure manquent : une décision
-- de référé ne doit jamais passer pour une décision définitive.
--
-- Lecture publique des seuls articles publiés ; écriture réservée à la consultante.

create table if not exists public.observatoire_articles (
  id                  uuid primary key default gen_random_uuid(),
  slug                text not null unique
    check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) <= 90)
    -- Adresses déjà prises sous /observatoire (pages de territoire, note méthodologique, flux RSS).
    check (slug not in ('cnaps', 'urssaf', 'dgfip', 'inspection-du-travail', 'economie-de-la-securite',
                        'note-methodologique', 'rss', 'rss-xml', 'opengraph-image')),
  statut              text not null default 'brouillon' check (statut in ('brouillon', 'publie')),
  type                text not null check (type in ('fiche', 'dossier')),
  territoire          text not null check (territoire in ('cnaps', 'urssaf', 'dgfip', 'inspection_travail', 'economie')),

  titre               text not null check (char_length(btrim(titre)) > 0),
  titre_seo           text,          -- repli : titre
  meta_description    text,          -- repli : accroche
  accroche            text,

  -- La fiche, dans l’ordre de la note méthodologique
  faits               text,
  reproches           text,          -- les griefs de l’administration ou de l’autorité
  defense             text,          -- ce que l’entreprise a fait valoir
  decision            text,          -- ce qui a effectivement été jugé ou décidé
  point_anm           text,
  question            text,          -- « Et chez vous ? »

  -- La référence de la décision
  juridiction         text,
  decision_date       date,
  decision_numero     text,
  decision_url        text check (decision_url is null or decision_url ~ '^https?://'),
  stade_procedure     text check (stade_procedure is null or stade_procedure in
                        ('refere', 'premiere_instance', 'appel', 'cassation', 'definitive', 'sanction_administrative')),
  stade_precision     text,          -- ex. « appel pendant devant la CAA de Paris »

  -- Le dossier
  corps               text,          -- markdown simple : ## sections, listes, liens
  sources             text,          -- une source par ligne (libellé et adresse)

  -- Les cinq questions avant chaque diffusion
  q_concerne_dirigeant boolean not null default false,
  q_source_verifiable  boolean not null default false,
  q_analyse            boolean not null default false,
  q_sans_methode       boolean not null default false,
  q_utilite_anm        boolean not null default false,

  publie_le           timestamptz,   -- première publication, conservée à la dépublication
  mis_a_jour_le       timestamptz,   -- mise à jour de fond signalée aux lecteurs
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now(),

  constraint observatoire_publication_complete check (
    statut <> 'publie' or (
      publie_le is not null
      and q_concerne_dirigeant and q_source_verifiable and q_analyse and q_sans_methode and q_utilite_anm
      and char_length(btrim(coalesce(accroche, ''))) > 0
      and (
        type = 'dossier' and char_length(btrim(coalesce(corps, ''))) > 0
        or type = 'fiche'
          and char_length(btrim(coalesce(juridiction, ''))) > 0
          and decision_date is not null
          and char_length(btrim(coalesce(decision_numero, ''))) > 0
          and stade_procedure is not null
          and char_length(btrim(coalesce(faits, ''))) > 0
          and char_length(btrim(coalesce(reproches, ''))) > 0
          and char_length(btrim(coalesce(decision, ''))) > 0
          and char_length(btrim(coalesce(point_anm, ''))) > 0
          and char_length(btrim(coalesce(question, ''))) > 0
      )
    )
  )
);

create index if not exists observatoire_publies
  on public.observatoire_articles (territoire, publie_le desc) where statut = 'publie';

create or replace function public.observatoire_horodater() returns trigger
language plpgsql set search_path = public as $$
begin
  new.updated_at := now();
  return new;
end $$;
revoke execute on function public.observatoire_horodater() from public, anon, authenticated;

drop trigger if exists observatoire_horodatage on public.observatoire_articles;
create trigger observatoire_horodatage before update on public.observatoire_articles
  for each row execute function public.observatoire_horodater();

-- Droits -----------------------------------------------------------------------------------------
alter table public.observatoire_articles enable row level security;

-- Le site (anon) et tout compte connecté lisent les articles publiés, rien d’autre.
drop policy if exists "observatoire_lecture_publique" on public.observatoire_articles;
create policy "observatoire_lecture_publique" on public.observatoire_articles for select to anon, authenticated
  using (statut = 'publie');

-- La consultante lit les brouillons et écrit tout.
drop policy if exists "observatoire_consultant" on public.observatoire_articles;
create policy "observatoire_consultant" on public.observatoire_articles for all to authenticated
  using (public.current_role() = 'consultant')
  with check (public.current_role() = 'consultant');

revoke all on public.observatoire_articles from anon;
grant select on public.observatoire_articles to anon;
grant select, insert, update, delete on public.observatoire_articles to authenticated;
