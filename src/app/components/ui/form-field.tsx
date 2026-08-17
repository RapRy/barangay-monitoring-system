"use client";

import { ReactNode } from "react";
import { useField } from "formik";
import { Label } from "./label";
import { cn } from "@/app/lib/utils/cn";

interface FormFieldProps {
  name: string;
  label: string;
  required?: boolean;
  children: ReactNode;
}

export function FormField({
  name,
  label,
  required = false,
  children,
}: FormFieldProps) {
  const [field, meta] = useField(name);

  const hasError = Boolean(meta.touched && meta.error);

  return (
    <div>
      <Label htmlFor={name}>
        {label}

        {required && (
          <span className="ml-1 text-[var(--danger)]">*</span>
        )}
      </Label>

      <div
        className={cn(
          hasError && "[&>input]:border-[var(--danger)]"
        )}
      >
        {children}
      </div>

      {hasError && (
        <p className="mt-1 text-xs text-[var(--danger)]">
          {meta.error}
        </p>
      )}
    </div>
  );
}