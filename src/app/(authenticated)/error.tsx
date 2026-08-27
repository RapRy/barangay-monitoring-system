"use client";

import { useEffect } from "react";

import { Button } from "@/app/_components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-[400px] items-center justify-center p-6">
      <div className="max-w-md text-center">
        <h2 className="text-xl font-semibold">Something went wrong</h2>

        <p className="mt-2 text-sm text-[var(--muted)]">
          We couldn't load this page. Please try again.
        </p>

        <Button className="mt-5" onClick={() => reset()}>
          Try Again
        </Button>
      </div>
    </div>
  );
}
