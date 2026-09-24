import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Un dossier de compilation séparé pour les tests locaux (NEXT_DIST_DIR=.next-test), afin
  // de ne pas écraser le `.next` d'un `next dev` qui tourne en parallèle.
  distDir: process.env.NEXT_DIST_DIR || ".next",
  // Les PDF (rapport, devis, contrat, factures) sont produits côté serveur par @react-pdf/renderer :
  // paquet Node pur, laissé hors du bundle. Ce qu'il lit sur disque doit être embarqué avec les
  // routes, sinon tout PDF échoue sur Vercel (et pas en local, où node_modules est entier) :
  // nos polices, et les polices standard de pdfkit (Helvetica, chargée à la création de chaque
  // document par un require dynamique que le traçage ne voit pas).
  serverExternalPackages: ["@react-pdf/renderer"],
  outputFileTracingIncludes: {
    "/admin/**": ["./src/lib/rapport/polices/**", "./node_modules/pdfkit/js/standard-fonts/**", "./node_modules/pdfkit/js/data/**"],
  },
};

export default nextConfig;
