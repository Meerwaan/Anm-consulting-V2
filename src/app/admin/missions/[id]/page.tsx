import { redirect } from "next/navigation";

/** Une mission s'ouvre sur sa première étape : l'écran est un déroulé, pas un tableau de bord. */
export default async function MissionPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/missions/${id}/etapes/1`);
}
