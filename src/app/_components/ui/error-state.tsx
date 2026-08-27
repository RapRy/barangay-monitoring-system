import { Button } from "./button";

interface ErrorStateProps {
  title?: string;
  message?: string;
  onRetry?: () => void;
}

export function ErrorState({
  title = "Something went wrong",
  message = "We couldn't complete your request.",
  onRetry,
}: ErrorStateProps) {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center text-center">
      <div className="max-w-md">
        <h2 className="text-lg font-semibold text-[var(--foreground)]">
          {title}
        </h2>

        <p className="mt-2 text-sm text-[var(--muted)]">
          {message}
        </p>

        {onRetry && (
          <Button
            variant="outline"
            className="mt-4"
            onClick={onRetry}
          >
            Try Again
          </Button>
        )}
      </div>
    </div>
  );
}