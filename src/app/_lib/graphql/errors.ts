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
) {
  return new GraphQLError(message, {
    extensions: {
      code: "UNAUTHENTICATED" satisfies GraphQLErrorCode,
    },
  });
}

export function forbidden(
  message = "You do not have permission to perform this action.",
) {
  return new GraphQLError(message, {
    extensions: {
      code: "FORBIDDEN" satisfies GraphQLErrorCode,
    },
  });
}

export function badUserInput(message: string) {
  return new GraphQLError(message, {
    extensions: {
      code: "BAD_USER_INPUT" satisfies GraphQLErrorCode,
    },
  });
}

export function notFound(message = "The requested resource was not found.") {
  return new GraphQLError(message, {
    extensions: {
      code: "NOT_FOUND" satisfies GraphQLErrorCode,
    },
  });
}

export function conflict(message: string) {
  return new GraphQLError(message, {
    extensions: {
      code: "CONFLICT" satisfies GraphQLErrorCode,
    },
  });
}

export function internalServerError(message = "An unexpected error occurred.") {
  return new GraphQLError(message, {
    extensions: {
      code: "INTERNAL_SERVER_ERROR" satisfies GraphQLErrorCode,
    },
  });
}
