import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "ANM Consulting — Audit, conformité et formation en sécurité privée",
  description:
    "CNAPS, URSSAF, Inspection du travail, social, sous-traitance : préparez sereinement vos contrôles. 20 ans d'expérience de dirigeante en sécurité privée.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
