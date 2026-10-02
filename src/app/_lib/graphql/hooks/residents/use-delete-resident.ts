"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import { DELETE_RESIDENT } from "../../mutations/residents";
import { queryKeys } from "../../query-keys";

interface DeleteResidentResponse {
  deleteResident: boolean;
}

export function useDeleteResident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      graphqlRequest<DeleteResidentResponse>(DELETE_RESIDENT, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.residents(),
      });
    },
  });
}
