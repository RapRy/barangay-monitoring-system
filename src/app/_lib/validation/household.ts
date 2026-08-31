import { z } from "zod";

export const createHouseholdSchema = z.object({
  household_no: z
    .string()
    .trim()
    .min(1, "Household code is required.")
    .max(50, "Household code must not exceed 50 characters."),

  address: z
    .string()
    .trim()
    .max(255, "Address must not exceed 255 characters.")
    .optional(),

  //   purok: z
  //     .string()
  //     .trim()
  //     .max(100, "Purok must not exceed 100 characters.")
  //     .optional(),

  //   barangay: z
  //     .string()
  //     .trim()
  //     .max(100, "Barangay must not exceed 100 characters.")
  //     .optional(),

  //   municipality: z
  //     .string()
  //     .trim()
  //     .max(100, "Municipality must not exceed 100 characters.")
  //     .optional(),

  //   province: z
  //     .string()
  //     .trim()
  //     .max(100, "Province must not exceed 100 characters.")
  //     .optional(),
});

export const updateHouseholdSchema = z.object({
  household_no: z
    .string()
    .trim()
    .min(1, "Household code cannot be empty.")
    .max(50, "Household code must not exceed 50 characters.")
    .optional(),

  address: z
    .string()
    .trim()
    .max(255, "Address must not exceed 255 characters.")
    .optional(),

  //   purok: z
  //     .string()
  //     .trim()
  //     .max(100, "Purok must not exceed 100 characters.")
  //     .optional(),

  //   barangay: z
  //     .string()
  //     .trim()
  //     .max(100, "Barangay must not exceed 100 characters.")
  //     .optional(),

  //   municipality: z
  //     .string()
  //     .trim()
  //     .max(100, "Municipality must not exceed 100 characters.")
  //     .optional(),

  //   province: z
  //     .string()
  //     .trim()
  //     .max(100, "Province must not exceed 100 characters.")
  //     .optional(),
});
