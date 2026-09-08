-- Corrige deux défauts du déclencheur d'échéances de 0012, tous deux visibles en test :
--   1. le statut n'était calculé qu'à la mise à jour : une échéance créée déjà dépassée
--      naissait « à venir » ;
--   2. le seuil d'effectif était appliqué par la vue mais pas par le déclencheur — un
--      DUERP de 400 jours dans une entreprise de 6 salariés créait une alerte alors que
--      la mise à jour annuelle ne lui est pas imposée (C. trav. art. R4121-2).
--      Une fausse alerte dans un outil de préparation au contrôle est pire que rien.
create or replace function public.sync_deadline_from_document() returns trigger
language plpgsql security definer set search_path = public, pg_temp as $$
declare k public.deadline_kind; ech date; org uuid; j int; seuil int; effectif int; st text;
begin
  select t.deadline_kind, t.validite_jours, t.applique_si_effectif_min
    into k, j, seuil
    from public.document_templates t where t.id = new.template_id;
  if k is null then return new; end if;

  select m.org_id into org from public.missions m where m.id = new.mission_id;
  select o.headcount into effectif from public.organizations o where o.id = org;

  if seuil is not null and coalesce(effectif, 0) < seuil then
    delete from public.deadlines where source_document_id = new.id;
    return new;
  end if;

  ech := coalesce(new.expire_le, (new.document_date + (j || ' days')::interval)::date);
  if ech is null then
    delete from public.deadlines where source_document_id = new.id;
    return new;
  end if;

  st := case when ech < current_date then 'echu'
             when ech <= current_date + 90 then 'alerte'
             else 'a_venir' end;

  insert into public.deadlines (org_id, kind, subject, due_on, status, source_document_id, notes)
  values (org, k, new.name, ech, st, new.id, 'Créée depuis la pièce de mission.')
  on conflict (source_document_id) do update
    set due_on = excluded.due_on, subject = excluded.subject, status = excluded.status;
  return new;
end $$;
revoke execute on function public.sync_deadline_from_document() from public, anon, authenticated;
