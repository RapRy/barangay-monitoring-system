import { InputHTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/lib/utils/cn";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  error?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, error, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "h-11 w-full rounded-lg border bg-white px-3 text-sm",
          "text-[var(--foreground)] placeholder:text-slate-400",
          "outline-none transition",
          "focus:ring-2 focus:ring-[var(--primary)]/20",
          error
            ? "border-[var(--danger)]"
            : "border-[var(--border)] focus:border-[var(--primary)]",
          "disabled:cursor-not-allowed disabled:bg-slate-100",
          className
        )}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };