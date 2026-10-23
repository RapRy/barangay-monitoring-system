"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import { DELETE_CASE } from "../../mutations/cases";
import { queryKeys } from "../../query-keys";

interface DeleteCaseResponse {
  deleteCase: boolean;
}

export function useDeleteCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      graphqlRequest<DeleteCaseResponse>(DELETE_CASE, { id }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.casesRoot,
      }),
  });
}
