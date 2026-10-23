import { z } from "zod";

const caseTypes = ["SOCIAL_ASSISTANCE", "HEALTH_CONCERN", "INCIDENT"] as const;
const caseStatuses = ["OPEN", "IN_PROGRESS", "RESOLVED", "CLOSED"] as const;
const casePriorities = ["LOW", "MEDIUM", "HIGH", "URGENT"] as const;

const dateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Date must use YYYY-MM-DD.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "Date must be valid.");

const optionalText = (max: number) => z.string().trim().max(max).nullish();

export const createCaseSchema = z.object({
  household_id: z.string().uuid("Select a valid household."),
  resident_id: z.string().uuid("Select a valid resident."),
  case_type: z.enum(caseTypes),
  title: z.string().trim().min(1, "Title is required.").max(200),
  description: optionalText(5000),
  priority: z.enum(casePriorities).optional(),
  assigned_to: z.string().uuid().nullish(),
  reported_at: dateSchema.optional(),
  follow_up_date: dateSchema.nullish(),
  resolution_notes: optionalText(5000),
});

export const updateCaseSchema = z
  .object({
    case_type: z.enum(caseTypes).optional(),
    title: z.string().trim().min(1).max(200).optional(),
    description: optionalText(5000),
    status: z.enum(caseStatuses).optional(),
    priority: z.enum(casePriorities).optional(),
    assigned_to: z.string().uuid().nullish(),
    reported_at: dateSchema.optional(),
    follow_up_date: dateSchema.nullish(),
    resolution_notes: optionalText(5000),
  })
  .refine(
    (input) => Object.values(input).some((value) => value !== undefined),
    {
      message: "Provide at least one field to update.",
    },
  );
