export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <main className="min-h-dvh bg-fond">
      <div className="mx-auto flex min-h-dvh w-full max-w-md flex-col justify-center px-5 py-16">{children}</div>
    </main>
  );
}
