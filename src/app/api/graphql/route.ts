import { schema } from "@/app/_lib/graphql/schema";
import { createGraphQLContext } from "@/app/_lib/graphql/context";
import { createYoga } from "graphql-yoga";

const yoga = createYoga({
  schema,

  context: createGraphQLContext,

  graphqlEndpoint: "/api/graphql",
});

export { yoga as GET, yoga as POST };
