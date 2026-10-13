"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

/**
 * Le formulaire du devis dit s'il porte des modifications non enregistrées, pour que le panneau
 * d'envoi, plus haut dans la page, refuse d'envoyer au client une version qui n'est pas la bonne.
 */
const Contexte = createContext<{ modifie: boolean; signaler: (modifie: boolean) => void }>({ modifie: false, signaler: () => {} });

export const ModifsDevis = ({ children }: { children: ReactNode }) => {
  const [modifie, signaler] = useState(false);
  return <Contexte.Provider value={{ modifie, signaler }}>{children}</Contexte.Provider>;
};

export const useModifsDevis = () => useContext(Contexte);
