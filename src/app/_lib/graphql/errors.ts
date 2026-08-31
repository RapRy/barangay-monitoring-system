import { GraphQLError } from "graphql";

export type AppErrorCode =
  | "UNAUTHENTICATED"
  | "FORBIDDEN"
  | "BAD_USER_INPUT"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_SERVER_ERROR"
  | "NETWORK_ERROR";

export class AppError extends Error {
  readonly code: AppErrorCode;

  constructor(message: string, code: AppErrorCode) {
    super(message);

    this.name = "AppError";
    this.code = code;
  }
}

export function unauthenticated(
  message = "You must be logged in to perform this action.",
) {
  return new GraphQLError(message, {
    extensions: {
      code: "UNAUTHENTICATED" satisfies AppErrorCode,
    },
  });
}

export function forbidden(
  message = "You do not have permission to perform this action.",
) {
  return new GraphQLError(message, {
    extensions: {
      code: "FORBIDDEN" satisfies AppErrorCode,
    },
  });
}

export function badUserInput(message: string) {
  return new GraphQLError(message, {
    extensions: {
      code: "BAD_USER_INPUT" satisfies AppErrorCode,
    },
  });
}

export function notFound(message = "The requested resource was not found.") {
  return new GraphQLError(message, {
    extensions: {
      code: "NOT_FOUND" satisfies AppErrorCode,
    },
  });
}

export function conflict(message: string) {
  return new GraphQLError(message, {
    extensions: {
      code: "CONFLICT" satisfies AppErrorCode,
    },
  });
}

export function internalServerError(message = "An unexpected error occurred.") {
  return new GraphQLError(message, {
    extensions: {
      code: "INTERNAL_SERVER_ERROR" satisfies AppErrorCode,
    },
  });
}
