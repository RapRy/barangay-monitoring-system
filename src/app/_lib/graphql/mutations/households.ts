export const CREATE_HOUSEHOLD = `
  mutation CreateHousehold($input: HouseholdInput!) {
    createHousehold(input: $input) {
      id
      household_code
      address
      purok
      barangay
      municipality
      province
      postal_code
      created_at
    }
  }
`;

export const UPDATE_HOUSEHOLD = `
  mutation UpdateHousehold(
    $id: ID!
    $input: HouseholdInput!
  ) {
    updateHousehold(
      id: $id
      input: $input
    ) {
      id
      household_code
      address
      purok
      barangay
      municipality
      province
      created_at
    }
  }
`;

export const DELETE_HOUSEHOLD = `
  mutation DeleteHousehold($id: ID!) {
    deleteHousehold(id: $id)
  }
`;
