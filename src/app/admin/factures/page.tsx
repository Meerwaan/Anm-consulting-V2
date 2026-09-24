import { redirect } from "next/navigation";

/** Les factures vivent désormais dans la page Commercial, avec les demandes, les devis et les contrats. */
export default function FacturesPage() {
  redirect("/admin/commercial#factures");
}
