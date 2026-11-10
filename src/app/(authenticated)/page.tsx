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
      className="app-panel block p-5 transition-transform hover:-translate-y-0.5"
    >
      <p className="text-sm text-(--muted)">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${accent}`}>{value}</p>
      <p className="mt-1 text-xs text-(--muted)">{hint}</p>
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

  const statusChart = [
    { label: "Open", status: "OPEN", color: "var(--primary)" },
    { label: "In progress", status: "IN_PROGRESS", color: "var(--info)" },
    { label: "Resolved", status: "RESOLVED", color: "var(--success)" },
    { label: "Closed", status: "CLOSED", color: "var(--muted)" },
  ].map((item) => ({
    ...item,
    count: cases.filter((record) => record.status === item.status).length,
  }));

  const maxStatusCount = Math.max(1, ...statusChart.map((item) => item.count));

  const monthlyRequests = Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));

    const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

    return {
      key,
      label: date.toLocaleDateString(undefined, { month: "short" }),
      count: cases.filter((record) => record.reported_at.startsWith(key))
        .length,
    };
  });

  const maxMonthlyCount = Math.max(
    1,
    ...monthlyRequests.map((item) => item.count),
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
        <p className="text-sm text-(--danger)">
          {loadError instanceof Error
            ? loadError.message
            : "Unable to load overview data."}
        </p>
      </main>
    );
  }

  return (
    <main className="space-y-5 p-5 sm:p-6">
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
          accent="text-(--primary)"
        />
        <SummaryCard
          label="Residents"
          value={residents.length}
          hint="Registered residents"
          href="/residents"
          accent="text-(--primary)"
        />
        <SummaryCard
          label="Open requests"
          value={metrics.openCases}
          hint="Waiting to be reviewed"
          href="/assistance"
          accent="text-(--primary)"
        />
        <SummaryCard
          label="In progress"
          value={metrics.inProgressCases}
          hint="Currently being handled"
          href="/assistance"
          accent="text-(--info)"
        />
      </section>

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <SummaryCard
          label="Overdue follow-ups"
          value={metrics.overdueCases}
          hint="Active requests past their follow-up date"
          href="/assistance"
          accent="text-(--danger)"
        />
        <SummaryCard
          label="Urgent requests"
          value={metrics.urgentCases}
          hint="Active requests marked urgent"
          href="/assistance"
          accent="text-(--warning)"
        />
        <SummaryCard
          label="Surveys recorded"
          value={surveys.length}
          hint="Survey records across households"
          href="/surveys"
          accent="text-(--success)"
        />
      </section>

      <section
        aria-label="Assistance charts"
        className="grid gap-5 xl:grid-cols-2"
      >
        <div className="app-panel p-5">
          <h2 className="font-semibold">Requests by status</h2>
          <p className="mt-1 text-sm text-(--muted)">
            Current distribution of assistance records
          </p>

          <div className="mt-6 space-y-4">
            {statusChart.map((item) => (
              <div key={item.status}>
                <div className="mb-1.5 flex justify-between text-sm">
                  <span>{item.label}</span>
                  <span className="font-medium">{item.count}</span>
                </div>
                <div
                  className="h-2.5 overflow-hidden rounded-full bg-(--surface-muted)"
                  role="img"
                  aria-label={`${item.label}: ${item.count} requests`}
                >
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${(item.count / maxStatusCount) * 100}%`,
                      backgroundColor: item.color,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="app-panel p-5">
          <h2 className="font-semibold">Requests over time</h2>
          <p className="mt-1 text-sm text-(--muted)">
            Reported assistance requests over the last six months
          </p>

          <div
            className="mt-6 grid h-44 grid-cols-6 items-end gap-3"
            role="img"
            aria-label="Monthly assistance requests for the last six months"
          >
            {monthlyRequests.map((item) => (
              <div
                key={item.key}
                className="flex h-full flex-col items-center justify-end gap-2"
                title={`${item.label}: ${item.count} requests`}
              >
                <span className="text-xs text-(--muted)">{item.count}</span>
                <div className="flex h-32 w-full items-end rounded-t-lg bg-(--surface-muted)">
                  <div
                    className="w-full rounded-t-lg bg-(--primary)"
                    style={{
                      height: `${item.count === 0 ? 0 : Math.max((item.count / maxMonthlyCount) * 100, 8)}%`,
                    }}
                  />
                </div>
                <span className="text-xs text-(--muted)">{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-2">
        <div className="app-panel overflow-x-auto">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="font-semibold">Recent assistance requests</h2>
              <p className="mt-1 text-sm text-(--muted)">
                The five latest reported requests
              </p>
            </div>
            <Link
              href="/assistance"
              className="text-sm font-medium text-(--primary) hover:underline"
            >
              View all
            </Link>
          </div>

          {recentCases.length === 0 ? (
            <p className="p-5 text-sm text-(--muted)">
              No assistance requests have been recorded.
            </p>
          ) : (
            <table className="w-full min-w-150 text-left text-sm">
              <thead className="bg-(--surface-muted) text-(--muted)">
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

        <div className="app-panel overflow-x-auto">
          <div className="flex items-center justify-between px-5 py-4">
            <div>
              <h2 className="font-semibold">Recent surveys</h2>
              <p className="mt-1 text-sm text-(--muted)">
                The five latest survey records
              </p>
            </div>
            <Link
              href="/surveys"
              className="text-sm font-medium text-(--primary) hover:underline"
            >
              View all
            </Link>
          </div>

          {recentSurveys.length === 0 ? (
            <p className="p-5 text-sm text-(--muted)">
              No surveys have been recorded.
            </p>
          ) : (
            <table className="w-full min-w-125 text-left text-sm">
              <thead className="bg-(--surface-muted) text-(--muted)">
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

      <section className="app-panel p-5">
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
              className="inline-flex h-10 items-center rounded-lg bg-(--surface-muted) px-4 text-sm font-medium text-(--foreground) transition-colors hover:bg-(--accent) hover:text-(--accent-foreground)"
            >
              {item.label}
            </Link>
          ))}
        </div>
      </section>
    </main>
  );
}
