export interface Household {
  id: string;
  household_code: string;
  address: string | null;
  purok: string;
  sector: string | null;
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
        sector
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
