"use client";

import { useQuery } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import {
  GET_RESIDENTS,
  type GetResidentsResponse,
} from "../../queries/residents";
import { queryKeys } from "../../query-keys";

export function useResidents(householdId?: string) {
  const resolvedHouseholdId = householdId?.trim() || undefined;
  return useQuery({
    queryKey: queryKeys.residents(resolvedHouseholdId),
    queryFn: () =>
      graphqlRequest<GetResidentsResponse>(
        GET_RESIDENTS,
        resolvedHouseholdId ? { householdId: resolvedHouseholdId } : undefined,
      ),
    select: (data) => data.residents,
  });
}
