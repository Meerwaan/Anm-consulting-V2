-- 0019 — ce qui manquait autour du constat.
--
-- 1. La date de vérification de la référence. Le pack exige une référence
--    « vérifiée ET datée » : jusqu'ici on ne stockait que la coche. Dans un
--    rapport opposable, la date compte autant que la vérification elle-même.
-- 2. L'horodatage de dernière modification, pour savoir quand un constat a été
--    retouché — y compris après une restitution.
-- 3. L'unicité du rang de synthèse, jusqu'ici seulement signalée à l'écran.

alter table public.findings
  add column if not exists reference_checked_on date,
  add column if not exists updated_at timestamptz not null default now();

comment on column public.findings.reference_checked_on is
  'Jour où la référence a été vérifiée dans le texte. Posée automatiquement quand la consultante coche « référence vérifiée ».';

-- Les constats déjà cochés « vérifiée » n'ont pas de date : on reprend leur jour
-- de création, seule date réellement connue, plutôt que d'en inventer une.
update public.findings
set reference_checked_on = created_at::date
where reference_checked = 'oui' and reference_checked_on is null;

create or replace function public.touch_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end;
$$;
revoke execute on function public.touch_updated_at() from public, anon, authenticated;

drop trigger if exists findings_touch_updated_at on public.findings;
create trigger findings_touch_updated_at
  before update on public.findings
  for each row execute function public.touch_updated_at();

-- Deux constats portaient déjà le même rang en base (l'écran le signalait sans
-- l'empêcher). On renumérote sans rien perdre : l'ordre voulu est conservé, le
-- second d'un rang partagé glisse à la place libre suivante. Au-delà de cinq
-- constats mis en avant, le surplus repart sans rang — c'est un choix à refaire.
with ordonne as (
  select id,
         row_number() over (partition by mission_id order by report_rank, created_at) as place
  from public.findings
  where report_rank is not null
)
update public.findings f
set report_rank = case when o.place <= 5 then o.place::int else null end
from ordonne o
where o.id = f.id and f.report_rank is distinct from (case when o.place <= 5 then o.place::int else null end);

-- Une place de 1 à 5 dans la synthèse dirigeant n'appartient qu'à un constat.
-- L'interface échange désormais les rangs ; l'index garantit qu'aucun autre
-- chemin ne peut créer de doublon.
create unique index if not exists findings_rang_unique
  on public.findings (mission_id, report_rank)
  where report_rank is not null;
