-- Phase 2 : capture des leads (formulaire de contact + lead magnet)
create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  email text not null,
  full_name text,
  company text,
  headcount int,
  source text,            -- 'contact' | 'checklist-cnaps' | 'questionnaire'
  message text
);
alter table public.leads enable row level security;
-- Insertion publique via l'API route (clé anon), lecture réservée au service role.
create policy "leads_insert_public" on public.leads for insert with check (true);
