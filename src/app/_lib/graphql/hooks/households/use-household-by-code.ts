"use client";

import { useQuery } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import {
  GET_HOUSEHOLD_BY_CODE,
  type GetHouseholdByCodeResponse,
} from "../../queries/households";

import { queryKeys } from "../../query-keys";

export function useHouseholdByCode(householdCode: string) {
  const resolvedHouseholdCode = householdCode.trim().toUpperCase();

  return useQuery({
    queryKey: queryKeys.householdCode(resolvedHouseholdCode),
    queryFn: () =>
      graphqlRequest<GetHouseholdByCodeResponse>(GET_HOUSEHOLD_BY_CODE, {
        householdCode: resolvedHouseholdCode,
      }),
    select: (data) => data.householdByCode,
    enabled: Boolean(resolvedHouseholdCode),
  });
}
