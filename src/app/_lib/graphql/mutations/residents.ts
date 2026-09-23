export const CREATE_RESIDENT = `
  mutation CreateResident($input: ResidentInput!) {
    createResident(input: $input) {
      id
      household_id
      first_name
      middle_name
      last_name
      birth_date
      sex
      relationship
      created_at
      updated_at
    }
  }
`;
