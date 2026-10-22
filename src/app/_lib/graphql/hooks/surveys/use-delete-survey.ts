"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { graphqlRequest } from "../../client";
import { DELETE_SURVEY } from "../../mutations/surveys";
import { queryKeys } from "../../query-keys";

interface DeleteSurveyResponse {
  deleteSurvey: boolean;
}

export function useDeleteSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      graphqlRequest<DeleteSurveyResponse>(DELETE_SURVEY, { id }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.surveysRoot,
      });
    },
  });
}
