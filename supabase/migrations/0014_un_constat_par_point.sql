-- Un point de contrôle ne peut porter qu'un constat par mission.
-- Sans ça, deux clics rapprochés sur « Rédiger le constat » créent deux constats
-- jumeaux : la garde applicative (lire puis écrire) laisse passer la course.
create unique index findings_mission_point_uniq
  on public.findings (mission_id, control_point_id)
  where control_point_id is not null;
