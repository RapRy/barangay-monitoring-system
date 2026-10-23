export type CaseType = "SOCIAL_ASSISTANCE" | "HEALTH_CONCERN" | "INCIDENT";

export type CaseStatus = "OPEN" | "IN_PROGRESS" | "RESOLVED" | "CLOSED";

export type CasePriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export interface CaseRecord {
  id: string;
  household_id: string;
  resident_id: string | null;
  resident_name: string;
  case_type: CaseType;
  title: string;
  description: string | null;
  status: CaseStatus;
  priority: CasePriority;
  assigned_to: string | null;
  reported_at: string;
  follow_up_date: string | null;
  resolution_notes: string | null;
  created_by: string | null;
  created_at: string;
  updated_at: string;
}

export interface CreateCaseInput {
  household_id: string;
  resident_id: string;
  case_type: CaseType;
  title: string;
  description?: string | null;
  priority?: CasePriority;
  assigned_to?: string | null;
  reported_at?: string;
  follow_up_date?: string | null;
  resolution_notes?: string | null;
}

export interface UpdateCaseInput {
  case_type?: CaseType;
  title?: string;
  description?: string | null;
  status?: CaseStatus;
  priority?: CasePriority;
  assigned_to?: string | null;
  reported_at?: string;
  follow_up_date?: string | null;
  resolution_notes?: string | null;
}

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

export const GET_CASES = `
  query GetCases($householdId: ID, $residentId: ID) {
    cases(householdId: $householdId, residentId: $residentId) {
      ${CASE_FIELDS}
    }
  }
`;

export const GET_CASE = `
  query GetCase($id: ID!) {
    case(id: $id) {
      ${CASE_FIELDS}
    }
  }
`;

export interface GetCasesResponse {
  cases: CaseRecord[];
}

export interface GetCaseResponse {
  case: CaseRecord;
}
