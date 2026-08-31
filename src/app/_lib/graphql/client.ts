import { AppError } from "./errors";

interface GraphQLErrorResponse {
  message: string;
  extensions?: {
    code?: string;
  };
}

interface GraphQLResponse<T> {
  data?: T;
  errors?: readonly GraphQLErrorResponse[];
}

const VALID_ERROR_CODES = [
  "UNAUTHENTICATED",
  "FORBIDDEN",
  "BAD_USER_INPUT",
  "NOT_FOUND",
  "CONFLICT",
  "INTERNAL_SERVER_ERROR",
] as const;

type GraphQLErrorCode = (typeof VALID_ERROR_CODES)[number];

function getErrorCode(code?: string): GraphQLErrorCode {
  if (code && VALID_ERROR_CODES.includes(code as GraphQLErrorCode)) {
    return code as GraphQLErrorCode;
  }

  return "INTERNAL_SERVER_ERROR";
}

export async function graphqlRequest<T>(
  query: string,
  variables?: Record<string, unknown>,
): Promise<T> {
  let response: Response;

  try {
    response = await fetch("/api/graphql", {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
      },

      credentials: "include",

      body: JSON.stringify({
        query,
        variables,
      }),
    });
  } catch {
    throw new AppError("Unable to connect to the server.", "NETWORK_ERROR");
  }

  if (!response.ok) {
    throw new AppError(
      `Request failed with status ${response.status}.`,
      "NETWORK_ERROR",
    );
  }

  const result = (await response.json()) as GraphQLResponse<T>;

  if (result.errors?.length) {
    const error = result.errors[0];

    throw new AppError(error.message, getErrorCode(error.extensions?.code));
  }

  if (result.data === undefined) {
    throw new AppError(
      "GraphQL response did not contain data.",
      "INTERNAL_SERVER_ERROR",
    );
  }

  return result.data;
}
