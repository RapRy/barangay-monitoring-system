export const queryKeys = {
  households: ["households"] as const,
  household: (id: string) => ["households", id] as const,
};
