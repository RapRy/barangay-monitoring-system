import { schema } from "@/app/lib/graphql/schema";
import { createGraphQLContext } from "@/app/lib/graphql/context";
import { createYoga } from "graphql-yoga";

const yoga = createYoga({
  schema,

  context: createGraphQLContext,

  graphqlEndpoint: "/api/graphql",
});

export { yoga as GET, yoga as POST };
