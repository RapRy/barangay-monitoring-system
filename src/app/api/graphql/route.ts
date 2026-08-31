import { schema } from "@/app/_lib/graphql/schema";
import { createGraphQLContext } from "@/app/_lib/graphql/context";
import { createYoga } from "graphql-yoga";
import { GraphQLError } from "graphql/error";

const yoga = createYoga({
  schema,
  context: createGraphQLContext,
  graphqlEndpoint: "/api/graphql",
  maskedErrors: {
    maskError(error) {
      console.error("GraphQL error:", error);

      if (error instanceof GraphQLError) {
        const code = error.extensions?.code;

        if (
          code === "UNAUTHENTICATED" ||
          code === "FORBIDDEN" ||
          code === "BAD_USER_INPUT" ||
          code === "NOT_FOUND" ||
          code === "CONFLICT"
        ) {
          return error;
        }
      }

      return new Error("An unexpected error occurred.");
    },
  },
});

export { yoga as GET, yoga as POST };
