import Link from "next/link";
import { Logo } from "@/components/marque/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-fond">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-16">
        <Link href="/" className="mb-10 block w-fit" aria-label="ANM Consulting, retour au site">
          <Logo largeur={160} prioritaire />
        </Link>
        {children}
      </div>
    </main>
  );
}
