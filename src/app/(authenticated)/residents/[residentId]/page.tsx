"use client";

import Link from "next/link";
import { useParams } from "next/navigation";

import { ErrorState } from "@/app/_components/ui/error-state";
import { PageHeader } from "@/app/_components/ui/page-header";
import { useResident } from "@/app/_lib/graphql/hooks/residents/use-resident";

export default function ResidentDetailPage() {
  const params = useParams<{ residentId: string }>();
  const residentId = params.residentId;

  const { data: resident, isLoading, isError, error } = useResident(residentId);

  if (isLoading) {
    return (
      <main className="p-6">
        <PageHeader
          title="Resident"
          description="Loading resident details..."
        />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6">
        <PageHeader title="Resident" />
        <ErrorState
          title="Unable to load resident"
          message={
            error instanceof Error
              ? error.message
              : "Something went wrong while loading this resident."
          }
        />
      </main>
    );
  }

  if (!resident) {
    return (
      <main className="p-6">
        <PageHeader title="Resident not found" />
        <ErrorState
          title="Resident not found"
          message="The selected resident could not be found."
        />
      </main>
    );
  }

  const fullName = [
    resident.first_name,
    resident.middle_name,
    resident.last_name,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <main className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title={fullName}
          description={resident.household_name ?? "Resident profile"}
        />

        <div className="flex flex-wrap gap-2">
          <Link
            href="/residents"
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
          >
            Back to Residents
          </Link>

          {resident.household_code && (
            <Link
              href={`/households/${encodeURIComponent(resident.household_code.toLowerCase())}`}
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Back to Household
            </Link>
          )}
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Household
          </p>
          <p className="mt-2 font-semibold">
            {resident.household_name ?? "Unknown household"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Household Code
          </p>
          <p className="mt-2 font-semibold">
            {resident.household_code ?? "Not available"}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">Sex</p>
          <p className="mt-2 font-semibold">{resident.sex}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Relationship
          </p>
          <p className="mt-2 font-semibold">{resident.relationship}</p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Birth Date
          </p>
          <p className="mt-2 font-semibold">
            {new Date(resident.birth_date).toLocaleDateString()}
          </p>
        </div>

        <div className="rounded-xl border bg-white p-4">
          <p className="text-xs uppercase tracking-wide text-slate-500">
            Registered
          </p>
          <p className="mt-2 font-semibold">
            {new Date(resident.created_at).toLocaleDateString()}
          </p>
        </div>
      </div>
    </main>
  );
}
