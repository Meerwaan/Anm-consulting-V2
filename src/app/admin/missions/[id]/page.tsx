import { redirect } from "next/navigation";

/** Une mission s'ouvre sur sa première étape : les pièces du dossier (barre latérale, 21/09/2026). */
export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/missions/${id}/pieces`);
}
