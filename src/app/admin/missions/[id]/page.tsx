import { redirect } from "next/navigation";

/** Une mission s'ouvre sur la sous-traitance : c'est le cœur du contrôle (vision de Sofia, 21/09/2026). */
export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/missions/${id}/sous-traitance`);
}
