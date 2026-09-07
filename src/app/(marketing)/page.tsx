import Link from "next/link";
import { PILIERS, POSITIONNEMENT } from "@/content/piliers";
import { METHODE_4_TEMPS } from "@/content/methode";

export default function HomePage() {
  return (
    <div className="space-y-16">
      <section className="space-y-6">
        <p className="text-sm font-medium uppercase tracking-wide text-[var(--anm-blue)]">
          {POSITIONNEMENT.sousTitre}
        </p>
        <h1 className="text-4xl font-bold text-[var(--anm-navy)]">{POSITIONNEMENT.titre}</h1>
        <p className="max-w-2xl text-lg text-gray-600">{POSITIONNEMENT.signature}</p>
        <div className="flex gap-4">
          <Link href="/audit" className="rounded bg-[var(--anm-navy)] px-5 py-3 text-white">
            Découvrir l&apos;audit 360°
          </Link>
          <Link href="/contact" className="rounded border px-5 py-3">
            Demander un diagnostic flash
          </Link>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--anm-navy)]">Cinq piliers d&apos;intervention</h2>
        <ol className="grid gap-6 md:grid-cols-2">
          {PILIERS.map((p, i) => (
            <li key={p.id} className="border-t pt-4">
              <p className="font-mono text-xs text-gray-500">0{i + 1} · {p.nbPoints} points de contrôle</p>
              <h3 className="mt-1 text-lg font-semibold">{p.nom}</h3>
              <p className="mt-2 text-sm text-gray-600">{p.description}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-semibold text-[var(--anm-navy)]">La méthode en quatre temps</h2>
        <ol className="grid gap-6 md:grid-cols-4">
          {METHODE_4_TEMPS.map((t, i) => (
            <li key={t.nom} className="border-t pt-4">
              <p className="font-mono text-xs text-gray-500">0{i + 1}</p>
              <h3 className="mt-1 font-semibold">{t.nom}</h3>
            </li>
          ))}
        </ol>
        <p className="max-w-2xl text-sm text-gray-600">{POSITIONNEMENT.limite}</p>
      </section>
    </div>
  );
}
