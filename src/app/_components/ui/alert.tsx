import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/_lib/utils/cn";

interface AlertProps extends HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success" | "info" | "warning";
}

const Alert = forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "error", ...props }, ref) => {
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "rounded-lg border px-3 py-2 text-sm",

          variant === "error" && "border-red-200 bg-red-50 text-red-700",

          variant === "success" &&
            "border-green-200 bg-green-50 text-green-700",

          variant === "info" && "border-blue-200 bg-blue-50 text-blue-700",

          variant === "warning" &&
            "border-amber-200 bg-amber-50 text-amber-700",

          className,
        )}
        {...props}
      />
    );
  },
);

Alert.displayName = "Alert";

export { Alert };
