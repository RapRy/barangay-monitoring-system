export interface Survey {
  id: string;
  household_id: string;
  survey_date: string;
  surveyed_by: string | null;
  number_of_family_members: number;
  source_of_income: string | null;
  monthly_income: number | null;
  water_source: string | null;
  has_electricity: boolean | null;
  has_internet: boolean | null;
  housing_condition: string | null;
  assistance_needed: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export const GET_SURVEYS = `
  query GetSurveys($householdId: ID) {
    surveys(householdId: $householdId) {
      id
      household_id
      survey_date
      surveyed_by
      number_of_family_members
      source_of_income
      monthly_income
      water_source
      has_electricity
      has_internet
      housing_condition
      assistance_needed
      notes
      created_at
      updated_at
    }
  }
`;

export interface GetSurveysResponse {
  surveys: Survey[];
}

export const GET_SURVEY = `
  query GetSurvey($id: ID!) {
    survey(id: $id) {
      id
      household_id
      survey_date
      surveyed_by
      number_of_family_members
      source_of_income
      monthly_income
      water_source
      has_electricity
      has_internet
      housing_condition
      assistance_needed
      notes
      created_at
      updated_at
    }
  }
`;

export interface GetSurveyResponse {
  survey: Survey;
}

export interface SurveyResidentResponse {
  id: string;
  survey_id: string;
  resident_id: string | null;
  resident_name: string;
  employment_status: string | null;
  educational_status: string | null;
  health_concerns: string | null;
  created_at: string;
  updated_at: string;
}

export const GET_SURVEY_RESIDENT_RESPONSES = `
  query GetSurveyResidentResponses($surveyId: ID!) {
    surveyResidentResponses(surveyId: $surveyId) {
      id
      survey_id
      resident_id
      resident_name
      employment_status
      educational_status
      health_concerns
      created_at
      updated_at
    }
  }
`;

export interface GetSurveyResidentResponsesResponse {
  surveyResidentResponses: SurveyResidentResponse[];
}
