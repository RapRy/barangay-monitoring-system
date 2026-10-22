"use client";

import { useQuery } from "@tanstack/react-query";

import { graphqlRequest } from "../../client";
import {
  GET_SURVEY_RESIDENT_RESPONSES,
  type GetSurveyResidentResponsesResponse,
} from "../../queries/surveys";
import { queryKeys } from "../../query-keys";

export function useSurveyResidentResponses(surveyId: string) {
  return useQuery({
    queryKey: queryKeys.surveyResponses(surveyId),
    queryFn: () =>
      graphqlRequest<GetSurveyResidentResponsesResponse>(
        GET_SURVEY_RESIDENT_RESPONSES,
        { surveyId },
      ),
    select: (data) => data.surveyResidentResponses,
    enabled: Boolean(surveyId),
  });
}
