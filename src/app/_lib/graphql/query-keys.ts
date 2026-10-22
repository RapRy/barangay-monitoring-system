export const queryKeys = {
  households: ["households"] as const,
  household: (id: string) => ["households", id] as const,
  householdCode: (code: string) => ["households", "code", code],
  residentsRoot: ["residents"] as const,
  residents: (householdId?: string) =>
    ["residents", householdId ?? "all"] as const,
  surveysRoot: ["surveys"] as const,
  surveys: (householdId?: string) => ["surveys", householdId ?? "all"] as const,
  survey: (id: string) => ["surveys", "detail", id] as const,
  surveyResponsesRoot: ["survey-resident-responses"] as const,
  surveyResponses: (surveyId: string) =>
    ["survey-resident-responses", surveyId] as const,
};
