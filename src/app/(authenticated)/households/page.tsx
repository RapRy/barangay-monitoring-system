"use client";

import { useHouseholds } from "@/app/_lib/graphql/hooks/use-households";

export default function HouseholdsPage() {
  const { data: households, isLoading, isError, error } = useHouseholds();

  console.log(error);

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Households</h1>

        <p className="mt-4 text-sm text-gray-500">Loading households...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Households</h1>

        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-4">
          <p className="font-medium text-red-800">Unable to load households</p>

          <p className="mt-1 text-sm text-red-600">{(error as any).code}</p>

          {/* <p className="mt-1 text-xs text-red-500">Error code: {error.code}</p> */}
        </div>
      </main>
    );
  }

  return (
    <main className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Households</h1>

          <p className="mt-1 text-sm text-gray-500">
            Manage registered households.
          </p>
        </div>
      </div>

      {households?.length === 0 ? (
        <div className="mt-6 rounded-lg border p-8 text-center">
          <p className="font-medium">No households found.</p>

          <p className="mt-1 text-sm text-gray-500">
            There are currently no households registered.
          </p>
        </div>
      ) : (
        <div className="mt-6 overflow-hidden rounded-lg border">
          <table className="w-full text-left text-sm">
            <thead className="border-b bg-gray-50">
              <tr>
                <th className="px-4 py-3 font-medium">Household Code</th>

                <th className="px-4 py-3 font-medium">Address</th>

                <th className="px-4 py-3 font-medium">Purok</th>

                <th className="px-4 py-3 font-medium">Barangay</th>

                <th className="px-4 py-3 font-medium">Created</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {households?.map((household) => (
                <tr key={household.id}>
                  <td className="px-4 py-3 font-medium">
                    {household.household_code}
                  </td>

                  <td className="px-4 py-3">{household.address ?? "—"}</td>

                  <td className="px-4 py-3">{household.purok ?? "—"}</td>

                  <td className="px-4 py-3">{household.barangay ?? "—"}</td>

                  <td className="px-4 py-3">
                    {new Date(household.created_at).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}
