export const queryKeys = {
  households: ["households"] as const,
  household: (id: string) => ["households", id] as const,
  householdCode: (code: string) => ["households", "code", code],
  residentsRoot: ["residents"] as const,
  residents: (householdId?: string) =>
    ["residents", householdId ?? "all"] as const,
};
