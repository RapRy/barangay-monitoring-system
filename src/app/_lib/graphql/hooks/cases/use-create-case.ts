"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import { CREATE_CASE } from "../../mutations/cases";
import type { CaseRecord, CreateCaseInput } from "../../queries/cases";
import { queryKeys } from "../../query-keys";

interface CreateCaseResponse {
  createCase: CaseRecord;
}

export function useCreateCase() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateCaseInput) =>
      graphqlRequest<CreateCaseResponse>(CREATE_CASE, { input }),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.casesRoot,
      }),
  });
}
