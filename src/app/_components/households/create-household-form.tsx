"use client";

import { FormikProvider, useFormik } from "formik";
import * as Yup from "yup";

import { useCreateHousehold } from "@/app/_lib/graphql/hooks/households/use-create-household";

import { Button } from "@/app/_components/ui/button";
import { FormField } from "@/app/_components/ui/form-field";
import { Input } from "@/app/_components/ui/input";

interface CreateHouseholdFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
  onError?: (message: string) => void;
}

const validationSchema = Yup.object({
  household_code: Yup.string().trim().required("Household code is required."),

  address: Yup.string().trim().required("Address is required."),

  purok: Yup.string().trim().required("Purok is required."),

  barangay: Yup.string().trim().required("Barangay is required."),

  municipality: Yup.string().trim().required("Municipality is required."),

  province: Yup.string().trim().required("Province is required."),

  postal_code: Yup.string().trim().required("Postal code is required."),
});

export default function CreateHouseholdForm({
  onSuccess,
  onCancel,
  onError,
}: CreateHouseholdFormProps) {
  const createHousehold = useCreateHousehold();

  const formik = useFormik({
    initialValues: {
      household_code: "",
      address: "",
      purok: "",
      barangay: "",
      municipality: "",
      province: "",
      postal_code: "",
    },

    validationSchema,

    onSubmit: async (values, { resetForm }) => {
      try {
        await createHousehold.mutateAsync(values);

        resetForm();

        onSuccess?.();
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to create household.";

        onError?.(message);
      }
    },
  });

  return (
    <FormikProvider value={formik}>
      <form onSubmit={formik.handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <FormField name="household_code" label="Household Code" required>
            <Input
              id="household_code"
              {...formik.getFieldProps("household_code")}
              error={Boolean(
                formik.touched.household_code && formik.errors.household_code,
              )}
              placeholder="HH-001"
            />
          </FormField>

          <FormField name="purok" label="Purok" required>
            <Input
              id="purok"
              {...formik.getFieldProps("purok")}
              error={Boolean(formik.touched.purok && formik.errors.purok)}
              placeholder="Purok 1"
            />
          </FormField>

          <div className="md:col-span-2">
            <FormField name="address" label="Address" required>
              <Input
                id="address"
                {...formik.getFieldProps("address")}
                error={Boolean(formik.touched.address && formik.errors.address)}
                placeholder="House / Street"
              />
            </FormField>
          </div>

          <FormField name="barangay" label="Barangay" required>
            <Input
              id="barangay"
              {...formik.getFieldProps("barangay")}
              error={Boolean(formik.touched.barangay && formik.errors.barangay)}
              placeholder="Barangay Sample"
            />
          </FormField>

          <FormField name="municipality" label="Municipality" required>
            <Input
              id="municipality"
              {...formik.getFieldProps("municipality")}
              error={Boolean(
                formik.touched.municipality && formik.errors.municipality,
              )}
              placeholder="Sample Municipality"
            />
          </FormField>

          <FormField name="province" label="Province" required>
            <Input
              id="province"
              {...formik.getFieldProps("province")}
              error={Boolean(formik.touched.province && formik.errors.province)}
              placeholder="Sample Province"
            />
          </FormField>

          <FormField name="postal_code" label="Postal Code" required>
            <Input
              id="postal_code"
              {...formik.getFieldProps("postal_code")}
              error={Boolean(
                formik.touched.postal_code && formik.errors.postal_code,
              )}
              placeholder="2500"
            />
          </FormField>
        </div>

        <div className="flex justify-end gap-3 border-t pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={formik.isSubmitting}
          >
            Cancel
          </Button>

          <Button type="submit" loading={formik.isSubmitting}>
            Create Household
          </Button>
        </div>
      </form>
    </FormikProvider>
  );
}
