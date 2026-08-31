"use client";

import { useHouseholds } from "@/app/_lib/graphql/hooks/use-households";

export default function TestQueryPage() {
  const { data, isLoading, isError, error } = useHouseholds();

  if (isLoading) {
    return <p>Loading households...</p>;
  }

  if (isError) {
    return (
      <div>
        <p>Failed to load households.</p>
        <p>{error.message}</p>
      </div>
    );
  }

  return <pre>{JSON.stringify(data, null, 2)}</pre>;
}
