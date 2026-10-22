"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import { CREATE_SURVEY } from "../../mutations/surveys";
import type { Survey } from "../../queries/surveys";
import { queryKeys } from "../../query-keys";

export interface CreateSurveyInput {
  household_id: string;
  survey_date?: string;
  number_of_family_members: number;
  source_of_income?: string | null;
  monthly_income?: number | null;
  water_source?: string | null;
  has_electricity?: boolean | null;
  has_internet?: boolean | null;
  housing_condition?: string | null;
  assistance_needed?: string | null;
  notes?: string | null;
}

interface CreateSurveyResponse {
  createSurvey: Survey;
}

export function useCreateSurvey() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: CreateSurveyInput) =>
      graphqlRequest<CreateSurveyResponse>(CREATE_SURVEY, { input }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.surveysRoot,
      });
    },
  });
}
