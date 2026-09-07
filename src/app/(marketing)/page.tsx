export default function HomePage() {
  return (
    <section className="space-y-6">
      <p className="text-sm font-medium uppercase tracking-wide text-[var(--anm-blue)]">
        Sécurité privée · CNAPS · URSSAF · Inspection du travail
      </p>
      <h1 className="text-4xl font-bold text-[var(--anm-navy)]">
        Passez vos contrôles sereinement.
      </h1>
      <p className="max-w-2xl text-lg text-gray-600">
        Audit 360°, formation en ligne et accompagnement conformité pour les dirigeants de
        sociétés de sécurité privée. 20 ans d&apos;expérience de dirigeante dans le secteur.
      </p>
      <div className="flex gap-4">
        <a href="/audit" className="rounded bg-[var(--anm-navy)] px-5 py-3 text-white">
          Découvrir l&apos;audit 360°
        </a>
        <a href="/formation" className="rounded border px-5 py-3">
          Voir les formations
        </a>
      </div>
    </section>
  );
}
