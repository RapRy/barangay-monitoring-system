import { createSchema, createYoga } from "graphql-yoga";
import { typeDefs } from "./schema";
import { resolvers } from "./resolvers";
import { createContext, type GraphQLContext } from "./context";

const schema = createSchema<GraphQLContext>({
  typeDefs,
  resolvers,
});

export const yoga = createYoga<GraphQLContext>({
  schema,
  graphqlEndpoint: "/api/graphql",
  context: createContext,
});