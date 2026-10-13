import { renderToBuffer } from "@react-pdf/renderer";
import { DocumentDevis } from "./DocumentDevis";
import { partieCabinet, partieClient, type Cabinet, type ClientFiche } from "./donnees";
import type { DevisDocument } from "./devis";

export type CabinetDevis = Pick<Cabinet, "raison_sociale" | "forme_juridique" | "capital" | "adresse" | "code_postal" | "ville" | "siren" | "rcs_ville" | "franchise_tva">;
export type ClientDevis = Pick<ClientFiche, "name" | "siren" | "adresse" | "code_postal" | "ville" | "representant" | "representant_fonction">;

/**
 * Le PDF d'un devis. Une seule fabrique : ce que Sofia ouvre dans l'outil, la pièce jointe de
 * l'email et ce que le client télécharge depuis son lien sont le même document.
 */
export const produirePdfDevis = (devis: DevisDocument, cabinet: CabinetDevis, client: ClientDevis): Promise<Buffer> =>
  renderToBuffer(
    DocumentDevis({
      devis,
      vendeur: partieCabinet({ ...cabinet, capital: cabinet.capital === null ? null : Number(cabinet.capital) }),
      client: { ...partieClient(client), representant: client.representant, fonction: client.representant_fonction },
    }),
  );

export const nomPdfDevis = (numero: string, client: string) => `Devis-${numero}-${client.replace(/[^\p{L}\p{N}]+/gu, "-")}.pdf`;
