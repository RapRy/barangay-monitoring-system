"use client";

import { Formik, Form, Field } from "formik";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { createClient } from "@/app/lib/supabase/client";

import { Button } from "@/app/components/ui/button";
import { Input } from "@/app/components/ui/input";
import { FormField } from "@/app/components/ui/form-field";
import { Alert } from "@/app/components/ui/alert";
import { loginSchema } from "@/app/login/schema";

interface LoginValues {
  email: string;
  password: string;
}

export default function LoginForm() {
  const router = useRouter();
  const supabase = createClient();

  const [serverError, setServerError] = useState("");

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
    }
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

  return (
    <Formik
      initialValues={initialValues}
      validationSchema={loginSchema}
      onSubmit={handleSubmit}
    >
      {({ isSubmitting }) => (
        <Form className="space-y-5">
          {serverError && (
            <Alert>
              {serverError}
            </Alert>
          )}

          <FormField
            name="email"
            label="Email"
            required
          >
            <Field
              as={Input}
              id="email"
              name="email"
              type="email"
              placeholder="Enter your email"
            />
          </FormField>

          <FormField
            name="password"
            label="Password"
            required
          >
            <Field
              as={Input}
              id="password"
              name="password"
              type="password"
              placeholder="Enter your password"
            />
          </FormField>

          <Button
            type="submit"
            loading={isSubmitting}
            className="w-full"
          >
            {isSubmitting ? "Signing in..." : "Sign In"}
          </Button>
        </Form>
      )}
    </Formik>
  );
}