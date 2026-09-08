#!/usr/bin/env python3
"""
Audit de cohérence entre l'interface et la base.

Rattrape la famille de bugs qui ne se voit ni au typage ni au lint, et qui produit
une écriture refusée en silence : un champ que l'action serveur lit mais que le
formulaire n'envoie pas, ou une valeur d'énumération qui n'existe pas en base.

    python3 scripts/audit_coherence.py

Sort en code 1 si quelque chose cloche. À lancer avant chaque PR touchant le portail.
"""
import re
import sys
from pathlib import Path

RACINE = Path(__file__).resolve().parent.parent

# Énumérations de la base (migrations 0002, 0003, 0012). À mettre à jour si le schéma bouge.
ENUMS = {
    "action_status": {"a_faire", "en_cours", "clos", "accepte"},
    "audit_domain": {"gouvernance", "cnaps", "social", "paie", "temps", "urssaf",
                     "inspection_sst", "sous_traitance", "operationnel", "fiscal"},
    "check_result": {"oui", "non", "na", "a_verifier"},
    "control_status": {"conforme", "partiel", "non_conforme", "na", "a_verifier"},
    "finding_nature": {"risque_controle", "amelioration"},
    "finding_status": {"ouvert", "en_analyse", "valide", "clos"},
    "mission_type": {"flash", "cnaps", "social_urssaf", "inspection", "fiscal",
                     "audit_360", "suivi_conformite"},
    "priority": {"P1", "P2", "P3", "P4"},
    "rapprochement_kind": {"agents_cnaps_vs_paie", "heures_planning_vs_pointage",
                           "heures_pointage_vs_paie", "heures_paie_vs_facturation",
                           "sous_traitants_contrats_vs_vigilance", "effectif_paie_vs_dsn"},
    "severity": {"critique", "majeur", "modere", "mineur"},
    "etape_status": {"todo", "doing", "done", "na"},
}
CIBLES = {
    "statut": ["action_status", "control_status", "etape_status", "finding_status"],
    "priorite": ["priority"], "severity": ["severity"], "nature": ["finding_nature"],
    "domaine": ["audit_domain"], "type": ["mission_type"], "kind": ["rapprochement_kind"],
}

def sources(*motifs):
    for motif in motifs:
        yield from (RACINE / "src").rglob(motif)

def champs_envoyes():
    envoyes = {}
    for f in sources("*.tsx"):
        s = f.read_text(encoding="utf-8")
        for m in re.finditer(r"<form\s+[^>]*action=\{(\w+)\}(.*?)</form>", s, re.S):
            envoyes.setdefault(m.group(1), set()).update(re.findall(r'name="([^"]+)"', m.group(2)))
    return envoyes

def champs_lus():
    lus = {}
    for f in sources("actions.ts"):
        s = f.read_text(encoding="utf-8")
        for m in re.finditer(r"export const (\w+) = async \([^)]*\)[^{]*\{(.*?)\n\};", s, re.S):
            lus[m.group(1)] = set(re.findall(r'formData\.get\("([^"]+)"\)', m.group(2)))
    return lus

def main() -> int:
    soucis = []

    envoyes, lus = champs_envoyes(), champs_lus()
    for action, attendus in lus.items():
        if action not in envoyes:
            continue
        manquants = attendus - envoyes[action]
        if manquants:
            soucis.append(f"{action} lit {sorted(manquants)} — aucun formulaire ne l'envoie. "
                          "L'écriture partira avec une valeur nulle et sera refusée en silence.")

    for f in sources("*.tsx"):
        s = f.read_text(encoding="utf-8")
        for m in re.finditer(r'name="(\w+)"(.*?)</select>', s, re.S):
            champ, corps = m.group(1), m.group(2)
            if champ not in CIBLES:
                continue
            vals = {v for v in re.findall(r'<option[^>]*value="([^"]*)"', corps) if v}
            if not any(vals <= ENUMS[e] for e in CIBLES[champ]):
                proche = min((ENUMS[e] for e in CIBLES[champ]), key=lambda E: len(vals - E))
                soucis.append(f"{f.relative_to(RACINE)} · « {champ} » propose "
                              f"{sorted(vals - proche)}, absent de l'énumération en base.")

    if soucis:
        print("Incohérences :")
        for s in soucis:
            print(f"  - {s}")
        return 1
    print("Formulaires, actions serveur et énumérations : cohérents.")
    return 0

if __name__ == "__main__":
    sys.exit(main())
