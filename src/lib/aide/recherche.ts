/** Minuscules, sans accents, apostrophes droites, espaces simples : ce que compare la recherche de l’Aide. */
export const normaliserRecherche = (texte: string): string =>
  texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[  ]/g, " ")
    .toLowerCase();
