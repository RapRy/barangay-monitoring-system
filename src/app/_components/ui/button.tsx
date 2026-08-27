import { ButtonHTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/_lib/utils/cn";
import { Spinner } from "@/app/_components/ui/spinner";

type ButtonVariant = "primary" | "secondary" | "outline" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  loading?: boolean;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = "primary",
      type = "button",
      loading = false,
      disabled,
      children,
      ...props
    },
    ref,
  ) => {
    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled || loading}
        className={cn(
          "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-medium transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30",
          "disabled:pointer-events-none disabled:opacity-50",

          variant === "primary" &&
            "bg-[var(--primary)] text-white hover:opacity-90",

          variant === "secondary" &&
            "bg-[var(--secondary)] text-[var(--secondary-foreground)] hover:bg-slate-200",

          variant === "outline" &&
            "border border-[var(--border)] bg-white hover:bg-slate-50",

          variant === "danger" &&
            "bg-[var(--danger)] text-white hover:opacity-90",

          className,
        )}
        {...props}
      >
        {loading && <Spinner size="sm" />}
        {children}
      </button>
    );
  },
);

Button.displayName = "Button";

export { Button };
