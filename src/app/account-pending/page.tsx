import Link from "next/link";

export default function AccountPendingPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-(--background) p-6">
      <section className="app-panel w-full max-w-md p-8 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-(--accent) text-xl text-(--accent-foreground)">
          <svg
            aria-hidden="true"
            className="h-6 w-6"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 7v5l3 2" />
          </svg>
        </div>

        <h1 className="mt-5 text-2xl font-semibold text-(--foreground)">
          Account pending approval
        </h1>

        <p className="mt-3 text-sm leading-6 text-(--muted)">
          Your registration was received. You’ll be able to sign in after a
          system administrator activates your account.
        </p>

        <Link
          href="/login"
          className="mt-6 inline-flex h-11 items-center justify-center rounded-lg bg-(--primary) px-5 text-sm font-semibold text-white hover:brightness-95"
        >
          Return to sign in
        </Link>
      </section>
    </main>
  );
}
