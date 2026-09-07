// src/app/_lib/graphql/queries/me.ts
export interface CurrentUser {
  id: string;
  email: string | null;
  role: "ADMIN" | "STAFF" | "VIEWER" | null;
}

export interface CurrentUserResponse {
  me: CurrentUser | null;
}

export const GET_CURRENT_USER = `
  query GetCurrentUser {
    me {
      id
      email
      role
    }
  }
`;
