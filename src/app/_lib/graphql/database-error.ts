import { GraphQLError } from "graphql";

import { conflict, internalServerError } from "./errors";

export function handleSupabaseError(error: {
  code?: string;
  message?: string;
}): GraphQLError {
  console.error("Supabase error:", error);

  // PostgreSQL unique violation
  if (error.code === "23505") {
    return conflict("A record with the same value already exists.");
  }

  // Foreign key violation
  if (error.code === "23503") {
    return conflict("This record is associated with another resource.");
  }

  // Not-null violation
  if (error.code === "23502") {
    return new GraphQLError("Required data is missing.", {
      extensions: {
        code: "BAD_USER_INPUT",
      },
    });
  }

  return internalServerError();
}
