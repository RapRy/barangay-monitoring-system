"use client";

import { useQueryClient, useMutation } from "@tanstack/react-query";

import { graphqlRequest } from "../client";
import { CREATE_HOUSEHOLD } from "../mutations/households";
import type { Household } from "../queries/households";
import { queryKeys } from "../query-keys";

interface CreateHouseholdInput {
  household_code: string;
  address: string;
  postal_code: string;
  purok: string;
  barangay: string;
  municipality: string;
  province: string;
}

interface CreateHouseholdResponse {
  createHousehold: Household;
}

export function useCreateHousehold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateHouseholdInput) =>
      graphqlRequest<CreateHouseholdResponse>(CREATE_HOUSEHOLD, {
        input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.households,
      });
    },
  });
}
