"use client";

import { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";

import { createClient } from "@/app/lib/supabase/client";

interface RegisterFormValues {
  fullName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

const validationSchema = Yup.object({
  fullName: Yup.string().trim().required("Full name is required"),
  email: Yup.string()
    .email("Please enter a valid email address")
    .required("Email is required"),
  password: Yup.string()
    .min(8, "Password must be at least 8 characters")
    .required("Password is required"),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref("password")], "Passwords do not match")
    .required("Please confirm your password"),
});

export function RegisterForm() {
  const supabase = createClient();
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const formik = useFormik<RegisterFormValues>({
    initialValues: {
      fullName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
    validationSchema,
    onSubmit: async (values, { setSubmitting, resetForm }) => {
      setSuccessMessage("");
      setErrorMessage("");

      try {
        const { error } = await supabase.auth.signUp({
          email: values.email,
          password: values.password,
          options: { data: { full_name: values.fullName } },
        });

        if (error) {
          setErrorMessage(error.message);
          return;
        }

        setSuccessMessage(
          "Account created successfully. Please check your email to verify your account."
        );
        resetForm();
      } catch {
        setErrorMessage("Something went wrong. Please try again.");
      } finally {
        setSubmitting(false);
      }
    },
  });

  async function handleGoogleLogin() {
    setErrorMessage("");
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    });

    if (error) {
      setErrorMessage(error.message);
      setGoogleLoading(false);
    }
  }

  const disabled = formik.isSubmitting || googleLoading;
  const inputClass = (hasError: boolean) =>
    `h-11 w-full rounded-lg border bg-white px-3 text-sm text-[var(--foreground)] outline-none transition placeholder:text-slate-400 focus:ring-2 focus:ring-[var(--primary)]/20 disabled:cursor-not-allowed disabled:bg-slate-100 ${
      hasError
        ? "border-[var(--danger)]"
        : "border-[var(--border)] focus:border-[var(--primary)]"
    }`;

  return (
    <div className="space-y-6">
      <button
        type="button"
        onClick={handleGoogleLogin}
        disabled={disabled}
        className="flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium text-[var(--foreground)] transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 disabled:pointer-events-none disabled:opacity-60"
      >
        {googleLoading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-[var(--primary)]" />
            Redirecting to Google...
          </>
        ) : (
          <>
            <GoogleIcon />
            Continue with Google
          </>
        )}
      </button>

      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <span className="w-full border-t border-[var(--border)]" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-white px-3 text-xs font-medium uppercase tracking-wide text-[var(--muted)]">
            Or register with email
          </span>
        </div>
      </div>

      <form onSubmit={formik.handleSubmit} className="space-y-5">
        <FormInput
          id="fullName"
          label="Full name"
          placeholder="Juan Dela Cruz"
          value={formik.values.fullName}
          error={formik.touched.fullName ? formik.errors.fullName : undefined}
          disabled={disabled}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={inputClass(Boolean(formik.touched.fullName && formik.errors.fullName))}
        />
        <FormInput
          id="email"
          label="Email"
          type="email"
          placeholder="juan@example.com"
          value={formik.values.email}
          error={formik.touched.email ? formik.errors.email : undefined}
          disabled={disabled}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={inputClass(Boolean(formik.touched.email && formik.errors.email))}
        />
        <FormInput
          id="password"
          label="Password"
          type="password"
          placeholder="Enter a secure password"
          value={formik.values.password}
          error={formik.touched.password ? formik.errors.password : undefined}
          disabled={disabled}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={inputClass(Boolean(formik.touched.password && formik.errors.password))}
        />
        <FormInput
          id="confirmPassword"
          label="Confirm password"
          type="password"
          placeholder="Re-enter your password"
          value={formik.values.confirmPassword}
          error={formik.touched.confirmPassword ? formik.errors.confirmPassword : undefined}
          disabled={disabled}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={inputClass(Boolean(formik.touched.confirmPassword && formik.errors.confirmPassword))}
        />

        {errorMessage && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {errorMessage}
          </div>
        )}
        {successMessage && (
          <div role="status" className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {successMessage}
          </div>
        )}

        <button
          type="submit"
          disabled={disabled}
          className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white transition hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]/30 disabled:pointer-events-none disabled:opacity-60"
        >
          {formik.isSubmitting && <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/50 border-t-white" />}
          {formik.isSubmitting ? "Creating account..." : "Create account"}
        </button>
      </form>
    </div>
  );
}

interface FormInputProps {
  id: string;
  label: string;
  type?: string;
  placeholder: string;
  value: string;
  error?: string;
  disabled: boolean;
  className: string;
  onChange: React.ChangeEventHandler<HTMLInputElement>;
  onBlur: React.FocusEventHandler<HTMLInputElement>;
}

function FormInput({ id, label, type = "text", error, ...props }: FormInputProps) {
  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[var(--foreground)]">
        {label}
      </label>
      <input id={id} name={id} type={type} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined} {...props} />
      {error && <p id={`${id}-error`} className="mt-1 text-xs text-[var(--danger)]">{error}</p>}
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
      <path fill="#4285F4" d="M21.35 12.27c0-.78-.07-1.53-.2-2.24H12v4.24h5.23a4.47 4.47 0 0 1-1.94 2.93v2.75h3.15c1.84-1.7 2.91-4.2 2.91-7.68Z" />
      <path fill="#34A853" d="M12 21.75c2.62 0 4.82-.87 6.44-2.36l-3.15-2.75c-.87.59-1.99.94-3.29.94-2.53 0-4.67-1.71-5.44-4.01H3.3v2.84A9.73 9.73 0 0 0 12 21.75Z" />
      <path fill="#FBBC05" d="M6.56 13.57A5.86 5.86 0 0 1 6.25 12c0-.55.1-1.08.31-1.57V7.59H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.41l3.26-2.84Z" />
      <path fill="#EA4335" d="M12 6.42c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.82 3.51 14.62 2.25 12 2.25A9.73 9.73 0 0 0 3.3 7.59l3.26 2.84C7.33 8.13 9.47 6.42 12 6.42Z" />
    </svg>
  );
}
