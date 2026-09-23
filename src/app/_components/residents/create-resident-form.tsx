"use client";

import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";

import { useHouseholds } from "@/app/_lib/graphql/hooks/households/use-households";
import { useCreateResident } from "@/app/_lib/graphql/hooks/residents/use-create-residents";

import { Button } from "@/app/_components/ui/button";
import { FormField } from "@/app/_components/ui/form-field";
import { Input } from "@/app/_components/ui/input";

interface CreateResidentFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (message: string) => void;
}

const validationSchema = Yup.object({
  household_id: Yup.string().trim().required("Household is required."),
  first_name: Yup.string().trim().required("First name is required."),
  middle_name: Yup.string().trim().optional(),
  last_name: Yup.string().trim().required("Last name is required."),
  birth_date: Yup.string().required("Birth date is required."),
  sex: Yup.string().trim().required("Sex is required."),
  relationship: Yup.string().trim().required("Relationship is required."),
});

export default function CreateResidentForm({
  onSuccess,
  onCancel,
  onError,
}: CreateResidentFormProps) {
  const { data: households = [], isLoading: isHouseholdsLoading } =
    useHouseholds();
  const createResident = useCreateResident();

  const formik = useFormik({
    initialValues: {
      household_id: "",
      first_name: "",
      middle_name: "",
      last_name: "",
      birth_date: "",
      sex: "",
      relationship: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createResident.mutateAsync({
          household_id: values.household_id,
          first_name: values.first_name.trim(),
          middle_name: values.middle_name?.trim() || null,
          last_name: values.last_name.trim(),
          birth_date: values.birth_date,
          sex: values.sex.trim(),
          relationship: values.relationship.trim(),
        });

        resetForm();
        onSuccess?.();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to create resident.";

        onError?.(message);
      }
    },
  });

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField name="household_id" label="Household" required>
            <select
              id="household_id"
              name="household_id"
              value={formik.values.household_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
              disabled={isHouseholdsLoading}
            >
              <option value="">Select household</option>
              {households.map((household) => (
                <option key={household.id} value={household.id}>
                  {household.household_code} - {household.household_name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField name="birth_date" label="Birth Date" required>
            <Input
              id="birth_date"
              type="date"
              {...formik.getFieldProps("birth_date")}
              error={Boolean(
                formik.touched.birth_date && formik.errors.birth_date,
              )}
            />
          </FormField>

          <FormField name="first_name" label="First Name" required>
            <Input
              id="first_name"
              {...formik.getFieldProps("first_name")}
              error={Boolean(
                formik.touched.first_name && formik.errors.first_name,
              )}
              placeholder="Juan"
            />
          </FormField>

          <FormField name="last_name" label="Last Name" required>
            <Input
              id="last_name"
              {...formik.getFieldProps("last_name")}
              error={Boolean(
                formik.touched.last_name && formik.errors.last_name,
              )}
              placeholder="Dela Cruz"
            />
          </FormField>

          <FormField name="middle_name" label="Middle Name">
            <Input
              id="middle_name"
              {...formik.getFieldProps("middle_name")}
              error={Boolean(
                formik.touched.middle_name && formik.errors.middle_name,
              )}
              placeholder="Optional"
            />
          </FormField>

          <FormField name="sex" label="Sex" required>
            <select
              id="sex"
              name="sex"
              value={formik.values.sex}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            >
              <option value="">Select sex</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </FormField>

          <div className="md:col-span-2">
            <FormField name="relationship" label="Relationship" required>
              <Input
                id="relationship"
                {...formik.getFieldProps("relationship")}
                error={Boolean(
                  formik.touched.relationship && formik.errors.relationship,
                )}
                placeholder="Head of Family"
              />
            </FormField>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={formik.isSubmitting || createResident.isPending}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={formik.isSubmitting || createResident.isPending}
          >
            Create Resident
          </Button>
        </div>
      </form>
    </FormikProvider>
  );
}