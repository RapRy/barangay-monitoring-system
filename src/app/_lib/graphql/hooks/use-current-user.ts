// src/app/_lib/graphql/hooks/use-current-user.ts
"use client";

import { useQuery } from "@tanstack/react-query";
import { graphqlRequest } from "../client";
import { GET_CURRENT_USER, type CurrentUserResponse } from "../queries/me";

export function useCurrentUser() {
  return useQuery({
    queryKey: ["current-user"],
    queryFn: () => graphqlRequest<CurrentUserResponse>(GET_CURRENT_USER),
    select: (data) => data.me,
  });
}
