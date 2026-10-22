"use client";

import { useQuery } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import { GET_SURVEYS, type GetSurveysResponse } from "../../queries/surveys";
import { queryKeys } from "../../query-keys";

export function useSurveys(
  householdId?: string,
  options: { enabled?: boolean } = {},
) {
  const resolvedHouseholdId = householdId?.trim() || undefined;

  return useQuery({
    queryKey: queryKeys.surveys(resolvedHouseholdId),
    queryFn: () =>
      graphqlRequest<GetSurveysResponse>(
        GET_SURVEYS,
        resolvedHouseholdId ? { householdId: resolvedHouseholdId } : undefined,
      ),
    select: (data) => data.surveys,
    enabled: options.enabled ?? true,
  });
}
