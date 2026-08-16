import type { GraphQLContext } from "../context";

export const resolvers = {
  Query: {
    health: () => "OK",

    me: (_: unknown, __: unknown, context: GraphQLContext) => {
      if (!context.user) {
        return null;
      }

      return {
        id: context.user.id,
        email: context.user.email,
      };
    },
  },
};