export const CREATE_SURVEY = `
  mutation CreateSurvey($input: CreateSurveyInput!) {
    createSurvey(input: $input) {
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

export const UPDATE_SURVEY = `
  mutation UpdateSurvey($id: ID!, $input: UpdateSurveyInput!) {
    updateSurvey(id: $id, input: $input) {
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

export const DELETE_SURVEY = `
  mutation DeleteSurvey($id: ID!) {
    deleteSurvey(id: $id)
  }
`;

export const SAVE_SURVEY_RESIDENT_RESPONSES = `
  mutation SaveSurveyResidentResponses(
    $surveyId: ID!
    $inputs: [SurveyResidentResponseInput!]!
  ) {
    saveSurveyResidentResponses(surveyId: $surveyId, inputs: $inputs) {
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
