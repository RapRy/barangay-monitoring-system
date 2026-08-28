import type { GraphQLContext } from "../context";
import { unauthenticated } from "../errors";

export function requireAuthenticatedUser(context: GraphQLContext) {
  if (!context.user) {
    throw unauthenticated();
  }

  return context.user;
}
