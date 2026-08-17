import { LabelHTMLAttributes, forwardRef } from "react";
import { cn } from "@/app/lib/utils/cn";

const Label = forwardRef<
  HTMLLabelElement,
  LabelHTMLAttributes<HTMLLabelElement>
>(({ className, ...props }, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "mb-1.5 block text-sm font-medium text-[var(--foreground)]",
        className
      )}
      {...props}
    />
  );
});

Label.displayName = "Label";

export { Label };