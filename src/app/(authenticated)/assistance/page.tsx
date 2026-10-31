"use client";

import { useMemo, useState } from "react";

import CreateCaseForm from "@/app/_components/cases/create-case-form";
import EditCaseForm from "@/app/_components/cases/edit-case-form";
import { Button } from "@/app/_components/ui/button";
import { Modal } from "@/app/_components/ui/modal";
import { PageHeader } from "@/app/_components/ui/page-header";
import { Toast, type ToastType } from "@/app/_components/ui/toast";
import { useCases } from "@/app/_lib/graphql/hooks/cases/use-cases";
import { useDeleteCase } from "@/app/_lib/graphql/hooks/cases/use-delete-case";
import { useHouseholds } from "@/app/_lib/graphql/hooks/households/use-households";
import { useCurrentUser } from "@/app/_lib/graphql/hooks/use-current-user";
import type {
  CasePriority,
  CaseRecord,
  CaseStatus,
  CaseType,
} from "@/app/_lib/graphql/queries/cases";

interface ToastState {
  message: string;
  type: ToastType;
}

type QueueTab = "ALL" | "NEEDS_ATTENTION" | CaseStatus;

const queueTabs: { label: string; value: QueueTab }[] = [
  { label: "All", value: "ALL" },
  { label: "Needs attention", value: "NEEDS_ATTENTION" },
  { label: "Open", value: "OPEN" },
  { label: "In progress", value: "IN_PROGRESS" },
  { label: "Resolved", value: "RESOLVED" },
  { label: "Closed", value: "CLOSED" },
];

const controlClassName =
  "h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm";

function getTodayDate() {
  const today = new Date();
  const localToday = new Date(
    today.getTime() - today.getTimezoneOffset() * 60_000,
  );

  return localToday.toISOString().slice(0, 10);
}

function formatDate(date: string | null) {
  if (!date) return "Not scheduled";
  return new Date(`${date}T00:00:00`).toLocaleDateString();
}

function formatCaseType(type: CaseType) {
  switch (type) {
    case "SOCIAL_ASSISTANCE":
      return "Social assistance";
    case "HEALTH_CONCERN":
      return "Health concern";
    case "INCIDENT":
      return "Incident report";
  }
}

function formatStatus(status: CaseStatus) {
  switch (status) {
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

function formatPriority(priority: CasePriority) {
  return priority.charAt(0) + priority.slice(1).toLowerCase();
}

function isActive(record: CaseRecord) {
  return record.status === "OPEN" || record.status === "IN_PROGRESS";
}

function isOverdue(record: CaseRecord, today: string) {
  return (
    isActive(record) &&
    record.follow_up_date !== null &&
    record.follow_up_date < today
  );
}

function needsAttention(record: CaseRecord, today: string) {
  return (
    isOverdue(record, today) ||
    (isActive(record) && record.priority === "URGENT")
  );
}

function statusBadgeClass(status: CaseStatus) {
  switch (status) {
    case "OPEN":
      return "bg-blue-50 text-blue-700";
    case "IN_PROGRESS":
      return "bg-amber-50 text-amber-700";
    case "RESOLVED":
      return "bg-emerald-50 text-emerald-700";
    case "CLOSED":
      return "bg-slate-100 text-slate-600";
  }
}

function priorityBadgeClass(priority: CasePriority) {
  switch (priority) {
    case "URGENT":
      return "bg-red-50 text-red-700";
    case "HIGH":
      return "bg-orange-50 text-orange-700";
    case "MEDIUM":
      return "bg-amber-50 text-amber-700";
    case "LOW":
      return "bg-slate-100 text-slate-600";
  }
}

function SummaryCard({
  label,
  value,
  hint,
  valueClassName,
}: {
  label: string;
  value: number;
  hint: string;
  valueClassName: string;
}) {
  return (
    <div className="rounded-xl border bg-white p-5">
      <p className="text-sm text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-semibold ${valueClassName}`}>{value}</p>
      <p className="mt-1 text-xs text-slate-500">{hint}</p>
    </div>
  );
}

export default function AssistancePage() {
  const [householdId, setHouseholdId] = useState("");
  const [tab, setTab] = useState<QueueTab>("ALL");
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [priorityFilter, setPriorityFilter] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [caseToEdit, setCaseToEdit] = useState<CaseRecord | null>(null);
  const [caseToDelete, setCaseToDelete] = useState<CaseRecord | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const {
    data: cases = [],
    isLoading,
    isError,
    error,
  } = useCases({ householdId: householdId || undefined });

  const { data: households = [] } = useHouseholds();
  const { data: user } = useCurrentUser();
  const deleteCase = useDeleteCase();

  const canCreate = user?.role === "ADMIN" || user?.role === "STAFF";
  const canDelete = user?.role === "ADMIN";
  const today = getTodayDate();

  const householdMap = useMemo(
    () => new Map(households.map((household) => [household.id, household])),
    [households],
  );

  const summary = useMemo(() => {
    const open = cases.filter((record) => record.status === "OPEN").length;
    const inProgress = cases.filter(
      (record) => record.status === "IN_PROGRESS",
    ).length;
    const overdue = cases.filter((record) => isOverdue(record, today)).length;
    const urgent = cases.filter(
      (record) => isActive(record) && record.priority === "URGENT",
    ).length;
    const attention = cases.filter((record) =>
      needsAttention(record, today),
    ).length;

    return { open, inProgress, overdue, urgent, attention };
  }, [cases, today]);

  const filteredCases = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return cases
      .filter((record) => {
        if (tab === "NEEDS_ATTENTION" && !needsAttention(record, today)) {
          return false;
        }

        if (
          tab !== "ALL" &&
          tab !== "NEEDS_ATTENTION" &&
          record.status !== tab
        ) {
          return false;
        }

        if (typeFilter && record.case_type !== typeFilter) return false;
        if (priorityFilter && record.priority !== priorityFilter) return false;

        if (normalizedSearch) {
          const household = householdMap.get(record.household_id);
          const searchableText = [
            record.title,
            record.description ?? "",
            record.resident_name,
            household?.household_code ?? "",
            household?.household_name ?? "",
          ]
            .join(" ")
            .toLowerCase();

          if (!searchableText.includes(normalizedSearch)) return false;
        }

        return true;
      })
      .sort((a, b) => {
        const rank = (record: CaseRecord) => {
          if (isOverdue(record, today)) return 0;
          if (isActive(record) && record.priority === "URGENT") return 1;
          return 2;
        };

        const rankDifference = rank(a) - rank(b);
        if (rankDifference !== 0) return rankDifference;

        if (a.follow_up_date && b.follow_up_date) {
          const dateDifference = a.follow_up_date.localeCompare(
            b.follow_up_date,
          );
          if (dateDifference !== 0) return dateDifference;
        } else if (a.follow_up_date) {
          return -1;
        } else if (b.follow_up_date) {
          return 1;
        }

        return b.reported_at.localeCompare(a.reported_at);
      });
  }, [cases, householdMap, priorityFilter, search, tab, today, typeFilter]);

  const hasFilters =
    tab !== "ALL" ||
    Boolean(householdId) ||
    Boolean(search) ||
    Boolean(typeFilter) ||
    Boolean(priorityFilter);

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const clearFilters = () => {
    setHouseholdId("");
    setTab("ALL");
    setSearch("");
    setTypeFilter("");
    setPriorityFilter("");
  };

  const handleDelete = async () => {
    if (!caseToDelete) return;

    try {
      await deleteCase.mutateAsync(caseToDelete.id);
      setCaseToDelete(null);
      showToast("Assistance record deleted.", "success");
    } catch (deleteError) {
      showToast(
        deleteError instanceof Error
          ? deleteError.message
          : "Unable to delete this record.",
        "error",
      );
    }
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <PageHeader
          title="Assistance tracking"
          description="Loading assistance requests..."
        />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6">
        <PageHeader title="Assistance tracking" />
        <p className="text-sm text-[var(--danger)]">
          {error instanceof Error
            ? error.message
            : "Unable to load assistance requests."}
        </p>
      </main>
    );
  }

  return (
    <>
      <main className="space-y-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            title="Assistance tracking"
            description="Review requests, monitor follow-ups, and record outcomes."
          />
          {canCreate && (
            <Button onClick={() => setIsCreateOpen(true)}>Log a request</Button>
          )}
        </div>

        <section
          aria-label="Assistance request summary"
          className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
        >
          <SummaryCard
            label="Open"
            value={summary.open}
            hint="Waiting to be reviewed"
            valueClassName="text-blue-700"
          />
          <SummaryCard
            label="In progress"
            value={summary.inProgress}
            hint="Currently being handled"
            valueClassName="text-amber-700"
          />
          <SummaryCard
            label="Follow-up overdue"
            value={summary.overdue}
            hint="Active requests past their follow-up date"
            valueClassName="text-red-700"
          />
          <SummaryCard
            label="Urgent"
            value={summary.urgent}
            hint="Active requests needing priority attention"
            valueClassName="text-orange-700"
          />
        </section>

        <section className="rounded-xl border bg-white p-4 sm:p-5">
          <nav
            aria-label="Assistance request status"
            className="flex gap-2 overflow-x-auto border-b pb-3"
          >
            {queueTabs.map((item) => (
              <button
                key={item.value}
                type="button"
                aria-pressed={tab === item.value}
                onClick={() => setTab(item.value)}
                className={`shrink-0 rounded-lg px-3 py-2 text-sm font-medium ${
                  tab === item.value
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100"
                }`}
              >
                {item.label}
                {item.value === "NEEDS_ATTENTION" && (
                  <span
                    className={`ml-2 rounded-full px-2 py-0.5 text-xs ${
                      tab === item.value
                        ? "bg-white/20 text-white"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {summary.attention}
                  </span>
                )}
              </button>
            ))}
          </nav>

          <div className="mt-4 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div className="sm:col-span-2 xl:col-span-1">
              <label htmlFor="assistance-search" className="sr-only">
                Search requests
              </label>
              <input
                id="assistance-search"
                type="search"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
                placeholder="Search title, resident, household"
                className={controlClassName}
              />
            </div>

            <div>
              <label htmlFor="assistance-household-filter" className="sr-only">
                Filter by household
              </label>
              <select
                id="assistance-household-filter"
                value={householdId}
                onChange={(event) => setHouseholdId(event.target.value)}
                className={controlClassName}
              >
                <option value="">All households</option>
                {households.map((household) => (
                  <option key={household.id} value={household.id}>
                    {household.household_code} - {household.household_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="assistance-type-filter" className="sr-only">
                Filter by request type
              </label>
              <select
                id="assistance-type-filter"
                value={typeFilter}
                onChange={(event) => setTypeFilter(event.target.value)}
                className={controlClassName}
              >
                <option value="">All types</option>
                <option value="SOCIAL_ASSISTANCE">Social assistance</option>
                <option value="HEALTH_CONCERN">Health concern</option>
                <option value="INCIDENT">Incident report</option>
              </select>
            </div>

            <div>
              <label htmlFor="assistance-priority-filter" className="sr-only">
                Filter by priority
              </label>
              <select
                id="assistance-priority-filter"
                value={priorityFilter}
                onChange={(event) => setPriorityFilter(event.target.value)}
                className={controlClassName}
              >
                <option value="">All priorities</option>
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-500" aria-live="polite">
              Showing {filteredCases.length} of {cases.length} requests
            </p>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="text-sm font-medium text-slate-700 underline underline-offset-2"
              >
                Clear filters
              </button>
            )}
          </div>
        </section>

        {filteredCases.length === 0 ? (
          <div className="rounded-xl border bg-white p-8 text-center">
            <p className="font-medium">
              {cases.length === 0
                ? "No assistance requests yet."
                : "No requests match these filters."}
            </p>
            <p className="mt-1 text-sm text-slate-500">
              {cases.length === 0
                ? "Log a request to start tracking assistance."
                : "Try changing your search or clearing the filters."}
            </p>
            {hasFilters && (
              <Button variant="outline" className="mt-4" onClick={clearFilters}>
                Clear filters
              </Button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto rounded-xl border bg-white">
            <table className="w-full min-w-[1000px] text-left text-sm">
              <thead className="border-b bg-slate-50 text-slate-600">
                <tr>
                  <th className="px-4 py-3 font-medium">Request</th>
                  <th className="px-4 py-3 font-medium">Resident</th>
                  <th className="px-4 py-3 font-medium">Household</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Follow-up</th>
                  <th className="px-4 py-3 font-medium">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {filteredCases.map((record) => {
                  const household = householdMap.get(record.household_id);
                  const overdue = isOverdue(record, today);
                  const dueToday =
                    isActive(record) && record.follow_up_date === today;

                  return (
                    <tr key={record.id} className="align-top">
                      <td className="max-w-xs px-4 py-4">
                        <p className="font-medium text-slate-900">
                          {record.title}
                        </p>
                        {record.description && (
                          <p className="mt-1 text-xs text-slate-500">
                            {record.description}
                          </p>
                        )}
                        <p className="mt-2 text-xs text-slate-400">
                          Reported {formatDate(record.reported_at)}
                        </p>
                      </td>

                      <td className="px-4 py-4">{record.resident_name}</td>

                      <td className="px-4 py-4">
                        {household
                          ? `${household.household_code} - ${household.household_name}`
                          : "Household unavailable"}
                      </td>

                      <td className="px-4 py-4">
                        {formatCaseType(record.case_type)}
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${priorityBadgeClass(record.priority)}`}
                        >
                          {formatPriority(record.priority)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${statusBadgeClass(record.status)}`}
                        >
                          {formatStatus(record.status)}
                        </span>
                      </td>

                      <td className="px-4 py-4">
                        <p
                          className={
                            overdue
                              ? "font-medium text-red-700"
                              : dueToday
                                ? "font-medium text-amber-700"
                                : "text-slate-700"
                          }
                        >
                          {formatDate(record.follow_up_date)}
                        </p>
                        {overdue && (
                          <p className="mt-1 text-xs font-medium text-red-600">
                            Overdue
                          </p>
                        )}
                        {dueToday && (
                          <p className="mt-1 text-xs font-medium text-amber-600">
                            Due today
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-4">
                        <div className="flex flex-wrap gap-2">
                          {canCreate && (
                            <Button
                              variant="outline"
                              onClick={() => setCaseToEdit(record)}
                            >
                              Review / update
                            </Button>
                          )}
                          {canDelete && (
                            <Button
                              variant="danger"
                              onClick={() => setCaseToDelete(record)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Log assistance request"
      >
        <CreateCaseForm
          onCancel={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            showToast("Assistance request logged.", "success");
          }}
          onError={(message) => showToast(message, "error")}
        />
      </Modal>

      <Modal
        open={!!caseToEdit}
        onClose={() => setCaseToEdit(null)}
        title="Review assistance request"
      >
        {caseToEdit && (
          <EditCaseForm
            caseRecord={caseToEdit}
            onCancel={() => setCaseToEdit(null)}
            onSuccess={() => {
              setCaseToEdit(null);
              showToast("Assistance request updated.", "success");
            }}
            onError={(message) => showToast(message, "error")}
          />
        )}
      </Modal>

      <Modal
        open={!!caseToDelete}
        onClose={() => {
          if (!deleteCase.isPending) setCaseToDelete(null);
        }}
        title="Delete assistance record"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Delete the assistance record <strong>{caseToDelete?.title}</strong>?
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              variant="outline"
              onClick={() => setCaseToDelete(null)}
              disabled={deleteCase.isPending}
            >
              Cancel
            </Button>
            <Button
              variant="danger"
              loading={deleteCase.isPending}
              onClick={handleDelete}
            >
              Delete record
            </Button>
          </div>
        </div>
      </Modal>

      {toast && (
        <div className="fixed bottom-5 right-5 z-50">
          <Toast
            message={toast.message}
            type={toast.type}
            onClose={() => setToast(null)}
          />
        </div>
      )}
    </>
  );
}
