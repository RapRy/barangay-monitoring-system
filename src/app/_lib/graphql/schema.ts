import { createSchema } from "graphql-yoga";
import { GraphQLError } from "graphql";
import { requirePermission } from "./require-permissions";

import type { GraphQLContext } from "./context";

type HouseholdRow = {
  id: string;
  household_no: string;
  address: string;
  created_at: string;
  updated_at: string;
};

type ResidentRow = {
  id: string;
  household_id: string;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  birth_date: string;
  sex: string;
  relationship: string;
  created_at: string;
  updated_at: string;
};

const toHousehold = (household: HouseholdRow) => ({
  id: household.id,
  householdNo: household.household_no,
  address: household.address,
  createdAt: household.created_at,
  updatedAt: household.updated_at,
});

const toResident = (resident: ResidentRow) => ({
  id: resident.id,
  householdId: resident.household_id,
  firstName: resident.first_name,
  middleName: resident.middle_name,
  lastName: resident.last_name,
  birthDate: resident.birth_date,
  sex: resident.sex,
  relationship: resident.relationship,
  createdAt: resident.created_at,
  updatedAt: resident.updated_at,
});

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
      householdNo: String!
      address: String!
      createdAt: String!
      updatedAt: String!
    }

    type Resident {
      id: ID!
      householdId: ID!
      firstName: String!
      middleName: String
      lastName: String!
      birthDate: String!
      sex: String!
      relationship: String!
      createdAt: String!
      updatedAt: String!
    }

    input HouseholdInput {
      householdNo: String!
      address: String!
    }

    input ResidentInput {
      householdId: ID!
      firstName: String!
      middleName: String
      lastName: String!
      birthDate: String!
      sex: String!
      relationship: String!
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
          throw new GraphQLError("Failed to fetch households.", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
            },
          });
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

        if (error) {
          throw new GraphQLError("Failed to fetch household.", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
            },
          });
        }

        return data;
      },
    },

    Mutation: {
      createHousehold: async (_parent, { input }, context) => {
        await requirePermission(context, "household.create");

        const { data, error } = await context.supabase
          .from("households")
          .insert({
            household_code: input.householdCode,
            address: input.address,
            purok: input.purok,
            barangay: input.barangay,
            municipality: input.municipality,
            province: input.province,
          })
          .select()
          .single();

        if (error) {
          console.error("Create household failed:", error);

          throw new GraphQLError("Failed to create household.", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
            },
          });
        }

        return data;
      },

      updateHousehold: async (_parent, { id, input }, context) => {
        await requirePermission(context, "household.update");

        const { data, error } = await context.supabase
          .from("households")
          .update({
            ...(input.householdCode !== undefined && {
              household_code: input.householdCode,
            }),

            ...(input.address !== undefined && {
              address: input.address,
            }),

            ...(input.purok !== undefined && {
              purok: input.purok,
            }),

            ...(input.barangay !== undefined && {
              barangay: input.barangay,
            }),

            ...(input.municipality !== undefined && {
              municipality: input.municipality,
            }),

            ...(input.province !== undefined && {
              province: input.province,
            }),
          })
          .eq("id", id)
          .select()
          .single();

        if (error) {
          console.error("Update household failed:", error);

          throw new GraphQLError("Failed to update household.", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
            },
          });
        }

        return data;
      },

      deleteHousehold: async (_parent, { id }, context) => {
        await requirePermission(context, "household.delete");

        const { error } = await context.supabase
          .from("households")
          .delete()
          .eq("id", id);

        if (error) {
          console.error("Delete household failed:", error);

          throw new GraphQLError("Failed to delete household.", {
            extensions: {
              code: "INTERNAL_SERVER_ERROR",
            },
          });
        }

        return true;
      },
    },
  },
});
