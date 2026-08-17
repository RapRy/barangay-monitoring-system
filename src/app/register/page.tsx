import { RegisterForm } from "./register-form";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[var(--background)] p-4 sm:p-6">
      <div className="w-full max-w-md">
        <div className="rounded-xl border border-[var(--border)] bg-[var(--surface)] p-6 shadow-sm sm:p-8">
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-[var(--primary)]">
              <svg aria-hidden="true" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M19 8v6M22 11h-6" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[var(--foreground)]">
              Create an account
            </h1>

            <p className="mt-2 text-sm text-[var(--muted)]">
              Register your account to access the community monitoring system.
            </p>
          </div>

          <RegisterForm />
        </div>
      </div>
    </main>
  );
}
