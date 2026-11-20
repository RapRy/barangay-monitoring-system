import { schema } from "@/app/_lib/graphql/schema";
import { createGraphQLContext } from "@/app/_lib/graphql/context";
import { createYoga } from "graphql-yoga";
import { GraphQLError } from "graphql/error";

type GraphQLErrorLike = {
  message: string;
  extensions?: {
    code?: unknown;
  };
};

function isGraphQLErrorLike(error: unknown): error is GraphQLErrorLike {
  return typeof error === "object" && error !== null && "message" in error;
}

const yoga = createYoga({
  schema,
  context: createGraphQLContext,
  graphqlEndpoint: "/api/graphql",
  maskedErrors: {
    maskError(error) {
      console.error("GraphQL error:", error);

      if (isGraphQLErrorLike(error)) {
        const code = error.extensions?.code;

        console.error("Message:", error.message);
        console.error("Code:", code);

        if (
          code === "UNAUTHENTICATED" ||
          code === "FORBIDDEN" ||
          code === "BAD_USER_INPUT" ||
          code === "NOT_FOUND" ||
          code === "CONFLICT"
        ) {
          return new GraphQLError(error.message, {
            extensions: { code },
          });
        }
      }

      return new GraphQLError("An unexpected error occurred.", {
        extensions: {
          code: "INTERNAL_SERVER_ERROR",
        },
      });
    },
  },
});

export async function GET(request: Request) {
  const response = await yoga.fetch(request);

  if (!(response instanceof Response)) {
    throw new Error("GraphQL GET handler did not return a Response.");
  }

  return response;
}

export async function POST(request: Request) {
  const response = await yoga.fetch(request);

  if (!(response instanceof Response)) {
    throw new Error("GraphQL POST handler did not return a Response.");
  }

  return response;
}
