"use client";

import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";

import { Button } from "@/app/_components/ui/button";
import { FormField } from "@/app/_components/ui/form-field";
import { Input } from "@/app/_components/ui/input";
import { useUpdateCase } from "@/app/_lib/graphql/hooks/cases/use-update-case";
import type {
  CasePriority,
  CaseRecord,
  CaseStatus,
  CaseType,
  UpdateCaseInput,
} from "@/app/_lib/graphql/queries/cases";

interface EditCaseFormProps {
  caseRecord: CaseRecord;
  onSuccess: () => void;
  onCancel: () => void;
  onError: (message: string) => void;
}

const validationSchema = Yup.object({
  case_type: Yup.string()
    .oneOf(["SOCIAL_ASSISTANCE", "HEALTH_CONCERN", "INCIDENT"])
    .required("Case type is required."),
  title: Yup.string().trim().required("Title is required.").max(200),
  description: Yup.string().max(5000),
  status: Yup.string()
    .oneOf(["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"])
    .required("Status is required."),
  priority: Yup.string()
    .oneOf(["LOW", "MEDIUM", "HIGH", "URGENT"])
    .required("Priority is required."),
  follow_up_date: Yup.string().nullable(),
  resolution_notes: Yup.string().max(5000),
});

export default function EditCaseForm({
  caseRecord,
  onSuccess,
  onCancel,
  onError,
}: EditCaseFormProps) {
  const updateCase = useUpdateCase();

  const formik = useFormik({
    initialValues: {
      case_type: caseRecord.case_type,
      title: caseRecord.title,
      description: caseRecord.description ?? "",
      status: caseRecord.status,
      priority: caseRecord.priority,
      follow_up_date: caseRecord.follow_up_date ?? "",
      resolution_notes: caseRecord.resolution_notes ?? "",
    },
    validationSchema,
    onSubmit: async (values) => {
      const input: UpdateCaseInput = {
        case_type: values.case_type as CaseType,
        title: values.title.trim(),
        description: values.description.trim() || null,
        status: values.status as CaseStatus,
        priority: values.priority as CasePriority,
        follow_up_date: values.follow_up_date || null,
        resolution_notes: values.resolution_notes.trim() || null,
      };

      try {
        await updateCase.mutateAsync({ id: caseRecord.id, input });
        onSuccess();
      } catch (error) {
        onError(
          error instanceof Error ? error.message : "Unable to update case.",
        );
      }
    },
  });

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField name="case_type" label="Case type" required>
            <select
              id="case_type"
              name="case_type"
              value={formik.values.case_type}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm"
            >
              <option value="SOCIAL_ASSISTANCE">Social assistance</option>
              <option value="HEALTH_CONCERN">Health concern</option>
              <option value="INCIDENT">Incident report</option>
            </select>
          </FormField>

          <FormField name="status" label="Status" required>
            <select
              id="status"
              name="status"
              value={formik.values.status}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm"
            >
              <option value="OPEN">Open</option>
              <option value="IN_PROGRESS">In progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
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

          <FormField name="follow_up_date" label="Follow-up date">
            <Input
              id="follow_up_date"
              type="date"
              {...formik.getFieldProps("follow_up_date")}
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField name="title" label="Title" required>
              <Input
                id="title"
                {...formik.getFieldProps("title")}
                maxLength={200}
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
              />
            </FormField>
          </div>

          <div className="md:col-span-2">
            <FormField name="resolution_notes" label="Resolution notes">
              <textarea
                id="resolution_notes"
                {...formik.getFieldProps("resolution_notes")}
                rows={4}
                maxLength={5000}
                className="w-full rounded-lg border border-[var(--border)] bg-white p-3 text-sm"
                placeholder="Add notes when resolving or closing the case."
              />
            </FormField>
          </div>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={formik.isSubmitting || updateCase.isPending}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={formik.isSubmitting || updateCase.isPending}
          >
            Save Changes
          </Button>
        </div>
      </form>
    </FormikProvider>
  );
}
