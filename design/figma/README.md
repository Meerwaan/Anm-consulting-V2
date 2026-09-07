# Scripts Figma (use_figma / Plugin API)

Fichier Figma : https://www.figma.com/design/p1aumcUgvqswiOekpoLbl6
Pages : `00 Design system` (0:1) · `01 Vitrine` (1:3) · `02 Portail` (1:2)

Chaque script `NN_*.js` est autonome (helpers inclus) et se colle tel quel dans
l'outil `use_figma` du MCP Figma, ou dans un plugin Figma "Scripter".
Il crée un frame complet en auto-layout dans la DA validée
(Instrument Serif + Archivo + IBM Plex Mono, blanc froid / encre / vert profond).

- `10_design_system.js` — palette, typo, actions, fiche de constat, index, avancement 15 étapes (déjà exécuté)
- `20_vitrine_accueil.js` — page Accueil 1440 (déjà exécuté)
- `30_portail_client_mission360.js` — tableau de bord client : 15 étapes, KPIs, risque par domaine, plan d'actions, fiche, pièces, journal (à exécuter)
- `31_portail_admin_saisie_constat.js` — écran de saisie d'un constat par Maman avec aperçu client (à exécuter)

Bloqués le 07/09/2026 par la limite d'appels du plan Figma Starter.
