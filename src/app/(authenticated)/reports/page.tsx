"use client";

import { useMemo, useState } from "react";

import { PageHeader } from "@/app/_components/ui/page-header";
import { useCases } from "@/app/_lib/graphql/hooks/cases/use-cases";
import { useHouseholds } from "@/app/_lib/graphql/hooks/households/use-households";
import { useResidents } from "@/app/_lib/graphql/hooks/residents/use-residents";
import { useSurveys } from "@/app/_lib/graphql/hooks/surveys/use-surveys";
import type {
  CasePriority,
  CaseRecord,
  CaseStatus,
  CaseType,
} from "@/app/_lib/graphql/queries/cases";

const inputClassName =
  "h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm";

function getLocalDate() {
  const now = new Date();
  const localNow = new Date(now.getTime() - now.getTimezoneOffset() * 60_000);
  return localNow.toISOString().slice(0, 10);
}

function formatDate(value: string | null) {
  if (!value) return "—";
  return new Date(`${value}T00:00:00`).toLocaleDateString();
}

function formatType(value: CaseType) {
  switch (value) {
    case "SOCIAL_ASSISTANCE":
      return "Social assistance";
    case "HEALTH_CONCERN":
      return "Health concern";
    case "INCIDENT":
      return "Incident report";
  }
}

function formatStatus(value: CaseStatus) {
  switch (value) {
    case "OPEN":
      return "Open";
    case "IN_PROGRESS":
      return "In progress";
    case "RESOLVED":
      return "Resolved";
    case "CLOSED":
      return "Closed";
  }
}

function formatPriority(value: CasePriority) {
  return value.charAt(0) + value.slice(1).toLowerCase();
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

function countBy<T extends string>(
  records: CaseRecord[],
  getKey: (record: CaseRecord) => T,
) {
  const counts = new Map<T, number>();

  for (const record of records) {
    const key = getKey(record);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  return [...counts.entries()].sort((a, b) => b[1] - a[1]);
}

function csvCell(value: string | number) {
  let text = String(value);

  // Prevent spreadsheet apps from interpreting exported values as formulas.
  if (/^[=+\-@]/.test(text)) text = `'${text}`;

  return `"${text.replaceAll('"', '""')}"`;
}

function toFilenamePart(value: string) {
  return (
    value
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-|-$/g, "") || "household"
  );
}

function downloadCsv(
  headers: string[],
  rows: (string | number)[][],
  filename: string,
) {
  const csv = [headers, ...rows]
    .map((row) => row.map(csvCell).join(","))
    .join("\r\n");

  const blob = new Blob(["\uFEFF", csv], {
    type: "text/csv;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const [householdId, setHouseholdId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const {
    data: cases = [],
    isLoading: isCasesLoading,
    isError: isCasesError,
    error,
  } = useCases({ householdId: householdId || undefined });

  const {
    data: residents = [],
    isLoading: isResidentsLoading,
    isError: isResidentsError,
    error: residentsError,
  } = useResidents(householdId || undefined);

  const {
    data: surveys = [],
    isLoading: isSurveysLoading,
    isError: isSurveysError,
    error: surveysError,
  } = useSurveys(householdId || undefined);

  const { data: households = [], isLoading: isHouseholdsLoading } =
    useHouseholds();

  const today = getLocalDate();

  const filteredCases = useMemo(
    () =>
      cases.filter((record) => {
        if (startDate && record.reported_at < startDate) return false;
        if (endDate && record.reported_at > endDate) return false;
        return true;
      }),
    [cases, startDate, endDate],
  );

  const filteredSurveys = useMemo(
    () =>
      surveys.filter((survey) => {
        if (startDate && survey.survey_date < startDate) return false;
        if (endDate && survey.survey_date > endDate) return false;
        return true;
      }),
    [surveys, startDate, endDate],
  );

  const scopedHouseholdCount = householdId
    ? households.filter((household) => household.id === householdId).length
    : households.length;

  const surveyedHouseholdCount = new Set(
    filteredSurveys.map((survey) => survey.household_id),
  ).size;

  const residentsBySex = useMemo(() => {
    const counts = new Map<string, number>();

    for (const resident of residents) {
      counts.set(resident.sex, (counts.get(resident.sex) ?? 0) + 1);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [residents]);

  const surveysByWaterSource = useMemo(() => {
    const counts = new Map<string, number>();

    for (const survey of filteredSurveys) {
      const source = survey.water_source?.trim();
      if (source) counts.set(source, (counts.get(source) ?? 0) + 1);
    }

    return [...counts.entries()].sort((a, b) => b[1] - a[1]);
  }, [filteredSurveys]);

  const surveysWithAssistanceNeeds = filteredSurveys.filter((survey) =>
    Boolean(survey.assistance_needed?.trim()),
  ).length;

  const summary = useMemo(
    () => ({
      total: filteredCases.length,
      open: filteredCases.filter((record) => record.status === "OPEN").length,
      inProgress: filteredCases.filter(
        (record) => record.status === "IN_PROGRESS",
      ).length,
      resolved: filteredCases.filter(
        (record) => record.status === "RESOLVED" || record.status === "CLOSED",
      ).length,
      overdue: filteredCases.filter((record) => isOverdue(record, today))
        .length,
      urgent: filteredCases.filter(
        (record) => isActive(record) && record.priority === "URGENT",
      ).length,
    }),
    [filteredCases, today],
  );

  const byStatus = useMemo(
    () => countBy(filteredCases, (record) => record.status),
    [filteredCases],
  );
  const byType = useMemo(
    () => countBy(filteredCases, (record) => record.case_type),
    [filteredCases],
  );
  const byPriority = useMemo(
    () => countBy(filteredCases, (record) => record.priority),
    [filteredCases],
  );

  const householdMap = useMemo(
    () => new Map(households.map((household) => [household.id, household])),
    [households],
  );

  const selectedHousehold = householdMap.get(householdId);
  const householdFileSuffix = householdId
    ? toFilenamePart(
        selectedHousehold?.household_name ??
          selectedHousehold?.household_code ??
          "selected-household",
      )
    : "all-households";

  const exportAssistanceCsv = () => {
    const headers = [
      "Reported date",
      "Request",
      "Resident",
      "Household code",
      "Household name",
      "Type",
      "Priority",
      "Status",
      "Follow-up date",
      "Resolution notes",
    ];

    const rows = filteredCases.map((record) => {
      const household = householdMap.get(record.household_id);

      return [
        record.reported_at,
        record.title,
        record.resident_name,
        household?.household_code ?? "",
        household?.household_name ?? "",
        formatType(record.case_type),
        formatPriority(record.priority),
        formatStatus(record.status),
        record.follow_up_date ?? "",
        record.resolution_notes ?? "",
      ];
    });

    downloadCsv(headers, rows, `assistance-report-${householdFileSuffix}.csv`);
  };

  const exportSurveysCsv = () => {
    const headers = [
      "Survey date",
      "Household code",
      "Household name",
      "Family members",
      "Source of income",
      "Monthly income",
      "Water source",
      "Has electricity",
      "Has internet",
      "Housing condition",
      "Assistance needed",
      "Notes",
    ];

    const rows = filteredSurveys.map((survey) => {
      const household = householdMap.get(survey.household_id);

      return [
        survey.survey_date,
        household?.household_code ?? "",
        household?.household_name ?? "",
        survey.number_of_family_members,
        survey.source_of_income ?? "",
        survey.monthly_income ?? "",
        survey.water_source ?? "",
        survey.has_electricity === null
          ? ""
          : survey.has_electricity
            ? "Yes"
            : "No",
        survey.has_internet === null ? "" : survey.has_internet ? "Yes" : "No",
        survey.housing_condition ?? "",
        survey.assistance_needed ?? "",
        survey.notes ?? "",
      ];
    });

    downloadCsv(headers, rows, `survey-report-${householdFileSuffix}.csv`);
  };

  const exportResidentsCsv = () => {
    const headers = [
      "First name",
      "Middle name",
      "Last name",
      "Household code",
      "Household name",
      "Sex",
      "Relationship",
      "Birth date",
      "Registered date",
    ];

    const rows = residents.map((resident) => {
      const household = householdMap.get(resident.household_id);

      return [
        resident.first_name,
        resident.middle_name ?? "",
        resident.last_name,
        household?.household_code ?? "",
        household?.household_name ?? resident.household_name ?? "",
        resident.sex,
        resident.relationship,
        resident.birth_date,
        resident.created_at,
      ];
    });

    downloadCsv(headers, rows, `resident-report-${householdFileSuffix}.csv`);
  };

  if (
    isCasesLoading ||
    isHouseholdsLoading ||
    isResidentsLoading ||
    isSurveysLoading
  ) {
    return (
      <main className="p-6">
        <PageHeader
          title="Reports"
          description="Loading assistance report..."
        />
      </main>
    );
  }

  if (isCasesError || isResidentsError || isSurveysError) {
    const loadError = error ?? residentsError ?? surveysError;

    return (
      <main className="p-6">
        <PageHeader title="Reports" />
        <p className="text-sm text-[var(--danger)]">
          {loadError instanceof Error
            ? loadError.message
            : "Unable to load report data."}
        </p>
      </main>
    );
  }

  return (
    <main className="space-y-6 p-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <PageHeader
          title="Reports"
          description="Assistance requests reported during the selected period."
        />

        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={exportAssistanceCsv}
            disabled={filteredCases.length === 0}
            className="inline-flex h-11 items-center justify-center rounded-lg bg-[var(--primary)] px-4 text-sm font-medium text-white hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export assistance CSV
          </button>

          <button
            type="button"
            onClick={exportSurveysCsv}
            disabled={filteredSurveys.length === 0}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export surveys CSV
          </button>

          <button
            type="button"
            onClick={exportResidentsCsv}
            disabled={residents.length === 0}
            className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Export residents CSV
          </button>
        </div>
      </div>

      <section
        aria-label="Report filters"
        className="grid gap-4 rounded-xl border bg-white p-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        <div>
          <label
            htmlFor="report-household"
            className="mb-1 block text-sm font-medium"
          >
            Household
          </label>
          <select
            id="report-household"
            value={householdId}
            onChange={(event) => setHouseholdId(event.target.value)}
            className={inputClassName}
          >
            <option value="">All households</option>
            {households.map((household) => (
              <option key={household.id} value={household.id}>
                {household.household_code} — {household.household_name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label
            htmlFor="report-start-date"
            className="mb-1 block text-sm font-medium"
          >
            Reported from
          </label>
          <input
            id="report-start-date"
            type="date"
            value={startDate}
            max={endDate || undefined}
            onChange={(event) => setStartDate(event.target.value)}
            className={inputClassName}
          />
        </div>

        <div>
          <label
            htmlFor="report-end-date"
            className="mb-1 block text-sm font-medium"
          >
            Reported to
          </label>
          <input
            id="report-end-date"
            type="date"
            value={endDate}
            min={startDate || undefined}
            onChange={(event) => setEndDate(event.target.value)}
            className={inputClassName}
          />
        </div>
      </section>

      <section
        aria-label="Assistance report summary"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3"
      >
        {[
          {
            label: "Total requests",
            value: summary.total,
            color: "text-slate-900",
          },
          { label: "Open", value: summary.open, color: "text-blue-700" },
          {
            label: "In progress",
            value: summary.inProgress,
            color: "text-amber-700",
          },
          {
            label: "Resolved or closed",
            value: summary.resolved,
            color: "text-emerald-700",
          },
          {
            label: "Overdue follow-ups",
            value: summary.overdue,
            color: "text-red-700",
          },
          {
            label: "Urgent active requests",
            value: summary.urgent,
            color: "text-orange-700",
          },
        ].map((item) => (
          <div key={item.label} className="rounded-xl border bg-white p-5">
            <p className="text-sm text-slate-500">{item.label}</p>
            <p className={`mt-2 text-3xl font-semibold ${item.color}`}>
              {item.value}
            </p>
          </div>
        ))}
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        {[
          {
            title: "By status",
            rows: byStatus.map(
              ([key, count]) => [formatStatus(key), count] as const,
            ),
          },
          {
            title: "By request type",
            rows: byType.map(
              ([key, count]) => [formatType(key), count] as const,
            ),
          },
          {
            title: "By priority",
            rows: byPriority.map(
              ([key, count]) => [formatPriority(key), count] as const,
            ),
          },
        ].map((group) => (
          <div key={group.title} className="rounded-xl border bg-white p-5">
            <h2 className="font-semibold">{group.title}</h2>
            {group.rows.length === 0 ? (
              <p className="mt-4 text-sm text-slate-500">
                No matching requests.
              </p>
            ) : (
              <ul className="mt-4 divide-y">
                {group.rows.map(([label, count]) => (
                  <li
                    key={label}
                    className="flex justify-between gap-3 py-3 text-sm"
                  >
                    <span>{label}</span>
                    <span className="font-medium">{count}</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </section>

      <section aria-label="Community report summary">
        <h2 className="mb-3 text-lg font-semibold">Community snapshot</h2>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            {
              label: "Registered households",
              value: scopedHouseholdCount,
            },
            {
              label: "Registered residents",
              value: residents.length,
            },
            {
              label: "Surveys in selected period",
              value: filteredSurveys.length,
            },
            {
              label: "Households surveyed",
              value: surveyedHouseholdCount,
            },
          ].map((item) => (
            <div key={item.label} className="rounded-xl border bg-white p-5">
              <p className="text-sm text-slate-500">{item.label}</p>
              <p className="mt-2 text-3xl font-semibold">{item.value}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="grid gap-6 xl:grid-cols-3">
        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Residents by sex</h2>
          {residentsBySex.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">No residents found.</p>
          ) : (
            <ul className="mt-4 divide-y">
              {residentsBySex.map(([label, count]) => (
                <li
                  key={label}
                  className="flex justify-between gap-3 py-3 text-sm"
                >
                  <span>{label}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Surveys by water source</h2>
          {surveysByWaterSource.length === 0 ? (
            <p className="mt-4 text-sm text-slate-500">
              No water-source data in this period.
            </p>
          ) : (
            <ul className="mt-4 divide-y">
              {surveysByWaterSource.map(([label, count]) => (
                <li
                  key={label}
                  className="flex justify-between gap-3 py-3 text-sm"
                >
                  <span>{label}</span>
                  <span className="font-medium">{count}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-xl border bg-white p-5">
          <h2 className="font-semibold">Assistance needs in surveys</h2>
          <p className="mt-4 text-3xl font-semibold">
            {surveysWithAssistanceNeeds}
          </p>
          <p className="mt-1 text-sm text-slate-500">
            Surveys with an assistance-needs entry in the selected period.
          </p>
        </div>
      </section>

      <section className="overflow-x-auto rounded-xl border bg-white">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-4 py-4">
          <h2 className="font-semibold">Matching assistance requests</h2>
          <p className="text-sm text-slate-500">
            {filteredCases.length} record{filteredCases.length === 1 ? "" : "s"}
          </p>
        </div>

        {filteredCases.length === 0 ? (
          <p className="p-6 text-sm text-slate-500">
            No assistance requests match the selected filters.
          </p>
        ) : (
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="border-b bg-slate-50">
              <tr>
                <th className="px-4 py-3 font-medium">Reported</th>
                <th className="px-4 py-3 font-medium">Request</th>
                <th className="px-4 py-3 font-medium">Resident</th>
                <th className="px-4 py-3 font-medium">Household</th>
                <th className="px-4 py-3 font-medium">Type</th>
                <th className="px-4 py-3 font-medium">Priority</th>
                <th className="px-4 py-3 font-medium">Status</th>
                <th className="px-4 py-3 font-medium">Follow-up</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredCases.map((record) => {
                const household = householdMap.get(record.household_id);
                const overdue = isOverdue(record, today);

                return (
                  <tr key={record.id}>
                    <td className="px-4 py-3">
                      {formatDate(record.reported_at)}
                    </td>
                    <td className="px-4 py-3 font-medium">{record.title}</td>
                    <td className="px-4 py-3">{record.resident_name}</td>
                    <td className="px-4 py-3">
                      {household
                        ? `${household.household_code} — ${household.household_name}`
                        : "Household unavailable"}
                    </td>
                    <td className="px-4 py-3">
                      {formatType(record.case_type)}
                    </td>
                    <td className="px-4 py-3">
                      {formatPriority(record.priority)}
                    </td>
                    <td className="px-4 py-3">{formatStatus(record.status)}</td>
                    <td
                      className={`px-4 py-3 ${
                        overdue ? "font-medium text-red-700" : ""
                      }`}
                    >
                      {record.follow_up_date
                        ? formatDate(record.follow_up_date)
                        : "—"}
                      {overdue && <span className="ml-2 text-xs">Overdue</span>}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </section>
    </main>
  );
}
