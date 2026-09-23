"use client";

import { useQuery } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import {
  GET_RESIDENTS,
  type GetResidentsResponse,
} from "../../queries/residents";
import { queryKeys } from "../../query-keys";

export function useResidents(householdId: string) {
  return useQuery({
    queryKey: queryKeys.residents(householdId),
    queryFn: () =>
      graphqlRequest<GetResidentsResponse>(GET_RESIDENTS, {
        householdId,
      }),
    select: (data) => data.residents,
    enabled: Boolean(householdId),
  });
}
