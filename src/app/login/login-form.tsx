"use client";

import { Formik, Form, Field } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/app/_lib/supabase/client";

import { Button } from "@/app/_components/ui/button";
import { Input } from "@/app/_components/ui/input";
import { FormField } from "@/app/_components/ui/form-field";
import { Alert } from "@/app/_components/ui/alert";
import { loginSchema } from "@/app/login/schema";

interface LoginValues {
  email: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [serverError, setServerError] = useState("");
  const [googleLoading, setGoogleLoading] = useState(false);

  const initialValues: LoginValues = {
    email: "",
    password: "",
  };

  async function handleSubmit(
    values: LoginValues,
    {
      setSubmitting,
    }: {
      setSubmitting: (isSubmitting: boolean) => void;
    },
  ) {
    setServerError("");

    const { error } = await supabase.auth.signInWithPassword({
      email: values.email,
      password: values.password,
    });

    if (error) {
      setServerError(error.message);
      setSubmitting(false);
      return;
    }

    router.push("/");
    router.refresh();
  }

  async function handleGoogleSignIn() {
    setServerError("");
    setGoogleLoading(true);

    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });

    if (error) {
      setServerError(error.message);
      setGoogleLoading(false);
    }
  }

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-5">
          {serverError && <Alert>{serverError}</Alert>}

          <FormField name="email" label="Email" required>
            <Field
              as={Input}
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
              disabled={googleLoading}
            />
          </FormField>

          <FormField name="password" label="Password" required>
            <Field
              as={Input}
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
              disabled={googleLoading}
            />
          </FormField>

          <Button type="submit" loading={isSubmitting} className="w-full">
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>

          <div className="relative py-1">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-[var(--border)]" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-[var(--surface)] px-2 text-xs text-[var(--muted)]">
                OR
              </span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full"
            loading={googleLoading}
            disabled={isSubmitting}
            onClick={handleGoogleSignIn}
          >
            {!googleLoading && (
              <svg aria-hidden="true" className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M21.35 12.27c0-.78-.07-1.53-.2-2.24H12v4.24h5.23a4.47 4.47 0 0 1-1.94 2.93v2.75h3.15c1.84-1.7 2.91-4.2 2.91-7.68Z"
                />
                <path
                  fill="#34A853"
                  d="M12 21.75c2.62 0 4.82-.87 6.44-2.36l-3.15-2.75c-.87.59-1.99.94-3.29.94-2.53 0-4.67-1.71-5.44-4.01H3.3v2.84A9.73 9.73 0 0 0 12 21.75Z"
                />
                <path
                  fill="#FBBC05"
                  d="M6.56 13.57A5.86 5.86 0 0 1 6.25 12c0-.55.1-1.08.31-1.57V7.59H3.3A9.75 9.75 0 0 0 2.25 12c0 1.57.38 3.05 1.05 4.41l3.26-2.84Z"
                />
                <path
                  fill="#EA4335"
                  d="M12 6.42c1.43 0 2.71.49 3.72 1.45l2.79-2.79C16.82 3.51 14.62 2.25 12 2.25A9.73 9.73 0 0 0 3.3 7.59l3.26 2.84C7.33 8.13 9.47 6.42 12 6.42Z"
                />
              </svg>
            )}
            {googleLoading
              ? "Redirecting to Google..."
              : "Continue with Google"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}
