-- 0029 — la vue de validité des pièces expose aussi le fichier déposé.
--
-- Appliquée en base le 20/09/2026 depuis la session mobile (version 20260920203851),
-- recopiée ici pour que le repo reste la source de vérité du schéma.
create or replace view public.mission_documents_validite
with (security_invoker = on) as
select
  d.id, d.mission_id, d.name, d.category, d.module_id, d.required,
  d.received, d.received_on, d.document_date,
  t.validite_nature, t.validite_note, t.validite_jours,
  coalesce(d.expire_le, (d.document_date + ((t.validite_jours || ' days')::interval))::date) as echeance,
  case
    when t.applique_si_effectif_min is not null
     and coalesce(o.headcount, 0) < t.applique_si_effectif_min then 'sans_objet'
    when d.received <> 'oui' then 'non_recue'
    when t.validite_nature = 'indefinie' or t.validite_nature is null then 'recue'
    when coalesce(d.expire_le, (d.document_date + ((t.validite_jours || ' days')::interval))::date) is null then 'date_manquante'
    when coalesce(d.expire_le, (d.document_date + ((t.validite_jours || ' days')::interval))::date) < current_date then 'perimee'
    when coalesce(d.expire_le, (d.document_date + ((t.validite_jours || ' days')::interval))::date) <= current_date + 30 then 'bientot_perimee'
    else 'valide'
  end as etat,
  d.storage_path, d.file_name, d.file_size
from public.mission_documents d
join public.missions m on m.id = d.mission_id
left join public.organizations o on o.id = m.org_id
left join public.document_templates t on t.id = d.template_id;

revoke all on public.mission_documents_validite from anon;
grant select on public.mission_documents_validite to authenticated;
