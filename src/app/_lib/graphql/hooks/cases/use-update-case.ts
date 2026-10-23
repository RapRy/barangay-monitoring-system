"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import { UPDATE_CASE } from "../../mutations/cases";
import type { CaseRecord, UpdateCaseInput } from "../../queries/cases";
import { queryKeys } from "../../query-keys";

interface UpdateCaseResponse {
  updateCase: CaseRecord;
}

interface UpdateCaseVariables {
  id: string;
  input: UpdateCaseInput;
}

export function useUpdateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, input }: UpdateCaseVariables) =>
      graphqlRequest<UpdateCaseResponse>(UPDATE_CASE, { id, input }),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.casesRoot,
      });
      queryClient.invalidateQueries({
        queryKey: queryKeys.case(variables.id),
      });
    },
  });
}
