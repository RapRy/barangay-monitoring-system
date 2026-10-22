"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import { SAVE_SURVEY_RESIDENT_RESPONSES } from "../../mutations/surveys";
import type { SurveyResidentResponse } from "../../queries/surveys";
import { queryKeys } from "../../query-keys";

export interface SurveyResidentResponseInput {
  resident_id: string;
  employment_status?: string | null;
  educational_status?: string | null;
  health_concerns?: string | null;
}

interface SaveSurveyResidentResponsesResponse {
  saveSurveyResidentResponses: SurveyResidentResponse[];
}

interface SaveSurveyResidentResponsesVariables {
  surveyId: string;
  inputs: SurveyResidentResponseInput[];
}

export function useSaveSurveyResidentResponses() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ surveyId, inputs }: SaveSurveyResidentResponsesVariables) =>
      graphqlRequest<SaveSurveyResidentResponsesResponse>(
        SAVE_SURVEY_RESIDENT_RESPONSES,
        { surveyId, inputs },
      ),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({
        queryKey: queryKeys.surveyResponses(variables.surveyId),
      }),
  });
}
