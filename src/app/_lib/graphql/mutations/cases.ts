const CASE_FIELDS = `
  id
  household_id
  resident_id
  resident_name
  case_type
  title
  description
  status
  priority
  assigned_to
  reported_at
  follow_up_date
  resolution_notes
  created_by
  created_at
  updated_at
`;

export const CREATE_CASE = `
  mutation CreateCase($input: CreateCaseInput!) {
    createCase(input: $input) {
      ${CASE_FIELDS}
    }
  }
`;

export const UPDATE_CASE = `
  mutation UpdateCase($id: ID!, $input: UpdateCaseInput!) {
    updateCase(id: $id, input: $input) {
      ${CASE_FIELDS}
    }
  }
`;

export const DELETE_CASE = `
  mutation DeleteCase($id: ID!) {
    deleteCase(id: $id)
  }
`;
