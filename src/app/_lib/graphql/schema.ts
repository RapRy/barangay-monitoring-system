import { createSchema } from "graphql-yoga";
import { requirePermission } from "./require-permissions";
import {
  createHouseholdSchema,
  updateHouseholdSchema,
} from "../validation/household";

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
      household_code: String!
      address: String!
      purok: String!
      barangay: String!
      sector: String!
      municipality: String!
      created_at: String!
      updated_at: String!
    }

    input HouseholdInput {
      household_code: String!
      address: String!
      purok: String!
      barangay: String!
      sector: String!
      municipality: String!
    }

    type Query {
      me: User
      households: [Household!]!
      household(id: ID): Household!
      residents(householdId: ID): [Resident!]!
      testHouseholdCreatePermission: Boolean!
    }

    type Mutation {
      createHousehold(input: HouseholdInput!): Household!
      updateHousehold(id: ID!, input: HouseholdInput!): Household!
      deleteHousehold(id: ID!): Boolean!
      createResident(input: ResidentInput!): Resident!
      updateResident(id: ID!, input: ResidentInput!): Resident!
      deleteResident(id: ID!): Boolean!
    }
  `,

  resolvers: {
    Query: {
      me: (_parent, _args, context) => {
        if (!context.user) {
          return null;
        }

        return {
          id: context.user.id,
          email: context.user.email,
          role: context.role,
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
            household_no: validatedInput.household_no,
            address: validatedInput.address,
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
            ...(validatedInput.household_no !== undefined && {
              household_no: validatedInput.household_no,
            }),

            ...(validatedInput.address !== undefined && {
              address: validatedInput.address,
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
          .eq("id", id);

        if (error) throw handleSupabaseError(error);

        if (!data || data.length === 0) throw notFound("Household not found");

        return true;
      },
    },
  },
});
