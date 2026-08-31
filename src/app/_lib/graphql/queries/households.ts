export interface Household {
  id: string;
  household_code: string;
  address: string | null;
  purok: string;
  postal_code: string;
  barangay: string;
  municipality: string;
  created_at: string;
  updated_at: string;
}
export const GET_HOUSEHOLDS = `
  query GetHouseholds {
    households {
        id
        household_code
        address
        purok
        postal_code
        barangay
        municipality
        created_at
        updated_at
    }
  }
`;

export interface GetHouseholdsResponse {
  households: Household[];
}
