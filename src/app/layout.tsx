import type { Metadata, Viewport } from "next";
import { Archivo, IBM_Plex_Mono, Instrument_Serif } from "next/font/google";
import "./globals.css";

/* Direction artistique validée le 07/09/2026 — voir globals.css. */
const serif = Instrument_Serif({
  weight: "400",
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const archivo = Archivo({
  subsets: ["latin"],
  variable: "--font-archivo",
  display: "swap",
});

const mono = IBM_Plex_Mono({
  weight: ["400", "500"],
  subsets: ["latin"],
  variable: "--font-plex-mono",
  display: "swap",
});

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "ANM Consulting — Audit et préparation aux contrôles en sécurité privée",
    template: "%s — ANM Consulting",
  },
  description:
    "CNAPS, URSSAF, DGFiP, Inspection du travail, sous-traitance : une photographie factuelle de vos risques et un plan d'actions daté, par une dirigeante du secteur depuis vingt ans.",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "ANM Consulting",
  },
};

export const viewport: Viewport = {
  themeColor: "#f6f7f5",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" className={`${serif.variable} ${archivo.variable} ${mono.variable}`}>
      <body className="grain min-h-screen antialiased">{children}</body>
    </html>
  );
}
