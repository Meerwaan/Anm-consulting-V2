/**
 * Régénère la migration du référentiel des textes depuis src/content/textes.ts,
 * source unique. Node 22+ (strip des types TypeScript à l'import).
 *
 *   node --experimental-strip-types scripts/gen_textes_sql.mjs
 */
import { writeFileSync } from "node:fs";
import { TEXTES, TEXTES_PAR_DOMAINE } from "../src/content/textes.ts";

const q = (v) => (v === null || v === undefined ? "null" : `'${String(v).replace(/'/g, "''")}'`);

const entete = `-- ---------------------------------------------------------------------------
-- 0010 — Les textes qui fondent chaque contrôle.
--
-- GÉNÉRÉ depuis src/content/textes.ts : ne pas éditer à la main.
--   node --experimental-strip-types scripts/gen_textes_sql.mjs
--
-- Ce référentiel dit QUEL texte s'applique à quel domaine de contrôle. Il ne dit
-- jamais ce qu'un article prescrit : la numérotation change, et la règle du pack
-- impose de revérifier et de dater toute référence avant publication au client.
-- ---------------------------------------------------------------------------

create table public.legal_texts (
  code        text primary key,
  nom         text not null,
  autorite    text not null,
  portee      text,
  url         text,
  usage       text not null,
  verifie_le  date not null default current_date
);
comment on table public.legal_texts is
  'Textes applicables. La numérotation des articles change : revérifier avant chaque publication (règle du pack).';

create type public.text_role as enum ('principal', 'complementaire');

create table public.domain_legal_texts (
  domain    public.audit_domain not null,
  text_code text not null references public.legal_texts (code) on delete cascade,
  role      public.text_role not null default 'principal',
  primary key (domain, text_code)
);

alter table public.legal_texts        enable row level security;
alter table public.domain_legal_texts enable row level security;
create policy "textes_read"  on public.legal_texts        for select to authenticated using (true);
create policy "textes_write" on public.legal_texts        for all    to authenticated using (public.current_role() = 'consultant');
create policy "dlt_read"     on public.domain_legal_texts for select to authenticated using (true);
create policy "dlt_write"    on public.domain_legal_texts for all    to authenticated using (public.current_role() = 'consultant');
`;

const lignesTextes = TEXTES.map(
  (t) => `(${q(t.code)}, ${q(t.nom)}, ${q(t.autorite)}, ${q(t.portee)}, ${q(t.url)}, ${q(t.usage)})`,
).join(",\n");

const lignesMapping = Object.entries(TEXTES_PAR_DOMAINE)
  .flatMap(([domaine, m]) => [
    ...m.principal.map((c) => `(${q(domaine)}, ${q(c)}, 'principal')`),
    ...m.complementaire.map((c) => `(${q(domaine)}, ${q(c)}, 'complementaire')`),
  ])
  .join(",\n");

const fin = `
-- Le champ \`reference\` du pack mélange de vraies sources et des restes de colonnes
-- Excel (« Audit », « Interne », « Dossiers antérieurs »). On le qualifie sans rien effacer.
create type public.reference_kind as enum ('source', 'interne', 'a_qualifier');
alter table public.control_points add column reference_kind public.reference_kind;
update public.control_points set reference_kind = (case
  when reference is null or btrim(reference) = '' then 'a_qualifier'
  when reference in ('Interne','Audit','Audit croisé','Audit opérationnel','Dossiers antérieurs',
                     'Audit risque travail illégal','Interne/CNAPS','Interne/SST') then 'interne'
  else 'source' end)::public.reference_kind;
alter table public.control_points alter column reference_kind set not null;
comment on column public.control_points.reference_kind is
  'source = le pack cite une source ; interne = point de contrôle interne, sans texte opposable ; a_qualifier = rien dans le pack.';
`;

const sql = `${entete}
insert into public.legal_texts (code, nom, autorite, portee, url, usage) values
${lignesTextes};

insert into public.domain_legal_texts (domain, text_code, role) values
${lignesMapping};
${fin}`;

writeFileSync(new URL("../supabase/migrations/0010_textes_applicables.sql", import.meta.url), sql);
console.log(`écrit : ${TEXTES.length} textes, ${lignesMapping.split("\n").length} rattachements`);
