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
          "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-4 text-sm font-semibold transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-(--primary)/30",
          "disabled:pointer-events-none disabled:opacity-55",

          variant === "primary" &&
            "bg-(--primary) text-(--primary-foreground) shadow-sm hover:brightness-95 active:brightness-90",

          variant === "secondary" &&
            "bg-(--secondary) text-(--secondary-foreground) shadow-sm hover:brightness-95 active:brightness-90",

          variant === "outline" &&
            "border border-(--border-strong) bg-(--surface) text-(--foreground) shadow-sm hover:bg-(--surface-muted) hover:border-(--primary)",

          variant === "danger" &&
            "bg-(--danger) text-white shadow-sm hover:bg-(--danger-hover) active:brightness-90",

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
