-- 0044 — Désinscription sans compte (29/09/2026). Les emails partent désormais (Resend, domaine
-- anm-consulting.fr) : l’avis de parution de l’Observatoire est envoyé aux inscrits, et chaque envoi
-- porte un lien de désinscription en un clic.
--
-- Le lien porte un jeton aléatoire propre à chaque inscription (122 bits, impossible à deviner) :
-- il vaut signature. Le site le génère à l’insertion, puisque le visiteur anonyme ne peut pas relire
-- la ligne qu’il vient d’écrire. La désinscription passe par une fonction SECURITY DEFINER qui ne
-- fait qu’une chose : marquer `desabonne_le` sur les inscriptions Observatoire de la même adresse.

alter table public.leads
  add column if not exists desabonne_le         timestamptz,
  add column if not exists jeton_desinscription uuid not null default gen_random_uuid();

create unique index if not exists leads_jeton_desinscription_key on public.leads (jeton_desinscription);

create or replace function public.desinscrire_lead(p_jeton uuid)
returns boolean
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_email text;
begin
  select lower(email) into v_email from public.leads where jeton_desinscription = p_jeton;
  if v_email is null then
    return false;
  end if;
  update public.leads
     set desabonne_le = coalesce(desabonne_le, now())
   where lower(email) = v_email
     and source = 'observatoire';
  return true;
end;
$$;

revoke execute on function public.desinscrire_lead(uuid) from public;
grant execute on function public.desinscrire_lead(uuid) to anon, authenticated;
