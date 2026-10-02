"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import { UPDATE_RESIDENT } from "../../mutations/residents";
import type { Resident } from "../../queries/residents";
import { queryKeys } from "../../query-keys";
import type { CreateResidentInput } from "./use-create-residents";

interface UpdateResidentResponse {
  updateResident: Resident;
}

interface UpdateResidentVariables {
  id: string;
  input: CreateResidentInput;
}

export function useUpdateResident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateResidentVariables) =>
      graphqlRequest<UpdateResidentResponse>(UPDATE_RESIDENT, {
        id,
        input,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.residents(),
      });
    },
  });
}
