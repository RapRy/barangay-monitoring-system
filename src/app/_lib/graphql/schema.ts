import { createSchema } from "graphql-yoga";
import { requirePermission } from "./require-permissions";
import {
  createHouseholdSchema,
  updateHouseholdSchema,
} from "../validation/household";
import {
  createResidentSchema,
  updateResidentSchema,
} from "../validation/resident";
import { createCaseSchema, updateCaseSchema } from "../validation/case";
import {
  createSurveySchema,
  updateSurveySchema,
  surveyResidentResponsesSchema,
} from "../validation/survey";

import type { GraphQLContext } from "./context";
import { badUserInput, notFound } from "./errors";
import { handleSupabaseError } from "./database-error";

export const schema = createSchema<GraphQLContext>({
  typeDefs: /* GraphQL */ `
    enum Role {
      ADMIN
      STAFF
      VIEWER
    }

    type User {
      id: ID!
      email: String
      role: Role
    }

    type Household {
      id: ID!
      household_code: String
      household_name: String
      address: String
      purok: String
      barangay: String
      municipality: String
      postal_code: String
      province: String
      created_at: String!
      updated_at: String!
    }

    input HouseholdInput {
      household_code: String
      household_name: String
      address: String
      purok: String
      barangay: String
      postal_code: String
      municipality: String
      province: String
    }

    type Resident {
      id: ID!
      household_id: ID!
      household_name: String
      household_code: String
      first_name: String!
      middle_name: String
      last_name: String!
      birth_date: String!
      sex: String!
      relationship: String!
      created_at: String!
      updated_at: String!
    }

    input ResidentInput {
      household_id: ID!
      first_name: String!
      middle_name: String
      last_name: String!
      birth_date: String!
      sex: String!
      relationship: String!
    }

    type Survey {
      id: ID!
      household_id: ID!
      survey_date: String!
      surveyed_by: ID
      number_of_family_members: Int!
      source_of_income: String
      monthly_income: Float
      water_source: String
      has_electricity: Boolean
      has_internet: Boolean
      housing_condition: String
      assistance_needed: String
      notes: String
      created_at: String!
      updated_at: String!
    }

    type SurveyResidentResponse {
      id: ID!
      survey_id: ID!
      resident_id: ID
      resident_name: String!
      employment_status: String
      educational_status: String
      health_concerns: String
      created_at: String!
      updated_at: String!
    }

    input CreateSurveyInput {
      household_id: ID!
      survey_date: String
      number_of_family_members: Int!
      source_of_income: String
      monthly_income: Float
      water_source: String
      has_electricity: Boolean
      has_internet: Boolean
      housing_condition: String
      assistance_needed: String
      notes: String
    }

    input UpdateSurveyInput {
      survey_date: String
      number_of_family_members: Int
      source_of_income: String
      monthly_income: Float
      water_source: String
      has_electricity: Boolean
      has_internet: Boolean
      housing_condition: String
      assistance_needed: String
      notes: String
    }

    input SurveyResidentResponseInput {
      resident_id: ID!
      employment_status: String
      educational_status: String
      health_concerns: String
    }

    type Case {
      id: ID!
      household_id: ID!
      resident_id: ID
      resident_name: String!
      case_type: String!
      title: String!
      description: String
      status: String!
      priority: String!
      assigned_to: ID
      reported_at: String!
      follow_up_date: String
      resolution_notes: String
      created_by: ID
      created_at: String!
      updated_at: String!
    }

    input CreateCaseInput {
      household_id: ID!
      resident_id: ID!
      case_type: String!
      title: String!
      description: String
      priority: String
      assigned_to: ID
      reported_at: String
      follow_up_date: String
      resolution_notes: String
    }

    input UpdateCaseInput {
      case_type: String
      title: String
      description: String
      status: String
      priority: String
      assigned_to: ID
      reported_at: String
      follow_up_date: String
      resolution_notes: String
    }

    type Query {
      me: User
      households: [Household!]!
      household(id: ID): Household!
      householdByCode(householdCode: String!): Household
      residents(householdId: ID): [Resident!]!
      resident(id: ID!): Resident!
      surveys(householdId: ID): [Survey!]!
      survey(id: ID!): Survey!
      surveyResidentResponses(surveyId: ID!): [SurveyResidentResponse!]!
      cases(householdId: ID, residentId: ID): [Case!]!
      case(id: ID!): Case!
      testHouseholdCreatePermission: Boolean!
    }

    type Mutation {
      createHousehold(input: HouseholdInput!): Household!
      updateHousehold(id: ID!, input: HouseholdInput!): Household!
      deleteHousehold(id: ID!): Boolean!
      createResident(input: ResidentInput!): Resident!
      updateResident(id: ID!, input: ResidentInput!): Resident!
      deleteResident(id: ID!): Boolean!
      createSurvey(input: CreateSurveyInput!): Survey!
      updateSurvey(id: ID!, input: UpdateSurveyInput!): Survey!
      deleteSurvey(id: ID!): Boolean!
      saveSurveyResidentResponses(
        surveyId: ID!
        inputs: [SurveyResidentResponseInput!]!
      ): [SurveyResidentResponse!]!
      createCase(input: CreateCaseInput!): Case!
      updateCase(id: ID!, input: UpdateCaseInput!): Case!
      deleteCase(id: ID!): Boolean!
    }
  `,

  resolvers: {
    Query: {
      me: (_parent, _args, context) => {
        if (!context.user) {
          return null;
        }

        const roleMap = {
          admin: "ADMIN",
          staff: "STAFF",
          viewer: "VIEWER",
        } as const;

        return {
          id: context.user.id,
          email: context.user.email,
          role: context.role ? roleMap[context.role] : null,
        };
      },

      testHouseholdCreatePermission: async (_parent, _args, context) => {
        await requirePermission(context, "household.create");

        return true;
      },

      households: async (_parent, _args, context) => {
        await requirePermission(context, "household.read");

        const { data, error } = await context.supabase
          .from("households")
          .select("*")
          .order("created_at", {
            ascending: false,
          });

        if (error) {
          throw handleSupabaseError(error);
        }

        return data;
      },

      household: async (_parent, { id }, context) => {
        await requirePermission(context, "household.read");

        const { data, error } = await context.supabase
          .from("households")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (!data || data.length === 0) throw notFound("Household not found");

        if (error) {
          throw handleSupabaseError(error);
        }

        return data;
      },
      householdByCode: async (_parent, { householdCode }, context) => {
        await requirePermission(context, "household.read");

        const { data, error } = await context.supabase
          .from("households")
          .select("*")
          .eq("household_code", householdCode)
          .maybeSingle();

        if (error) throw handleSupabaseError(error);

        return data;
      },
      residents: async (_parent, { householdId }, context) => {
        await requirePermission(context, "resident.read");

        let query = context.supabase
          .from("residents")
          .select(
            `*,household:households!residents_household_id_fkey (household_name)`,
          )
          .order("created_at", { ascending: false });

        if (householdId) {
          query = query.eq("household_id", householdId);
        }

        const { data, error } = await query;

        if (error) throw handleSupabaseError(error);

        return (data ?? []).map(
          ({
            household,
            ...resident
          }: {
            household: { household_name: string | null } | null;
            [key: string]: unknown;
          }) => ({
            ...resident,
            household_name: household?.household_name ?? null,
          }),
        );
      },
      resident: async (_parent, { id }, context) => {
        await requirePermission(context, "resident.read");

        const { data, error } = await context.supabase
          .from("residents")
          .select(
            `
      *,
      household:households!residents_household_id_fkey (
        household_name,
        household_code
      )
    `,
          )
          .eq("id", id)
          .maybeSingle();

        if (error) throw handleSupabaseError(error);
        if (!data) throw notFound("Resident not found");

        const { household, ...residentData } = data as typeof data & {
          household: {
            household_name: string | null;
            household_code: string | null;
          } | null;
        };

        return {
          ...residentData,
          household_name: household?.household_name ?? null,
          household_code: household?.household_code ?? null,
        };
      },
      surveys: async (_parent, { householdId }, context) => {
        await requirePermission(context, "survey.read");

        let query = context.supabase
          .from("surveys")
          .select("*")
          .order("survey_date", { ascending: false })
          .order("created_at", { ascending: false });

        if (householdId) {
          query = query.eq("household_id", householdId);
        }

        const { data, error } = await query;

        if (error) throw handleSupabaseError(error);

        return data ?? [];
      },

      survey: async (_parent, { id }, context) => {
        await requirePermission(context, "survey.read");

        const { data, error } = await context.supabase
          .from("surveys")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw handleSupabaseError(error);
        if (!data) throw notFound("Survey not found");

        return data;
      },

      surveyResidentResponses: async (_parent, { surveyId }, context) => {
        await requirePermission(context, "survey.resident_response.read");

        const { data, error } = await context.supabase
          .from("survey_resident_responses")
          .select("*")
          .eq("survey_id", surveyId)
          .order("created_at", { ascending: true });

        if (error) throw handleSupabaseError(error);

        return data ?? [];
      },

      cases: async (_parent, { householdId, residentId }, context) => {
        await requirePermission(context, "case.read");

        let query = context.supabase
          .from("cases")
          .select("*")
          .order("reported_at", { ascending: false })
          .order("created_at", { ascending: false });

        if (householdId) query = query.eq("household_id", householdId);
        if (residentId) query = query.eq("resident_id", residentId);

        const { data, error } = await query;

        if (error) throw handleSupabaseError(error);

        return data ?? [];
      },

      case: async (_parent, { id }, context) => {
        await requirePermission(context, "case.read");

        const { data, error } = await context.supabase
          .from("cases")
          .select("*")
          .eq("id", id)
          .maybeSingle();

        if (error) throw handleSupabaseError(error);
        if (!data) throw notFound("Case not found");

        return data;
      },
    },

    Mutation: {
      createHousehold: async (_parent, { input }, context) => {
        await requirePermission(context, "household.create");

        const result = createHouseholdSchema.safeParse(input);

        if (!result.success) {
          throw badUserInput(
            result.error.issues[0].message ?? "Invalid Household data.",
          );
        }

        const validatedInput = result.data;

        const { data, error } = await context.supabase
          .from("households")
          .insert({
            household_name: validatedInput.household_name,
            household_code: validatedInput.household_code,
            address: validatedInput.address,
            purok: validatedInput.purok,
            barangay: validatedInput.barangay,
            municipality: validatedInput.municipality,
            postal_code: validatedInput.postal_code,
            province: validatedInput.province,
          })
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        return data;
      },

      updateHousehold: async (_parent, { id, input }, context) => {
        await requirePermission(context, "household.update");

        const result = updateHouseholdSchema.safeParse(input);

        if (!result.success) {
          throw badUserInput(
            result.error.issues[0].message ?? "Invalid Household data.",
          );
        }

        const validatedInput = result.data;

        const { data, error } = await context.supabase
          .from("households")
          .update({
            ...(validatedInput.household_code !== undefined && {
              household_code: validatedInput.household_code,
            }),
            ...(validatedInput.household_name !== undefined && {
              household_name: validatedInput.household_name,
            }),
            ...(validatedInput.address !== undefined && {
              address: validatedInput.address,
            }),
            ...(validatedInput.purok !== undefined && {
              purok: validatedInput.purok,
            }),
            ...(validatedInput.barangay !== undefined && {
              barangay: validatedInput.barangay,
            }),
            ...(validatedInput.municipality !== undefined && {
              municipality: validatedInput.municipality,
            }),
            ...(validatedInput.province !== undefined && {
              province: validatedInput.province,
            }),
            ...(validatedInput.postal_code !== undefined && {
              postal_code: validatedInput.postal_code,
            }),
          })
          .eq("id", id)
          .select()
          .maybeSingle();

        if (error) throw handleSupabaseError(error);

        if (!data) throw notFound("Household not found");

        return data;
      },

      deleteHousehold: async (_parent, { id }, context) => {
        await requirePermission(context, "household.delete");

        const { data, error } = await context.supabase
          .from("households")
          .delete()
          .eq("id", id)
          .select("id");

        if (error) throw handleSupabaseError(error);

        if (!data || data.length === 0) throw notFound("Household not found");

        return true;
      },

      createResident: async (_parent, { input }, context) => {
        await requirePermission(context, "resident.create");

        const result = createResidentSchema.safeParse(input);

        if (!result.success) {
          throw badUserInput(
            result.error.issues[0]?.message ?? "Invalid resident data.",
          );
        }

        const validatedInput = result.data;

        const { data, error } = await context.supabase
          .from("residents")
          .insert({
            household_id: validatedInput.household_id,
            first_name: validatedInput.first_name,
            middle_name: validatedInput.middle_name || null,
            last_name: validatedInput.last_name,
            birth_date: validatedInput.birth_date,
            sex: validatedInput.sex,
            relationship: validatedInput.relationship,
          })
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        return data;
      },
      updateResident: async (_parent, { id, input }, context) => {
        await requirePermission(context, "resident.update");

        const result = updateResidentSchema.safeParse(input);

        if (!result.success) {
          throw badUserInput(
            result.error.issues[0]?.message ?? "Invalid resident data.",
          );
        }

        const validatedInput = result.data;

        const { data, error } = await context.supabase
          .from("residents")
          .update({
            household_id: validatedInput.household_id,
            first_name: validatedInput.first_name,
            middle_name: validatedInput.middle_name || null,
            last_name: validatedInput.last_name,
            birth_date: validatedInput.birth_date,
            sex: validatedInput.sex,
            relationship: validatedInput.relationship,
          })
          .eq("id", id)
          .select()
          .maybeSingle();

        if (error) throw handleSupabaseError(error);
        if (!data) throw notFound("Resident not found");

        return data;
      },

      deleteResident: async (_parent, { id }, context) => {
        await requirePermission(context, "resident.delete");

        const { data, error } = await context.supabase
          .from("residents")
          .delete()
          .eq("id", id)
          .select("id");

        if (error) throw handleSupabaseError(error);
        if (!data || data.length === 0) {
          throw notFound("Resident not found");
        }

        return true;
      },

      createSurvey: async (_parent, { input }, context) => {
        await requirePermission(context, "survey.create");

        const result = createSurveySchema.safeParse(input);

        if (!result.success) {
          throw badUserInput(
            result.error.issues[0]?.message ?? "Invalid survey data.",
          );
        }

        const { data, error } = await context.supabase
          .from("surveys")
          .insert(result.data)
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        return data;
      },
      updateSurvey: async (_parent, { id, input }, context) => {
        await requirePermission(context, "survey.update");

        const result = updateSurveySchema.safeParse(input);

        if (!result.success) {
          throw badUserInput(
            result.error.issues[0]?.message ?? "Invalid survey data.",
          );
        }

        const { data, error } = await context.supabase
          .from("surveys")
          .update({
            ...result.data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .maybeSingle();

        if (error) throw handleSupabaseError(error);
        if (!data) throw notFound("Survey not found");

        return data;
      },
      deleteSurvey: async (_parent, { id }, context) => {
        await requirePermission(context, "survey.delete");

        const { data, error } = await context.supabase
          .from("surveys")
          .delete()
          .eq("id", id)
          .select("id");

        if (error) throw handleSupabaseError(error);
        if (!data || data.length === 0) {
          throw notFound("Survey not found");
        }

        return true;
      },
      saveSurveyResidentResponses: async (
        _parent,
        { surveyId, inputs },
        context,
      ) => {
        await requirePermission(context, "survey.update");
        await requirePermission(context, "survey.resident_response.read");

        const result = surveyResidentResponsesSchema.safeParse(inputs);

        if (!result.success) {
          throw badUserInput(
            result.error.issues[0]?.message ??
              "Invalid resident survey responses.",
          );
        }

        const { data: survey, error: surveyError } = await context.supabase
          .from("surveys")
          .select("id, household_id")
          .eq("id", surveyId)
          .maybeSingle();

        if (surveyError) throw handleSupabaseError(surveyError);
        if (!survey) throw notFound("Survey not found");

        if (result.data.length === 0) return [];

        const residentIds = result.data.map((response) => response.resident_id);

        const { data: residents, error: residentsError } =
          await context.supabase
            .from("residents")
            .select("id, first_name, middle_name, last_name")
            .eq("household_id", survey.household_id)
            .in("id", residentIds);

        if (residentsError) throw handleSupabaseError(residentsError);

        const residentsById = new Map(
          (
            (residents ?? []) as {
              id: string;
              first_name: string;
              middle_name: string | null;
              last_name: string;
            }[]
          ).map((resident) => [resident.id, resident] as const),
        );

        if (residentsById.size !== residentIds.length) {
          throw badUserInput(
            "Every resident response must belong to the survey's household.",
          );
        }

        const rows = result.data.map((response) => {
          const resident = residentsById.get(response.resident_id)!;

          return {
            survey_id: survey.id,
            resident_id: resident.id,
            resident_name: [
              resident.first_name,
              resident.middle_name,
              resident.last_name,
            ]
              .filter(Boolean)
              .join(" "),
            employment_status: response.employment_status ?? null,
            educational_status: response.educational_status ?? null,
            health_concerns: response.health_concerns ?? null,
            updated_at: new Date().toISOString(),
          };
        });

        const { data, error } = await context.supabase
          .from("survey_resident_responses")
          .upsert(rows, { onConflict: "survey_id,resident_id" })
          .select();

        if (error) throw handleSupabaseError(error);

        return data ?? [];
      },
      createCase: async (_parent, { input }, context) => {
        await requirePermission(context, "case.create");

        const result = createCaseSchema.safeParse(input);

        if (!result.success) {
          throw badUserInput(
            result.error.issues[0]?.message ?? "Invalid case data.",
          );
        }

        const validatedInput = result.data;

        // Validate the resident/household pair on the server and construct
        // the name snapshot; never accept resident_name from the client.
        const { data: resident, error: residentError } = await context.supabase
          .from("residents")
          .select("id, household_id, first_name, middle_name, last_name")
          .eq("id", validatedInput.resident_id)
          .maybeSingle();

        if (residentError) throw handleSupabaseError(residentError);
        if (!resident) throw notFound("Resident not found");

        if (resident.household_id !== validatedInput.household_id) {
          throw badUserInput(
            "The selected resident does not belong to the selected household.",
          );
        }

        const residentName = [
          resident.first_name,
          resident.middle_name,
          resident.last_name,
        ]
          .filter(Boolean)
          .join(" ");

        const { data, error } = await context.supabase
          .from("cases")
          .insert({
            ...validatedInput,
            resident_name: residentName,
          })
          .select()
          .single();

        if (error) throw handleSupabaseError(error);

        return data;
      },

      updateCase: async (_parent, { id, input }, context) => {
        await requirePermission(context, "case.update");

        const result = updateCaseSchema.safeParse(input);

        if (!result.success) {
          throw badUserInput(
            result.error.issues[0]?.message ?? "Invalid case data.",
          );
        }

        const { data, error } = await context.supabase
          .from("cases")
          .update({
            ...result.data,
            updated_at: new Date().toISOString(),
          })
          .eq("id", id)
          .select()
          .maybeSingle();

        if (error) throw handleSupabaseError(error);
        if (!data) throw notFound("Case not found");

        return data;
      },

      deleteCase: async (_parent, { id }, context) => {
        await requirePermission(context, "case.delete");

        const { data, error } = await context.supabase
          .from("cases")
          .delete()
          .eq("id", id)
          .select("id");

        if (error) throw handleSupabaseError(error);
        if (!data || data.length === 0) throw notFound("Case not found");

        return true;
      },
    },
  },
});
