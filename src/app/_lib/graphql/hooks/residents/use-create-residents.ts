"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import { CREATE_RESIDENT } from "../../mutations/residents";
import type { Resident } from "../../queries/residents";
import { queryKeys } from "../../query-keys";

export interface CreateResidentInput {
  household_id: string;
  first_name: string;
  middle_name?: string | null;
  last_name: string;
  birth_date: string;
  sex: string;
  relationship: string;
}

interface CreateResidentResponse {
  createResident: Resident;
}

export function useCreateResident() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateResidentInput) =>
      graphqlRequest<CreateResidentResponse>(CREATE_RESIDENT, { input }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.residents(),
      });
    },
  });
}
