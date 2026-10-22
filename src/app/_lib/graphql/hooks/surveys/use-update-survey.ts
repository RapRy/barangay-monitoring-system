"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import { UPDATE_SURVEY } from "../../mutations/surveys";
import type { Survey } from "../../queries/surveys";
import { queryKeys } from "../../query-keys";

export interface UpdateSurveyInput {
  survey_date?: string;
  number_of_family_members?: number;
  source_of_income?: string | null;
  monthly_income?: number | null;
  water_source?: string | null;
  has_electricity?: boolean | null;
  has_internet?: boolean | null;
  housing_condition?: string | null;
  assistance_needed?: string | null;
  notes?: string | null;
}

type UpdateSurveyVariables = {
  id: string;
  input: UpdateSurveyInput;
} & Record<string, unknown>;

interface UpdateSurveyResponse {
  updateSurvey: Survey;
}

export function useUpdateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (variables: UpdateSurveyVariables) =>
      graphqlRequest<UpdateSurveyResponse>(UPDATE_SURVEY, variables),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.surveysRoot,
      });

      queryClient.invalidateQueries({
        queryKey: queryKeys.survey(variables.id),
      });
    },
  });
}
