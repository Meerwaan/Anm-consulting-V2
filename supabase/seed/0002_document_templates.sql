-- Seed de la liste de pièces standard d'une mission (checklist SUIVI_DOCUMENTS du 09_Dossier_Mission_Client).
-- Les 6 pièces 'fiscal' sont ajoutées depuis 05_Module_Controle_Fiscal : le 09 n'a pas encore été aligné sur le 5e pilier.
begin;
insert into public.document_templates (sort_order, category, name, source) values
(1,'entreprise','Kbis / RNE','09_Dossier_Mission_Client'),
(2,'entreprise','Organigramme','09_Dossier_Mission_Client'),
(3,'entreprise','Liste établissements','09_Dossier_Mission_Client'),
(4,'entreprise','Liste salariés','09_Dossier_Mission_Client'),
(5,'entreprise','Liste sous-traitants','09_Dossier_Mission_Client'),
(6,'cnaps','Autorisation(s) d’exercer','09_Dossier_Mission_Client'),
(7,'cnaps','Agrément(s) dirigeant','09_Dossier_Mission_Client'),
(8,'cnaps','Cartes professionnelles / échéances','09_Dossier_Mission_Client'),
(9,'cnaps','Exports / justificatifs outils CNAPS','09_Dossier_Mission_Client'),
(10,'cnaps','Devis / factures / contrats / CGV','09_Dossier_Mission_Client'),
(11,'cnaps','Contrats de sous-traitance','09_Dossier_Mission_Client'),
(12,'social','Registre unique du personnel','09_Dossier_Mission_Client'),
(13,'social','DPAE échantillon','09_Dossier_Mission_Client'),
(14,'social','Contrats / avenants','09_Dossier_Mission_Client'),
(15,'paie','Bulletins période testée','09_Dossier_Mission_Client'),
(16,'paie','Journaux paie / états contrôle','09_Dossier_Mission_Client'),
(17,'paie','DSN / états cohérence','09_Dossier_Mission_Client'),
(18,'paie','Primes / frais / paniers / indemnités','09_Dossier_Mission_Client'),
(19,'temps','Plannings prévisionnels / réalisés','09_Dossier_Mission_Client'),
(20,'temps','Pointages / mains courantes / relevés','09_Dossier_Mission_Client'),
(21,'temps','Historique remplacements','09_Dossier_Mission_Client'),
(22,'sst','DUERP','09_Dossier_Mission_Client'),
(23,'sst','Plans de prévention','09_Dossier_Mission_Client'),
(24,'sst','Suivi santé / SPST','09_Dossier_Mission_Client'),
(25,'sst','Accidents / incidents','09_Dossier_Mission_Client'),
(26,'social','Règlement intérieur si applicable','09_Dossier_Mission_Client'),
(27,'cse','Documents CSE si applicable','09_Dossier_Mission_Client'),
(28,'fiscal','FEC des exercices contrôlés','05_Module_Controle_Fiscal (ajout pilier fiscal)'),
(29,'fiscal','Balances, grands livres et comptes annuels','05_Module_Controle_Fiscal (ajout pilier fiscal)'),
(30,'fiscal','Liasses fiscales et déclarations TVA (CA3/CA12)','05_Module_Controle_Fiscal (ajout pilier fiscal)'),
(31,'fiscal','Journal des ventes et échantillon de factures clients','05_Module_Controle_Fiscal (ajout pilier fiscal)'),
(32,'fiscal','Journal des achats et factures fournisseurs / sous-traitants','05_Module_Controle_Fiscal (ajout pilier fiscal)'),
(33,'fiscal','Notes de frais et justificatifs des charges sensibles','05_Module_Controle_Fiscal (ajout pilier fiscal)')
on conflict (category, name) do nothing;
commit;
