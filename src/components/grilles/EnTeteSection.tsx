/** Titre et chapeau d'une partie de module. */
const EnTeteSection = ({ id, titre, texte }: { id: string; titre: string; texte?: string }) => (
  <div>
    <h3 id={id} className="font-display text-t4 text-encre">{titre}</h3>
    {texte ? <p className="mt-1 max-w-2xl text-meta text-encre-2">{texte}</p> : null}
  </div>
);

export default EnTeteSection;
