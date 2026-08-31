export const CREATE_HOUSEHOLD = `
  mutation CreateHousehold($input: CreateHouseholdInput!) {
    createHousehold(input: $input) {
      id
      household_code
      address
      purok
      barangay
      municipality
      province
      createdAt
    }
  }
`;

export const UPDATE_HOUSEHOLD = `
  mutation UpdateHousehold(
    $id: ID!
    $input: UpdateHouseholdInput!
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
      createdAt
    }
  }
`;

export const DELETE_HOUSEHOLD = `
  mutation DeleteHousehold($id: ID!) {
    deleteHousehold(id: $id)
  }
`;
