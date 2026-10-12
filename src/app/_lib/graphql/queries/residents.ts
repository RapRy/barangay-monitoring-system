export interface Resident {
  id: string;
  household_id: string;
  household_name: string | null;
  household_code: string | null;
  first_name: string;
  middle_name: string | null;
  last_name: string;
  birth_date: string;
  sex: string;
  relationship: string;
  created_at: string;
  updated_at: string;
}

export const GET_RESIDENTS = `
  query GetResidents($householdId: ID) {
    residents(householdId: $householdId) {
      id
      household_id
      household_name
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

export interface GetResidentsResponse {
  residents: Resident[];
}

export const GET_RESIDENT = `
  query GetResident($id: ID!) {
    resident(id: $id) {
      id
      household_id
      household_name
      household_code
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

export interface GetResidentResponse {
  resident: Resident & {
    household_code: string | null;
  };
}
