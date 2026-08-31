"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlRequest } from "../client";
import { DELETE_HOUSEHOLD } from "../mutations/households";
import { queryKeys } from "../query-keys";

interface DeleteHouseholdResponse {
  deleteHousehold: boolean;
}

export function useDeleteHousehold() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      graphqlRequest<DeleteHouseholdResponse>(DELETE_HOUSEHOLD, {
        id,
      }),

    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.households,
      });

      queryClient.removeQueries({
        queryKey: queryKeys.household(id),
      });
    },
  });
}
