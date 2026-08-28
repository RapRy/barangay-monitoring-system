import { GraphQLError } from "graphql";

export type GraphQLErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "BAD_USER_INPUT"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR";

export function unauthenticated(
  message = "You must be logged in to perform this action.",
): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: "UNAUTHENTICATED",
    },
  });
}

export function forbidden(
  message = "You do not have permission to perform this action.",
): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: "FORBIDDEN",
    },
  });
}

export function badUserInput(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: "BAD_USER_INPUT",
    },
  });
}

export function notFound(
  message = "The requested resource was not found.",
): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: "NOT_FOUND",
    },
  });
}

export function conflict(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: "CONFLICT",
    },
  });
}

export function internalServerError(
  message = "An unexpected error occurred.",
): GraphQLError {
  return new GraphQLError(message, {
    extensions: {
      code: "INTERNAL_SERVER_ERROR",
    },
  });
}
