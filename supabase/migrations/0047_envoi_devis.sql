-- 0047 — Le devis part chez le client depuis l'outil, et le client y répond en ligne (Merwan, 13/10/2026).
--
-- Jusqu'ici « Marquer comme envoyé » ne faisait que cocher une case : Sofia envoyait le PDF depuis sa
-- messagerie et attendait un retour signé sur papier. Désormais :
--   * l'outil envoie le devis par email (PDF joint), avec un lien personnel /devis/<jeton> ;
--   * le client y relit le devis et donne son « Bon pour accord » en ligne ;
--   * l'accord est tracé (qui, quand, d'où, sur quel montant) et fige le devis ;
--   * Sofia garde la main : c'est elle qui crée ensuite la mission et le contrat.
--
-- Le client n'a pas de compte à ce stade : il lit et accepte par deux fonctions SECURITY DEFINER,
-- seules portes ouvertes au rôle anon sur les devis. Elles ne rendent que ce que le PDF montre
-- déjà, et seulement à qui présente le jeton (64 caractères hexadécimaux tirés au hasard).

alter table public.devis
  add column if not exists jeton              text unique default replace(gen_random_uuid()::text || gen_random_uuid()::text, '-', ''),
  add column if not exists destinataire_email text,
  add column if not exists destinataire_nom   text,
  add column if not exists email_envoye_le    timestamptz,   -- dernier envoi par email depuis l'outil ; null : remis autrement
  add column if not exists accord_le          timestamptz,   -- « Bon pour accord » donné en ligne par le client
  add column if not exists accord_nom         text,
  add column if not exists accord_fonction    text,
  add column if not exists accord_ip          text,
  add column if not exists accord_agent       text,
  add column if not exists accord_total_ttc   numeric(10,2); -- le montant sur lequel porte l'accord

comment on column public.devis.jeton is
  'Secret du lien public /devis/<jeton>. Le lien n''ouvre le devis que s''il est envoyé ou accepté.';

-- Lecture par le client ------------------------------------------------------------------------
-- Un devis en brouillon ou refusé n'est pas montré : le lien répond « retiré », sans contenu.
create or replace function public.devis_public(p_jeton text)
returns jsonb
language sql stable security definer
set search_path = ''
as $$
  select case
    when d.statut not in ('envoye', 'accepte') then jsonb_build_object('etat', 'retire')
    else jsonb_build_object(
      'etat', case when d.statut = 'accepte' or d.accord_le is not null then 'accepte' else 'ouvert' end,
      -- La version vue par le client : l'accord ne vaut que pour elle (voir devis_donner_accord).
      'version', d.maj_le,
      'devis', jsonb_build_object(
        'numero', d.numero, 'cree_le', d.cree_le, 'valable_jusquau', d.valable_jusquau,
        'prestation', d.prestation, 'intitule', d.intitule, 'description', d.description,
        'lignes', d.lignes, 'total_ht', d.total_ht, 'taux_tva', d.taux_tva, 'total_ttc', d.total_ttc,
        'acompte_pct', d.acompte_pct, 'calendrier', d.calendrier, 'livrables', d.livrables,
        'destinataire_nom', d.destinataire_nom,
        'accord_le', d.accord_le, 'accord_nom', d.accord_nom, 'accord_fonction', d.accord_fonction,
        'accord_total_ttc', d.accord_total_ttc),
      'client', jsonb_build_object(
        'name', o.name, 'siren', o.siren, 'forme_juridique', o.forme_juridique,
        'adresse', o.adresse, 'code_postal', o.code_postal, 'ville', o.ville,
        'representant', o.representant, 'representant_fonction', o.representant_fonction,
        'exemple', o.exemple),
      'cabinet', (
        select jsonb_build_object(
          'raison_sociale', c.raison_sociale, 'forme_juridique', c.forme_juridique, 'capital', c.capital,
          'adresse', c.adresse, 'code_postal', c.code_postal, 'ville', c.ville,
          'siren', c.siren, 'rcs_ville', c.rcs_ville, 'franchise_tva', c.franchise_tva)
          from public.cabinet c limit 1))
  end
    from public.devis d
    join public.organizations o on o.id = d.org_id
   where length(p_jeton) = 64 and d.jeton = p_jeton
$$;

-- Accord du client -------------------------------------------------------------------------------
-- Rend un code : ok, deja (accord déjà donné), retire, expire, modifie (le devis a changé depuis
-- l'affichage : le client doit relire), nom (signataire manquant), introuvable.
create or replace function public.devis_donner_accord(
  p_jeton text, p_version timestamptz, p_nom text, p_fonction text, p_ip text, p_agent text
)
returns jsonb
language plpgsql security definer
set search_path = ''
as $$
declare
  d   public.devis%rowtype;
  nom text := nullif(btrim(coalesce(p_nom, '')), '');
begin
  if p_jeton is null or length(p_jeton) <> 64 then
    return jsonb_build_object('code', 'introuvable');
  end if;
  -- La ligne est verrouillée : deux accords simultanés n'en enregistrent qu'un.
  select * into d from public.devis where jeton = p_jeton for update;
  if not found then return jsonb_build_object('code', 'introuvable'); end if;
  if d.accord_le is not null or d.statut = 'accepte' then return jsonb_build_object('code', 'deja'); end if;
  if d.statut <> 'envoye' then return jsonb_build_object('code', 'retire'); end if;
  if d.valable_jusquau < (now() at time zone 'Europe/Paris')::date then return jsonb_build_object('code', 'expire'); end if;
  if p_version is null or d.maj_le <> p_version then return jsonb_build_object('code', 'modifie'); end if;
  if nom is null or length(nom) > 120 then return jsonb_build_object('code', 'nom'); end if;

  update public.devis
     set accord_le        = now(),
         accord_nom       = nom,
         accord_fonction  = nullif(btrim(left(coalesce(p_fonction, ''), 120)), ''),
         accord_ip        = nullif(left(coalesce(p_ip, ''), 64), ''),
         accord_agent     = nullif(left(coalesce(p_agent, ''), 300), ''),
         accord_total_ttc = d.total_ttc
   where id = d.id;

  -- L'identifiant et l'adresse ne servent qu'au serveur du site, pour prévenir ANM et confirmer au client.
  return jsonb_build_object('code', 'ok', 'id', d.id, 'destinataire_email', d.destinataire_email);
end $$;

revoke all on function public.devis_public(text) from public;
revoke all on function public.devis_donner_accord(text, timestamptz, text, text, text, text) from public;
grant execute on function public.devis_public(text) to anon, authenticated;
grant execute on function public.devis_donner_accord(text, timestamptz, text, text, text, text) to anon, authenticated;
