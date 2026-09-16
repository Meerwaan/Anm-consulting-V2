import { ORGANISMES } from "@/content/vitrine";

/** Bandeau des organismes et référentiels — deux copies pour une boucle sans couture. */
export function Marquee() {
  const liste = [...ORGANISMES, ...ORGANISMES];
  return (
    <div className="relative overflow-hidden border-y border-filet bg-papier py-4" aria-hidden>
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-linear-to-r from-papier to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-linear-to-l from-papier to-transparent" />
      <ul className="defilement flex w-max items-center gap-10 whitespace-nowrap">
        {liste.map((o, i) => (
          <li key={`${o}-${i}`} className="flex items-center gap-10 font-mono text-note uppercase tracking-[0.18em] text-gris" >
            {o}
            <span className="size-1 rounded-full bg-vert/50" />
          </li>
        ))}
      </ul>
    </div>
  );
}
