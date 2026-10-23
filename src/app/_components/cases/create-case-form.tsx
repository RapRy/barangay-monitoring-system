"use client";

import { useFormik, FormikProvider } from "formik";
import * as Yup from "yup";

import { Button } from "@/app/_components/ui/button";
import { FormField } from "@/app/_components/ui/form-field";
import { Input } from "@/app/_components/ui/input";
import { useCreateCase } from "@/app/_lib/graphql/hooks/cases/use-create-case";
import { useHouseholds } from "@/app/_lib/graphql/hooks/households/use-households";
import { useResidents } from "@/app/_lib/graphql/hooks/residents/use-residents";
import type {
  CasePriority,
  CaseType,
  CreateCaseInput,
} from "@/app/_lib/graphql/queries/cases";

interface CreateCaseFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  onError: (message: string) => void;
}

const validationSchema = Yup.object({
  household_id: Yup.string().required("Household is required."),
  resident_id: Yup.string().required("Resident is required."),
  case_type: Yup.string()
    .oneOf(["SOCIAL_ASSISTANCE", "HEALTH_CONCERN", "INCIDENT"])
    .required("Case type is required."),
  title: Yup.string().trim().required("Title is required.").max(200),
  description: Yup.string().max(5000),
  priority: Yup.string()
    .oneOf(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .required("Priority is required."),
  reported_at: Yup.string().required("Reported date is required."),
  follow_up_date: Yup.string().nullable(),
  resolution_notes: Yup.string().max(5000),
});

function getTodayDate() {
  const today = new Date();
  const localDate = new Date(
    today.getTime() - today.getTimezoneOffset() * 60_000,
  );

  return localDate.toISOString().slice(0, 10);
}

export default function CreateCaseForm({
  onSuccess,
  onCancel,
  onError,
}: CreateCaseFormProps) {
  const { data: households = [], isLoading: isHouseholdsLoading } =
    useHouseholds();
  const createCase = useCreateCase();

  const formik = useFormik({
    initialValues: {
      household_id: "",
      resident_id: "",
      case_type: "" as CaseType | "",
      title: "",
      description: "",
      priority: "MEDIUM" as CasePriority,
      reported_at: getTodayDate(),
      follow_up_date: "",
      resolution_notes: "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const input: CreateCaseInput = {
        household_id: values.household_id,
        resident_id: values.resident_id,
        case_type: values.case_type as CaseType,
        title: values.title.trim(),
        description: values.description.trim() || null,
        priority: values.priority,
        reported_at: values.reported_at,
        follow_up_date: values.follow_up_date || null,
        resolution_notes: values.resolution_notes.trim() || null,
      };

      try {
        await createCase.mutateAsync(input);
        onSuccess();
      } catch (error) {
        onError(
          error instanceof Error ? error.message : "Unable to create case.",
        );
      }
    },
  });

  const {
    data: residents = [],
    isLoading: isResidentsLoading,
    isError: isResidentsError,
    error: residentsError,
  } = useResidents(formik.values.household_id || undefined, {
    enabled: Boolean(formik.values.household_id),
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
              onBlur={formik.handleBlur}
              onChange={(event) => {
                formik.setFieldValue("household_id", event.target.value);
                formik.setFieldValue("resident_id", "");
              }}
              disabled={isHouseholdsLoading}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm"
            >
              <option value="">Select household</option>
              {households.map((household) => (
                <option key={household.id} value={household.id}>
                  {household.household_code} - {household.household_name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField name="resident_id" label="Resident" required>
            <select
              id="resident_id"
              name="resident_id"
              value={formik.values.resident_id}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              disabled={!formik.values.household_id || isResidentsLoading}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm disabled:bg-slate-100"
            >
              <option value="">
                {!formik.values.household_id
                  ? "Select a household first"
                  : isResidentsLoading
                    ? "Loading residents..."
                    : "Select resident"}
              </option>
              {residents.map((resident) => (
                <option key={resident.id} value={resident.id}>
                  {[
                    resident.first_name,
                    resident.middle_name,
                    resident.last_name,
                  ]
                    .filter(Boolean)
                    .join(" ")}
                </option>
              ))}
            </select>
            {isResidentsError && (
              <p className="mt-1 text-xs text-[var(--danger)]">
                {residentsError instanceof Error
                  ? residentsError.message
                  : "Unable to load residents."}
              </p>
            )}
            {formik.values.household_id &&
              !isResidentsLoading &&
              residents.length === 0 &&
              !isResidentsError && (
                <p className="mt-1 text-xs text-slate-500">
                  This household has no residents.
                </p>
              )}
          </FormField>

          <FormField name="case_type" label="Case type" required>
            <select
              id="case_type"
              name="case_type"
              value={formik.values.case_type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm"
            >
              <option value="">Select case type</option>
              <option value="SOCIAL_ASSISTANCE">Social assistance</option>
              <option value="HEALTH_CONCERN">Health concern</option>
              <option value="INCIDENT">Incident report</option>
            </select>
          </FormField>

          <FormField name="priority" label="Priority" required>
            <select
              id="priority"
              name="priority"
              value={formik.values.priority}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </FormField>

          <div className="md:col-span-2">
            <FormField name="title" label="Title" required>
              <Input
                id="title"
                {...formik.getFieldProps("title")}
                maxLength={200}
                placeholder="Brief case title"
              />
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField name="description" label="Description">
              <textarea
                id="description"
                {...formik.getFieldProps("description")}
                rows={4}
                maxLength={5000}
                className="w-full rounded-lg border border-[var(--border)] bg-white p-3 text-sm"
                placeholder="Describe the reported concern or incident."
              />
            </FormField>
          </div>

          <FormField name="reported_at" label="Reported date" required>
            <Input
              id="reported_at"
              type="date"
              {...formik.getFieldProps("reported_at")}
            />
          </FormField>

          <FormField name="follow_up_date" label="Follow-up date">
            <Input
              id="follow_up_date"
              type="date"
              {...formik.getFieldProps("follow_up_date")}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField name="resolution_notes" label="Resolution notes">
              <textarea
                id="resolution_notes"
                {...formik.getFieldProps("resolution_notes")}
                rows={3}
                maxLength={5000}
                className="w-full rounded-lg border border-[var(--border)] bg-white p-3 text-sm"
                placeholder="Optional notes"
              />
            </FormField>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={formik.isSubmitting || createCase.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={formik.isSubmitting || createCase.isPending}
            disabled={households.length === 0}
          >
            Create Case
          </Button>
        </div>
      </form>
    </FormikProvider>
  );
}
