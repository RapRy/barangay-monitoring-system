import { createSchema } from "graphql-yoga";
import { User } from "@supabase/supabase-js";
import { requirePermission } from "./require-permissions";

import {
  requireAuthenticatedUser,
  requireRole,
  throwDatabaseError,
} from "./authorization";
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
    User: {
      role: (user: { role: string | null }) =>
        user.role ? user.role.toUpperCase() : null,
    },

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
        requireAuthenticatedUser(context);

        const { data, error } = await context.supabase
          .from("households")
          .select("*")
          .order("created_at", { ascending: false });

        if (error) {
          throwDatabaseError(error.message);
        }

        return (data as HouseholdRow[]).map(toHousehold);
      },

      residents: async (_parent, args: { householdId?: string }, context) => {
        requireAuthenticatedUser(context);

        let query = context.supabase
          .from("residents")
          .select("*")
          .order("last_name", { ascending: true });

        if (args.householdId) {
          query = query.eq("household_id", args.householdId);
        }

        const { data, error } = await query;

        if (error) {
          throwDatabaseError(error.message);
        }

        return (data as ResidentRow[]).map(toResident);
      },
    },

    Mutation: {
      createHousehold: async (
        _parent,
        args: { input: { householdNo: string; address: string } },
        context,
      ) => {
        requireRole(context, ["admin", "staff"]);

        const { data, error } = await context.supabase
          .from("households")
          .insert({
            household_no: args.input.householdNo,
            address: args.input.address,
          })
          .select()
          .single();

        if (error) {
          throwDatabaseError(error.message);
        }

        return toHousehold(data as HouseholdRow);
      },

      updateHousehold: async (
        _parent,
        args: { id: string; input: { householdNo: string; address: string } },
        context,
      ) => {
        requireRole(context, ["admin", "staff"]);

        const { data, error } = await context.supabase
          .from("households")
          .update({
            household_no: args.input.householdNo,
            address: args.input.address,
          })
          .eq("id", args.id)
          .select()
          .single();

        if (error) {
          throwDatabaseError(error.message);
        }

        return toHousehold(data as HouseholdRow);
      },

      deleteHousehold: async (_parent, args: { id: string }, context) => {
        requireRole(context, ["admin"]);

        const { data, error } = await context.supabase
          .from("households")
          .delete()
          .eq("id", args.id)
          .select("id");

        if (error) {
          throwDatabaseError(error.message);
        }

        return data.length > 0;
      },

      createResident: async (
        _parent,
        args: {
          input: {
            householdId: string;
            firstName: string;
            middleName?: string | null;
            lastName: string;
            birthDate: string;
            sex: string;
            relationship: string;
          };
        },
        context,
      ) => {
        requireRole(context, ["admin", "staff"]);

        const { data, error } = await context.supabase
          .from("residents")
          .insert({
            household_id: args.input.householdId,
            first_name: args.input.firstName,
            middle_name: args.input.middleName ?? null,
            last_name: args.input.lastName,
            birth_date: args.input.birthDate,
            sex: args.input.sex,
            relationship: args.input.relationship,
          })
          .select()
          .single();

        if (error) {
          throwDatabaseError(error.message);
        }

        return toResident(data as ResidentRow);
      },

      updateResident: async (
        _parent,
        args: {
          id: string;
          input: {
            householdId: string;
            firstName: string;
            middleName?: string | null;
            lastName: string;
            birthDate: string;
            sex: string;
            relationship: string;
          };
        },
        context,
      ) => {
        requireRole(context, ["admin", "staff"]);

        const { data, error } = await context.supabase
          .from("residents")
          .update({
            household_id: args.input.householdId,
            first_name: args.input.firstName,
            middle_name: args.input.middleName ?? null,
            last_name: args.input.lastName,
            birth_date: args.input.birthDate,
            sex: args.input.sex,
            relationship: args.input.relationship,
          })
          .eq("id", args.id)
          .select()
          .single();

        if (error) {
          throwDatabaseError(error.message);
        }

        return toResident(data as ResidentRow);
      },

      deleteResident: async (_parent, args: { id: string }, context) => {
        requireRole(context, ["admin"]);

        const { data, error } = await context.supabase
          .from("residents")
          .delete()
          .eq("id", args.id)
          .select("id");

        if (error) {
          throwDatabaseError(error.message);
        }

        return data.length > 0;
      },
    },
  },
});
