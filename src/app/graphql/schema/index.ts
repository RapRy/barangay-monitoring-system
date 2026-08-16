export const typeDefs = `#graphql
  type User {
    id: ID!
    email: String
  }

  type Query {
    health: String!
    me: User
  }
`;