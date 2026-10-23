"use client";

import { useQuery } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import { GET_CASES, type GetCasesResponse } from "../../queries/cases";
import { queryKeys } from "../../query-keys";

export function useCases(
  filters: { householdId?: string; residentId?: string } = {},
) {
  const householdId = filters.householdId?.trim() || undefined;
  const residentId = filters.residentId?.trim() || undefined;

  return useQuery({
    queryKey: queryKeys.cases({ householdId, residentId }),
    queryFn: () =>
      graphqlRequest<GetCasesResponse>(GET_CASES, {
        householdId,
        residentId,
      }),
    select: (data) => data.cases,
  });
}
