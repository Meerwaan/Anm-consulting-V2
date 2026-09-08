-- Le pack demande la « liste des sous-traitants » mais aucune des pièces qui font
-- la preuve de la vigilance. La catégorie manquait : elle est ajoutée à part, une
-- valeur d'énumération ne pouvant pas être créée et utilisée dans la même transaction.
alter type public.document_category add value if not exists 'sous_traitance';
