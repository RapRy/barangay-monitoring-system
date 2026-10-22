"use client";

import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";

import { Button } from "@/app/_components/ui/button";
import { FormField } from "@/app/_components/ui/form-field";
import { Input } from "@/app/_components/ui/input";
import { useHouseholds } from "@/app/_lib/graphql/hooks/households/use-households";
import { useCreateSurvey } from "@/app/_lib/graphql/hooks/surveys/use-create-survey";

interface CreateSurveyFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (message: string) => void;
}

const validationSchema = Yup.object({
  household_id: Yup.string().trim().required("Household is required."),
  survey_date: Yup.string().optional(),
  number_of_family_members: Yup.number()
    .typeError("Number of family members is required.")
    .required("Number of family members is required.")
    .min(1, "Must be at least 1."),
  source_of_income: Yup.string().trim().optional(),
  monthly_income: Yup.number()
    .transform((value, originalValue) => {
      if (originalValue === "" || originalValue == null) return undefined;
      return Number(value);
    })
    .nullable()
    .optional(),
  water_source: Yup.string().trim().optional(),
  has_electricity: Yup.mixed().optional(),
  has_internet: Yup.mixed().optional(),
  housing_condition: Yup.string().trim().optional(),
  assistance_needed: Yup.string().trim().optional(),
  notes: Yup.string().trim().optional(),
});

export default function CreateSurveyForm({
  onSuccess,
  onCancel,
  onError,
}: CreateSurveyFormProps) {
  const { data: households = [], isLoading: isLoadingHouseholds } =
    useHouseholds();
  const createSurvey = useCreateSurvey();

  const formik = useFormik({
    initialValues: {
      household_id: "",
      survey_date: "",
      number_of_family_members: 1,
      source_of_income: "",
      monthly_income: "",
      water_source: "",
      has_electricity: "",
      has_internet: "",
      housing_condition: "",
      assistance_needed: "",
      notes: "",
    },
    validationSchema,
    onSubmit: async (values, { resetForm }) => {
      try {
        await createSurvey.mutateAsync({
          household_id: values.household_id,
          survey_date: values.survey_date || undefined,
          number_of_family_members: Number(values.number_of_family_members),
          source_of_income: values.source_of_income?.trim() || null,
          monthly_income:
            values.monthly_income === "" || values.monthly_income == null
              ? null
              : Number(values.monthly_income),
          water_source: values.water_source?.trim() || null,
          has_electricity:
            values.has_electricity === ""
              ? null
              : values.has_electricity === "true",
          has_internet:
            values.has_internet === "" ? null : values.has_internet === "true",
          housing_condition: values.housing_condition?.trim() || null,
          assistance_needed: values.assistance_needed?.trim() || null,
          notes: values.notes?.trim() || null,
        });

        resetForm();
        onSuccess?.();
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Unable to create survey.";

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
              disabled={isLoadingHouseholds}
            >
              <option value="">Select household</option>
              {households.map((household) => (
                <option key={household.id} value={household.id}>
                  {household.household_code} - {household.household_name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField name="survey_date" label="Survey Date">
            <Input
              id="survey_date"
              type="date"
              {...formik.getFieldProps("survey_date")}
            />
          </FormField>

          <FormField
            name="number_of_family_members"
            label="Number of Family Members"
            required
          >
            <Input
              id="number_of_family_members"
              type="number"
              min={1}
              {...formik.getFieldProps("number_of_family_members")}
              error={Boolean(
                formik.touched.number_of_family_members &&
                formik.errors.number_of_family_members,
              )}
            />
          </FormField>

          <FormField name="monthly_income" label="Monthly Income">
            <Input
              id="monthly_income"
              type="number"
              min={0}
              step="0.01"
              {...formik.getFieldProps("monthly_income")}
              error={Boolean(
                formik.touched.monthly_income && formik.errors.monthly_income,
              )}
            />
          </FormField>

          <FormField name="source_of_income" label="Source of Income">
            <Input
              id="source_of_income"
              {...formik.getFieldProps("source_of_income")}
              placeholder="Employment / Business"
            />
          </FormField>

          <FormField name="water_source" label="Water Source">
            <Input
              id="water_source"
              {...formik.getFieldProps("water_source")}
              placeholder="Deep well / piped water"
            />
          </FormField>

          <FormField name="has_electricity" label="Has Electricity">
            <select
              id="has_electricity"
              name="has_electricity"
              value={formik.values.has_electricity}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </FormField>

          <FormField name="has_internet" label="Has Internet">
            <select
              id="has_internet"
              name="has_internet"
              value={formik.values.has_internet}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
            >
              <option value="">Select</option>
              <option value="true">Yes</option>
              <option value="false">No</option>
            </select>
          </FormField>

          <div className="md:col-span-2">
            <FormField name="housing_condition" label="Housing Condition">
              <Input
                id="housing_condition"
                {...formik.getFieldProps("housing_condition")}
                placeholder="Describe housing condition"
              />
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField name="assistance_needed" label="Assistance Needed">
              <Input
                id="assistance_needed"
                {...formik.getFieldProps("assistance_needed")}
                placeholder="Specify needed assistance"
              />
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField name="notes" label="Notes">
              <textarea
                id="notes"
                rows={4}
                {...formik.getFieldProps("notes")}
                className="w-full rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--foreground)] outline-none transition focus:border-[var(--primary)] focus:ring-2 focus:ring-[var(--primary)]/20"
                placeholder="Additional notes"
              />
            </FormField>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={formik.isSubmitting || createSurvey.isPending}
          >
            Cancel
          </Button>

          <Button
            type="submit"
            loading={formik.isSubmitting || createSurvey.isPending}
          >
            Create Survey
          </Button>
        </div>
      </form>
    </FormikProvider>
  );
}
