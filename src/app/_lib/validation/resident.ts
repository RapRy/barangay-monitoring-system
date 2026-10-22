import { z } from "zod";

const birthDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Birth date must use YYYY-MM-DD.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "Birth date must be a valid date.");

const residentFields = {
  household_id: z.string().uuid("Select a valid household."),
  first_name: z
    .string()
    .trim()
    .min(1, "First name is required.")
    .max(100, "First name must not exceed 100 characters."),
  middle_name: z.string().trim().max(100).nullish(),
  last_name: z
    .string()
    .trim()
    .min(1, "Last name is required.")
    .max(100, "Last name must not exceed 100 characters."),
  birth_date: birthDateSchema,
  sex: z.enum(["Male", "Female", "Other"]),
  relationship: z
    .string()
    .trim()
    .min(1, "Relationship is required.")
    .max(100, "Relationship must not exceed 100 characters."),
};

export const createResidentSchema = z.object(residentFields);
export const updateResidentSchema = z.object(residentFields);
