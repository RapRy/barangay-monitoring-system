import { z } from "zod";

const surveyDateSchema = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "Survey date must use YYYY-MM-DD.")
  .refine((value) => {
    const date = new Date(`${value}T00:00:00.000Z`);
    return (
      !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
    );
  }, "Survey date must be a valid date.");

const optionalText = (max: number) => z.string().trim().max(max).nullish();

const surveyFields = {
  number_of_family_members: z.number().int().positive(),
  source_of_income: optionalText(500),
  monthly_income: z.number().nonnegative().nullish(),
  water_source: optionalText(200),
  has_electricity: z.boolean().nullish(),
  has_internet: z.boolean().nullish(),
  housing_condition: optionalText(1000),
  assistance_needed: optionalText(1000),
  notes: optionalText(2000),
};

export const createSurveySchema = z.object({
  household_id: z.string().uuid(),
  survey_date: surveyDateSchema.optional(),
  ...surveyFields,
});

export const updateSurveySchema = z
  .object({
    survey_date: surveyDateSchema.optional(),
    number_of_family_members: surveyFields.number_of_family_members.optional(),
    source_of_income: surveyFields.source_of_income,
    monthly_income: surveyFields.monthly_income,
    water_source: surveyFields.water_source,
    has_electricity: surveyFields.has_electricity,
    has_internet: surveyFields.has_internet,
    housing_condition: surveyFields.housing_condition,
    assistance_needed: surveyFields.assistance_needed,
    notes: surveyFields.notes,
  })
  .refine(
    (input) => Object.values(input).some((value) => value !== undefined),
    {
      message: "Provide at least one field to update.",
    },
  );

export const surveyResidentResponsesSchema = z
  .array(
    z.object({
      resident_id: z.string().uuid(),
      employment_status: optionalText(200),
      educational_status: optionalText(200),
      health_concerns: optionalText(2000),
    }),
  )
  .refine(
    (responses) =>
      new Set(responses.map((response) => response.resident_id)).size ===
      responses.length,
    { message: "A resident can only appear once per survey." },
  );
