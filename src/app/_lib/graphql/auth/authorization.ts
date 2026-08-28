import type { AppRole, GraphQLContext } from "../context";
import { forbidden, internalServerError } from "../errors";
import { requireAuthenticatedUser } from "./require-authenticated-user";

export function requireRole(
  context: GraphQLContext,
  allowedRoles: readonly AppRole[],
): AppRole {
  requireAuthenticatedUser(context);

  if (!context.role || !allowedRoles.includes(context.role)) {
    throw forbidden("You do not have permission to perform this action.");
  }

  return context.role;
}

export function throwDatabaseError(message: string): never {
  throw internalServerError();
}
