"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import { UPDATE_HOUSEHOLD } from "../../mutations/households";
import { queryKeys } from "../../query-keys";

import type { Household } from "../../queries/households";

interface UpdateHouseholdInput {
  household_code?: string;
  address?: string;
  purok?: string;
  barangay?: string;
  sector?: string;
  municipality?: string;
  province?: string;
}

type UpdateHouseholdVariables = {
  id: string;
  input: UpdateHouseholdInput;
};

interface UpdateHouseholdResponse {
  updateHousehold: Household;
}

export function useUpdateHousehold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateHouseholdVariables) =>
      graphqlRequest<UpdateHouseholdResponse>(UPDATE_HOUSEHOLD, variables),

    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.households,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.household(variables.id),
      });
    },
  });
}
