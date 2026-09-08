-- Supabase accorde EXECUTE par défaut à anon et authenticated sur les fonctions du schéma
-- public : révoquer à PUBLIC seul ne suffit pas. Une fonction de trigger n'a besoin d'être
-- appelable par personne. (Reprise dans 0006 ; conservée ici car appliquée séparément.)
revoke execute on function public.actions_client_guard() from public, anon, authenticated;
