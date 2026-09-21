import { redirect } from "next/navigation";

/** L'ancien onglet Dracar Ultimate est devenu le module CNAPS. */
export default async function DracarPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  redirect(`/admin/missions/${id}/cnaps`);
}
