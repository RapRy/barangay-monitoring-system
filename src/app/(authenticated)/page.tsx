"use client";

import Link from "next/link";
import { useMemo } from "react";

import { PageHeader } from "@/app/_components/ui/page-header";
import { useCases } from "@/app/_lib/graphql/hooks/cases/use-cases";
import { useHouseholds } from "@/app/_lib/graphql/hooks/households/use-households";
import { useResidents } from "@/app/_lib/graphql/hooks/residents/use-residents";
import { useSurveys } from "@/app/_lib/graphql/hooks/surveys/use-surveys";
import type { CaseRecord } from "@/app/_lib/graphql/queries/cases";

function getLocalDate() {
  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localNow.toISOString().slice(0, 10);
}

function formatDate(value: string | null) {
  if (!value) return "Not scheduled";
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function isActive(record: CaseRecord) {
  return record.status === "OPEN" || record.status === "IN_PROGRESS";
}

function isOverdue(record: CaseRecord, today: string) {
  return (
    isActive(record) &&
    Boolean(record.follow_up_date) &&
    record.follow_up_date! < today
  );
}

function SummaryCard({
  label,
  value,
  hint,
  href,
  accent,
}: {
  label: string;
  value: number;
  hint: string;
  href: string;
  accent: string;
}) {
  return (
    <Link
      href={href}
      className="rounded-xl border bg-white p-5 transition-shadow hover:shadow-sm"
    >
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accent}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </Link>
  );
}

export default function HomePage() {
  const {
    data: households = [],
    isLoading: householdsLoading,
    isError: householdsError,
    error: householdError,
  } = useHouseholds();

  const {
    data: residents = [],
    isLoading: residentsLoading,
    isError: residentsError,
    error: residentError,
  } = useResidents();

  const {
    data: cases = [],
    isLoading: casesLoading,
    isError: casesError,
    error: caseError,
  } = useCases();

  const {
    data: surveys = [],
    isLoading: surveysLoading,
    isError: surveysError,
    error: surveyError,
  } = useSurveys();

  const today = getLocalDate();

  const householdMap = useMemo(
    () => new Map(households.map((household) => [household.id, household])),
    [households],
  );

  const metrics = useMemo(
    () => ({
      openCases: cases.filter((record) => record.status === "OPEN").length,
      inProgressCases: cases.filter((record) => record.status === "IN_PROGRESS")
        .length,
      overdueCases: cases.filter((record) => isOverdue(record, today)).length,
      urgentCases: cases.filter(
        (record) => isActive(record) && record.priority === "URGENT",
      ).length,
    }),
    [cases, today],
  );

  const recentCases = useMemo(
    () =>
      [...cases]
        .sort((a, b) => b.reported_at.localeCompare(a.reported_at))
        .slice(0, 5),
    [cases],
  );

  const recentSurveys = useMemo(
    () =>
      [...surveys]
        .sort((a, b) => b.survey_date.localeCompare(a.survey_date))
        .slice(0, 5),
    [surveys],
  );

  const isLoading =
    householdsLoading || residentsLoading || casesLoading || surveysLoading;

  const loadError = householdError ?? residentError ?? caseError ?? surveyError;

  const hasError =
    householdsError || residentsError || casesError || surveysError;

  if (isLoading) {
    return (
      <main className="p-6">
        <PageHeader
          title="Overview"
          description="Loading community overview..."
        />
      </main>
    );
  }

  if (hasError) {
    return (
      <main className="p-6">
        <PageHeader title="Overview" />
        <p className="text-sm text-[var(--danger)]">
          {loadError instanceof Error
            ? loadError.message
            : "Unable to load overview data."}
        </p>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <PageHeader
        title="Overview"
        description="A current snapshot of households, residents, surveys, and assistance."
      />

      <section
        aria-label="Community totals"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <SummaryCard
          label="Households"
          value={households.length}
          hint="Registered households"
          href="/households"
          accent="text-teal-700"
        />
        <SummaryCard
          label="Residents"
          value={residents.length}
          hint="Registered residents"
          href="/residents"
          accent="text-blue-700"
        />
        <SummaryCard
          label="Open requests"
          value={metrics.openCases}
          hint="Waiting to be reviewed"
          href="/assistance"
          accent="text-blue-700"
        />
        <SummaryCard
          label="In progress"
          value={metrics.inProgressCases}
          hint="Currently being handled"
          href="/assistance"
          accent="text-amber-700"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Overdue follow-ups"
          value={metrics.overdueCases}
          hint="Active requests past their follow-up date"
          href="/assistance"
          accent="text-red-700"
        />
        <SummaryCard
          label="Urgent requests"
          value={metrics.urgentCases}
          hint="Active requests marked urgent"
          href="/assistance"
          accent="text-orange-700"
        />
        <SummaryCard
          label="Surveys recorded"
          value={surveys.length}
          hint="Survey records across households"
          href="/surveys"
          accent="text-emerald-700"
        />
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="overflow-x-auto rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-4 py-4">
            <div>
              <h2 className="font-semibold">Recent assistance requests</h2>
              <p className="mt-1 text-sm text-slate-500">
                The five latest reported requests
              </p>
            </div>
            <Link
              href="/assistance"
              className="text-sm font-medium text-[var(--primary)] hover:underline"
            >
              View all
            </Link>
          </div>

          {recentCases.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">
              No assistance requests have been recorded.
            </p>
          ) : (
            <table className="w-full min-w-[600px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Request</th>
                  <th className="px-4 py-3 font-medium">Resident</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Follow-up</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentCases.map((record) => (
                  <tr key={record.id}>
                    <td className="px-4 py-3 font-medium">{record.title}</td>
                    <td className="px-4 py-3">{record.resident_name}</td>
                    <td className="px-4 py-3">
                      {record.status.replaceAll("_", " ")}
                    </td>
                    <td
                      className={`px-4 py-3 ${
                        isOverdue(record, today)
                          ? "font-medium text-red-700"
                          : ""
                      }`}
                    >
                      {formatDate(record.follow_up_date)}
                      {isOverdue(record, today) && (
                        <span className="ml-2 text-xs">Overdue</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        <div className="overflow-x-auto rounded-xl border bg-white">
          <div className="flex items-center justify-between border-b px-4 py-4">
            <div>
              <h2 className="font-semibold">Recent surveys</h2>
              <p className="mt-1 text-sm text-slate-500">
                The five latest survey records
              </p>
            </div>
            <Link
              href="/surveys"
              className="text-sm font-medium text-[var(--primary)] hover:underline"
            >
              View all
            </Link>
          </div>

          {recentSurveys.length === 0 ? (
            <p className="p-5 text-sm text-slate-500">
              No surveys have been recorded.
            </p>
          ) : (
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Household</th>
                  <th className="px-4 py-3 font-medium">Survey date</th>
                  <th className="px-4 py-3 font-medium">Family members</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {recentSurveys.map((survey) => {
                  const household = householdMap.get(survey.household_id);

                  return (
                    <tr key={survey.id}>
                      <td className="px-4 py-3 font-medium">
                        {household
                          ? `${household.household_code} — ${household.household_name}`
                          : "Household unavailable"}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(survey.survey_date)}
                      </td>
                      <td className="px-4 py-3">
                        {survey.number_of_family_members}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </section>

      <section className="rounded-xl border bg-white p-5">
        <h2 className="font-semibold">Quick links</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { label: "Households", href: "/households" },
            { label: "Residents", href: "/residents" },
            { label: "Surveys", href: "/surveys" },
            { label: "Assistance queue", href: "/assistance" },
            { label: "Reports", href: "/reports" },
          ].map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="inline-flex h-10 items-center rounded-lg border border-[var(--border)] px-4 text-sm font-medium hover:bg-slate-50"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
