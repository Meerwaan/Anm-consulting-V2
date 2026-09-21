import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Un dossier de compilation séparé pour les tests locaux (NEXT_DIST_DIR=.next-test), afin
  // de ne pas écraser le `.next` d'un `next dev` qui tourne en parallèle.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Le rapport PDF est produit côté serveur par @react-pdf/renderer : paquet Node pur,
  // laissé hors du bundle, et ses polices (fichiers lus sur disque) embarquées avec la route.
  serverExternalPackages: ["@react-pdf/renderer"],
  outputFileTracingIncludes: {
    "/admin/missions/**": ["./src/lib/rapport/polices/**"],
  },
};

export default nextConfig;
