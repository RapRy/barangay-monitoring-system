import { Card } from "@/app/components/ui/card";
import LoginForm from "@/app/login/login-form";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center p-6">
      <Card className="w-full max-w-md p-6 sm:p-8">
        <div className="mb-8 text-center">
          <h1 className="text-2xl font-bold tracking-tight">
            Barangay Monitoring
          </h1>

          <p className="mt-2 text-sm text-[var(--muted)]">
            Community Information System
          </p>
        </div>

        <LoginForm />
      </Card>
    </main>
  );
}