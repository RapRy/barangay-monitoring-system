import { HTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/_lib/utils/cn";

const Card = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={cn(
          "rounded-xl border border-[var(--border)] bg-[var(--surface)] shadow-sm",
          className,
        )}
        {...props}
      />
    );
  },
);

Card.displayName = "Card";

export { Card };
