interface EmptyStateProps {
  title: string;
  description?: string;
}

export function EmptyState({
  title,
  description,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[250px] flex-col items-center justify-center rounded-xl border border-dashed border-[var(--border)] bg-white p-6 text-center">
      <h3 className="text-sm font-semibold">
        {title}
      </h3>

      {description && (
        <p className="mt-1 max-w-sm text-sm text-[var(--muted)]">
          {description}
        </p>
      )}
    </div>
  );
}