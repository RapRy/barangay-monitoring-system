import { GraphQLError } from "graphql";
import type { AppRole, GraphQLContext } from "./context";

export function requireAuthenticatedUser(context: GraphQLContext) {
  if (!context.user) {
    throw new GraphQLError("You must be signed in to perform this action.", {
      extensions: { code: "UNAUTHENTICATED" },
    });
  }

  return context.user;
}

export function requireRole(
  context: GraphQLContext,
  allowedRoles: readonly AppRole[],
): AppRole {
  requireAuthenticatedUser(context);

  if (!context.role || !allowedRoles.includes(context.role)) {
    throw new GraphQLError(
      "You do not have permission to perform this action.",
      {
        extensions: { code: "FORBIDDEN" },
      },
    );
  }

  return context.role;
}

export function throwDatabaseError(message: string): never {
  throw new GraphQLError(message, {
    extensions: { code: "DATABASE_ERROR" },
  });
}
