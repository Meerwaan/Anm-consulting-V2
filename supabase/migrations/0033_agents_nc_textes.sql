-- 0033 — agents contrôlés, non-conformités et textes du rapport.
--
-- Grilles de Sofia : 02 §7 et 03 §4 (contrôle des agents, un par un), 02 §11
-- (non-conformités : nature, constat objectif, élément vérifié, action corrective, délai,
-- justificatif attendu). Les textes du rapport sont ceux qu'elle écrit ou valide : l'outil
-- propose une rédaction à partir de ses réponses, seul le texte enregistré ici est le sien.

-- Agents contrôlés ------------------------------------------------------------------------
-- sous_traitant_id NULL = salarié du donneur d'ordre.
create table if not exists public.st_agents (
  id                  uuid primary key default gen_random_uuid(),
  mission_id          uuid not null references public.missions(id) on delete cascade,
  sous_traitant_id    uuid references public.st_sous_traitants(id) on delete cascade,
  nom                 text,
  employeur           text,
  carte_numero        text,
  heures              numeric(10,2) check (heures is null or heures >= 0),
  present_documents   public.check_result,
  carte_valide        public.check_result,
  carte_activite      public.check_result,
  dracar              public.check_result,
  planning            public.check_result,
  note                text,
  created_at          timestamptz not null default now()
);
create index if not exists st_agents_st_idx on public.st_agents (sous_traitant_id);
create index if not exists st_agents_mission_idx on public.st_agents (mission_id);

-- Non-conformités ---------------------------------------------------------------------------
create table if not exists public.non_conformites (
  id                  uuid primary key default gen_random_uuid(),
  mission_id          uuid not null references public.missions(id) on delete cascade,
  sous_traitant_id    uuid references public.st_sous_traitants(id) on delete set null,
  nature              text not null check (nature in (
                        'travail_dissimule', 'pret_illicite', 'marchandage', 'defaut_vigilance',
                        'sous_traitance_irreguliere', 'cnaps', 'autre')),
  nature_autre        text,
  constat             text,
  element_verifie     text,
  action              text,
  delai               text,
  justificatif        text,
  created_at          timestamptz not null default now(),
  updated_at          timestamptz not null default now()
);
create index if not exists non_conformites_mission_idx on public.non_conformites (mission_id, created_at);

-- Textes du rapport ------------------------------------------------------------------------
create table if not exists public.rapport_textes (
  mission_id  uuid not null references public.missions(id) on delete cascade,
  cle         text not null,
  texte       text,
  updated_at  timestamptz not null default now(),
  updated_by  uuid references auth.users(id) on delete set null,
  primary key (mission_id, cle)
);

do $$
declare t text;
begin
  foreach t in array array['st_agents','non_conformites','rapport_textes'] loop
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "%s_consultant" on public.%I', t, t);
    execute format('create policy "%s_consultant" on public.%I for all to authenticated
                    using (public.current_role() = ''consultant'')
                    with check (public.current_role() = ''consultant'')', t, t);
    execute format('revoke all on public.%I from anon', t);
    execute format('grant select, insert, update, delete on public.%I to authenticated', t);
  end loop;
end $$;
