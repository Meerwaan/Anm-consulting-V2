-- 0024 — trois défauts trouvés par l'audit croisé code / pack.
--
-- 1. UNE PIÈCE JAMAIS REÇUE S'AFFICHAIT « REÇUE ».
--    La vue testait `validite_nature = 'indefinie'` AVANT `received <> 'oui'`. Les 29
--    modèles sur 37 qui n'ont pas de durée de péremption — registre du personnel, DPAE,
--    contrats, bulletins, plannings, pointages — basculaient donc en « sans_objet » quoi
--    qu'il arrive, et ListePieces.tsx affiche « sans_objet » en vert avec le mot « Reçue ».
--    Sur la mission Secu 91 : 23 pièces en « sans objet », 4 en « non reçue », alors que
--    rien n'avait été reçu. La phase de collecte du pack (« demander les pièces et
--    relancer les manquants ») ne fonctionnait que pour 8 documents sur 37.
--    « Sans objet » doit vouloir dire « ce document ne s'applique pas à cette entreprise »
--    — le seuil d'effectif, rien d'autre. L'absence de date de péremption n'est pas une
--    dispense de réception.

create or replace view public.mission_documents_validite
with (security_invoker = on) as
select
  d.id, d.mission_id, d.name, d.category, d.module_id, d.required,
  d.received, d.received_on, d.document_date,
  t.validite_nature, t.validite_note, t.validite_jours,
  coalesce(d.expire_le, (d.document_date + ((t.validite_jours || ' days')::interval))::date) as echeance,
  case
    -- Le document ne s'applique pas à cette entreprise : seul cas de « sans objet ».
    when t.applique_si_effectif_min is not null
     and coalesce(o.headcount, 0) < t.applique_si_effectif_min then 'sans_objet'
    -- Reçu ou non : la question se pose avant celle de la péremption.
    when d.received <> 'oui' then 'non_recue'
    -- Reçu, et aucune durée de validité connue : rien à surveiller, mais bien reçu.
    when t.validite_nature = 'indefinie' or t.validite_nature is null then 'recue'
    when coalesce(d.expire_le, (d.document_date + ((t.validite_jours || ' days')::interval))::date) is null then 'date_manquante'
    when coalesce(d.expire_le, (d.document_date + ((t.validite_jours || ' days')::interval))::date) < current_date then 'perimee'
    when coalesce(d.expire_le, (d.document_date + ((t.validite_jours || ' days')::interval))::date) <= current_date + 30 then 'bientot_perimee'
    else 'valide'
  end as etat
from public.mission_documents d
join public.missions m on m.id = d.mission_id
left join public.organizations o on o.id = m.org_id
left join public.document_templates t on t.id = d.template_id;

revoke all on public.mission_documents_validite from anon;
grant select on public.mission_documents_validite to authenticated;

-- 2. LE DEUXIÈME SITE ÉCRASAIT LE PREMIER.
--    La procédure §7 dit « prendre un site client et un mois représentatif », et le §5
--    demande d'élargir quand une anomalie sérieuse apparaît. Or la table n'acceptait
--    qu'une ligne par (mission, type de croisement) : saisir un second site remplaçait
--    silencieusement les chiffres du premier. Le rapport ne pouvait donc pas dire sur
--    quel site ni sur quel mois le contrôle avait porté.

alter table public.mission_reconciliations add column if not exists site text;
comment on column public.mission_reconciliations.site is
  'Le site client sur lequel porte le croisement (06 §7 : « prendre un site client et un mois représentatif »). NULL = tous sites.';

alter table public.mission_reconciliations drop constraint if exists mission_reconciliations_mission_id_kind_key;
create unique index if not exists mission_reconciliations_portee_uniq
  on public.mission_reconciliations (mission_id, kind, coalesce(periode, ''), coalesce(site, ''));

create or replace view public.mission_reconciliation_status
with (security_invoker = on) as
-- `site` est ajouté EN FIN de liste : « create or replace view » ne sait qu'ajouter des
-- colonnes à la fin, jamais en insérer une au milieu.
select id, mission_id, kind, periode, valeur_a, valeur_b, tolerance_pct, note,
       updated_at, updated_by,
       valeur_b - valeur_a as ecart,
       case when coalesce(valeur_a, 0) = 0 then null
            else round(abs(valeur_b - valeur_a) / abs(valeur_a) * 100, 2) end as ecart_pct,
       case
         when valeur_a is null or valeur_b is null then 'a_saisir'
         when coalesce(valeur_a, 0) = 0 and coalesce(valeur_b, 0) = 0 then 'coherent'
         when coalesce(valeur_a, 0) = 0 then 'ecart'
         when (abs(valeur_b - valeur_a) / abs(valeur_a) * 100) <= tolerance_pct then 'coherent'
         else 'ecart'
       end as statut,
       site
from public.mission_reconciliations r;

revoke all on public.mission_reconciliation_status from anon;
grant select on public.mission_reconciliation_status to authenticated;

-- 3. DES PIÈCES RÉCLAMÉES QUE LE PACK NE DEMANDE QUE SOUS CONDITION.
--    Le §3 écrit « Règlement intérieur SI APPLICABLE », « Documents CSE SI APPLICABLE »,
--    « Journaux de paie et SI PERTINENT DSN/états de contrôle ». Le portail les créait
--    toutes obligatoires : une société de huit agents sans CSE se voyait réclamer des PV
--    de CSE, comptés comme pièces manquantes dans le tableau de bord. Réclamer une pièce
--    qui n'existe pas fait perdre du crédit à toutes les autres demandes.

alter table public.document_templates add column if not exists conditionnel boolean not null default false;
comment on column public.document_templates.conditionnel is
  'Le pack ne demande cette pièce que sous condition (« si applicable », « si pertinent »). Créée non obligatoire ; la consultante la coche si le cas se présente.';

update public.document_templates set conditionnel = true
where name in (
  'Règlement intérieur si applicable',
  'Documents CSE si applicable',
  'DSN / états cohérence'
);

update public.mission_documents d
set required = false
from public.document_templates t
where t.id = d.template_id and t.conditionnel and d.received <> 'oui';
