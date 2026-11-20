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

async function handleGraphQLRequest(request: Request): Promise<Response> {
  const result = await yoga.fetch(request);

  if (typeof result === "string") {
    return new Response(result, {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  if (result && typeof result === "object") {
    const candidate = result as {
      status?: number;
      statusText?: string;
      headers?: Headers;
      text?: () => Promise<string>;
      json?: () => Promise<unknown>;
    };

    if (typeof candidate.text === "function") {
      const text = await candidate.text();
      const headers = new Headers();

      candidate.headers?.forEach((value, key) => {
        headers.set(key, value);
      });

      return new Response(text, {
        status: candidate.status ?? 200,
        statusText: candidate.statusText,
        headers,
      });
    }
  }

  return new Response(
    JSON.stringify({
      errors: [
        {
          message: "Unexpected GraphQL response.",
          extensions: { code: "INTERNAL_SERVER_ERROR" },
        },
      ],
    }),
    {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    },
  );
}

export function GET(request: Request) {
  return handleGraphQLRequest(request);
}

export function POST(request: Request) {
  return handleGraphQLRequest(request);
}
