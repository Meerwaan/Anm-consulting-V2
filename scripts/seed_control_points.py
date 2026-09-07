#!/usr/bin/env python3
"""Régénère supabase/seed/0001_control_points.sql et 0002_document_templates.sql
depuis les xlsx du Pack complet V2 (dossier passé en argument, ex. ~/Downloads/fwd/Pack_Complet_Consultant_Securite_Privee_2026).

    pip install openpyxl
    python3 scripts/seed_control_points.py /chemin/vers/Pack_Complet_Consultant_Securite_Privee_2026
"""
import sys, os, openpyxl

if len(sys.argv) < 2:
    sys.exit(__doc__)
P = sys.argv[1].rstrip('/') + '/'
ROOT = os.path.join(os.path.dirname(__file__), '..', 'supabase', 'seed')

def esc(s):
    return str(s).replace("'", "''").strip() if s is not None else ''

def sql(v):
    return "'%s'" % esc(v) if v not in (None, '') else 'null'

RISK = {'Critique': 'critique', 'Majeur': 'majeur', 'Modéré': 'modere', 'Mineur': 'mineur'}
DOM = {'GOUVERNANCE': 'gouvernance', 'CNAPS': 'cnaps', 'SOCIAL': 'social', 'TEMPS': 'temps', 'URSSAF': 'urssaf',
       'TRAVAIL': 'inspection_sst', 'SOUS-TRAITANCE': 'sous_traitance', 'OPÉRATIONNEL': 'operationnel', 'FISCAL': 'fiscal'}

rows = []
ws = openpyxl.load_workbook(P + '02_Mallette_Audit_360.xlsx')['AUDIT_360']
for r in ws.iter_rows(min_row=2, values_only=True):
    if r[0] is None: continue
    rows.append(('A360-%03d' % r[0], '02_Mallette_Audit_360', 'AUDIT_360', DOM[r[1]], r[2], None, r[3], r[4], r[5], r[10]))

def module(file, sheet, prefix, domain):
    ws = openpyxl.load_workbook(P + file)[sheet]
    for r in ws.iter_rows(min_row=2, values_only=True):
        if r[0] is None: continue
        rows.append(('%s-%03d' % (prefix, r[0]), file.replace('.xlsx', ''), sheet, domain, r[1], r[2], r[3], r[4], r[5], None))

module('03_Module_Audit_CNAPS.xlsx', 'AUDIT_CNAPS', 'CNA', 'cnaps')
module('04_Module_URSSAF_Inspection.xlsx', 'AUDIT_URSSAF', 'URS', 'urssaf')
module('04_Module_URSSAF_Inspection.xlsx', 'AUDIT_INSPECTION', 'INS', 'inspection_sst')
module('05_Module_Controle_Fiscal.xlsx', 'AUDIT_FISCAL', 'FIS', 'fiscal')

out = ["-- Seed du référentiel des points de contrôle du portail.",
       "-- Généré depuis le Pack complet V2 (sept. 2026) : 02 AUDIT_360 (120), 03 AUDIT_CNAPS (24),",
       "-- 04 AUDIT_URSSAF (20) + AUDIT_INSPECTION (20), 05 AUDIT_FISCAL (24). Total : %d points." % len(rows),
       "-- Ne pas éditer à la main : régénérer avec scripts/seed_control_points.py après modification des xlsx.",
       "begin;",
       "insert into public.control_points (code, source_module, source_sheet, domain, theme, subtheme, question, evidence, initial_risk, reference) values"]
out.append(",\n".join("('%s','%s','%s','%s','%s',%s,'%s',%s,'%s',%s)" % (
    c, m, s, d, esc(t), sql(st), esc(q), sql(e), RISK.get(rk, 'majeur'), sql(ref)) for c, m, s, d, t, st, q, e, rk, ref in rows)
           + "\non conflict (code) do update set question=excluded.question, evidence=excluded.evidence, initial_risk=excluded.initial_risk, reference=excluded.reference, theme=excluded.theme, subtheme=excluded.subtheme;")
out.append("commit;")
open(os.path.join(ROOT, '0001_control_points.sql'), 'w').write("\n".join(out) + "\n")

CAT = {'Entreprise': 'entreprise', 'CNAPS': 'cnaps', 'Social': 'social', 'Paie': 'paie', 'Temps': 'temps', 'SST': 'sst', 'CSE': 'cse'}
docs = []
ws = openpyxl.load_workbook(P + '09_Dossier_Mission_Client.xlsx')['SUIVI_DOCUMENTS']
for r in ws.iter_rows(min_row=2, values_only=True):
    if r[2]: docs.append((int(r[0]), CAT[r[1]], r[2], '09_Dossier_Mission_Client'))
n = len(docs)
for d in ['FEC des exercices contrôlés', 'Balances, grands livres et comptes annuels',
          'Liasses fiscales et déclarations TVA (CA3/CA12)', 'Journal des ventes et échantillon de factures clients',
          'Journal des achats et factures fournisseurs / sous-traitants', 'Notes de frais et justificatifs des charges sensibles']:
    n += 1; docs.append((n, 'fiscal', d, '05_Module_Controle_Fiscal (ajout pilier fiscal)'))
out = ["-- Seed de la liste de pièces standard d'une mission (checklist SUIVI_DOCUMENTS du 09_Dossier_Mission_Client).",
       "-- Les 6 pièces 'fiscal' sont ajoutées depuis 05_Module_Controle_Fiscal : le 09 n'a pas encore été aligné sur le 5e pilier.",
       "begin;", "insert into public.document_templates (sort_order, category, name, source) values"]
out.append(",\n".join("(%d,'%s','%s','%s')" % (i, c, esc(nm), s) for i, c, nm, s in docs) + "\non conflict (category, name) do nothing;")
out.append("commit;")
open(os.path.join(ROOT, '0002_document_templates.sql'), 'w').write("\n".join(out) + "\n")
print('control_points:', len(rows), '| document_templates:', len(docs))
