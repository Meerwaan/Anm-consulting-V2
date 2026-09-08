-- Les vues étaient lisibles par le rôle `anon`. La RLS des tables sous-jacentes les rend
-- vides pour un visiteur non connecté (elles sont en security_invoker), donc rien ne fuyait —
-- mais une surface d'API ouverte sans raison finit toujours par servir. On la ferme.
revoke select on public.mission_step_completeness      from anon;
revoke select on public.mission_points_hors_etape      from anon;
revoke select on public.mission_documents_validite     from anon;
revoke select on public.mission_reconciliation_status  from anon;
revoke select on public.document_requests_a_relancer   from anon;
revoke select on public.mission_dashboard              from anon;
revoke select on public.mission_module_completeness    from anon;
