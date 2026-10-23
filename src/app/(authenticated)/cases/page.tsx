"use client";

import { useState } from "react";

import CreateCaseForm from "@/app/_components/cases/create-case-form";
import EditCaseForm from "@/app/_components/cases/edit-case-form";
import { Button } from "@/app/_components/ui/button";
import { Modal } from "@/app/_components/ui/modal";
import { PageHeader } from "@/app/_components/ui/page-header";
import { Toast, type ToastType } from "@/app/_components/ui/toast";
import { useCases } from "@/app/_lib/graphql/hooks/cases/use-cases";
import { useCreateCase } from "@/app/_lib/graphql/hooks/cases/use-create-case";
import { useDeleteCase } from "@/app/_lib/graphql/hooks/cases/use-delete-case";
import { useHouseholds } from "@/app/_lib/graphql/hooks/households/use-households";
import { useCurrentUser } from "@/app/_lib/graphql/hooks/use-current-user";
import type { CaseRecord } from "@/app/_lib/graphql/queries/cases";

interface ToastState {
  message: string;
  type: ToastType;
}

function formatCaseType(caseType: CaseRecord["case_type"]) {
  switch (caseType) {
    case "SOCIAL_ASSISTANCE":
      return "Social assistance";
    case "HEALTH_CONCERN":
      return "Health concern";
    case "INCIDENT":
      return "Incident";
  }
}

function formatDate(date: string | null) {
  if (!date) return "—";
  return new Date(`${date}T00:00:00`).toLocaleDateString();
}

export default function CasesPage() {
  const [selectedHouseholdId, setSelectedHouseholdId] = useState("");
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [caseToDelete, setCaseToDelete] = useState<CaseRecord | null>(null);
  const [caseToEdit, setCaseToEdit] = useState<CaseRecord | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);

  const {
    data: cases = [],
    isLoading,
    isError,
    error,
  } = useCases({
    householdId: selectedHouseholdId || undefined,
  });

  const { data: households = [] } = useHouseholds();
  const { data: user } = useCurrentUser();
  const deleteCase = useDeleteCase();

  const canCreate = user?.role === "ADMIN" || user?.role === "STAFF";
  const canDelete = user?.role === "ADMIN";

  const householdMap = new Map(
    households.map((household) => [household.id, household]),
  );

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const handleDelete = async () => {
    if (!caseToDelete) return;

    try {
      await deleteCase.mutateAsync(caseToDelete.id);
      setCaseToDelete(null);
      showToast("Case deleted successfully.", "success");
    } catch (err) {
      showToast(
        err instanceof Error ? err.message : "Unable to delete case.",
        "error",
      );
    }
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <PageHeader title="Cases" description="Loading cases..." />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6">
        <PageHeader title="Cases" />
        <p className="text-sm text-[var(--danger)]">
          {error instanceof Error ? error.message : "Unable to load cases."}
        </p>
      </main>
    );
  }

  return (
    <>
      <main className="p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            title="Cases"
            description="Track assistance requests, health concerns, and incidents."
          />

          {canCreate && (
            <Button onClick={() => setIsCreateOpen(true)}>Create Case</Button>
          )}
        </div>

        <div className="mt-6 max-w-sm">
          <label
            htmlFor="household-filter"
            className="mb-1 block text-sm font-medium"
          >
            Filter by household
          </label>
          <select
            id="household-filter"
            value={selectedHouseholdId}
            onChange={(event) => setSelectedHouseholdId(event.target.value)}
            className="h-11 w-full rounded-lg border border-[var(--border)] bg-white px-3 text-sm"
          >
            <option value="">All households</option>
            {households.map((household) => (
              <option key={household.id} value={household.id}>
                {household.household_code} - {household.household_name}
              </option>
            ))}
          </select>
        </div>

        {cases.length === 0 ? (
          <div className="mt-6 rounded-xl border p-8 text-center">
            <p className="font-medium">No cases found.</p>
            <p className="mt-1 text-sm text-slate-500">
              {selectedHouseholdId
                ? "There are no cases for this household."
                : "There are no case records yet."}
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-x-auto rounded-xl border bg-white">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium">Actions</th>
                  <th className="px-4 py-3 font-medium">Case</th>
                  <th className="px-4 py-3 font-medium">Resident</th>
                  <th className="px-4 py-3 font-medium">Household</th>
                  <th className="px-4 py-3 font-medium">Type</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium">Priority</th>
                  <th className="px-4 py-3 font-medium">Reported</th>
                  <th className="px-4 py-3 font-medium">Follow-up</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {cases.map((caseRecord) => {
                  const household = householdMap.get(caseRecord.household_id);

                  return (
                    <tr key={caseRecord.id}>
                      <td className="px-4 py-3">
                        {canCreate && (
                          <Button
                            variant="outline"
                            onClick={() => setCaseToEdit(caseRecord)}
                          >
                            Edit
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="danger"
                            onClick={() => setCaseToDelete(caseRecord)}
                          >
                            Delete
                          </Button>
                        )}
                      </td>

                      <td className="px-4 py-3">
                        <p className="font-medium">{caseRecord.title}</p>
                        {caseRecord.description && (
                          <p className="mt-1 max-w-xs truncate text-xs text-slate-500">
                            {caseRecord.description}
                          </p>
                        )}
                      </td>

                      <td className="px-4 py-3">{caseRecord.resident_name}</td>

                      <td className="px-4 py-3">
                        {household
                          ? `${household.household_code} - ${household.household_name}`
                          : caseRecord.household_id}
                      </td>

                      <td className="px-4 py-3">
                        {formatCaseType(caseRecord.case_type)}
                      </td>

                      <td className="px-4 py-3">
                        {caseRecord.status.replaceAll("_", " ")}
                      </td>

                      <td className="px-4 py-3">{caseRecord.priority}</td>
                      <td className="px-4 py-3">
                        {formatDate(caseRecord.reported_at)}
                      </td>
                      <td className="px-4 py-3">
                        {formatDate(caseRecord.follow_up_date)}
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
        title="Create Case"
      >
        <CreateCaseForm
          onCancel={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            showToast("Case created successfully.", "success");
          }}
          onError={(message) => showToast(message, "error")}
        />
      </Modal>

      <Modal
        open={!!caseToDelete}
        onClose={() => {
          if (!deleteCase.isPending) setCaseToDelete(null);
        }}
        title="Delete Case"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete the case{" "}
            <strong>{caseToDelete?.title}</strong>? This action cannot be
            undone.
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
              Delete Case
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!caseToEdit}
        onClose={() => setCaseToEdit(null)}
        title="Edit Case"
      >
        {caseToEdit && (
          <EditCaseForm
            caseRecord={caseToEdit}
            onCancel={() => setCaseToEdit(null)}
            onSuccess={() => {
              setCaseToEdit(null);
              showToast("Case updated successfully.", "success");
            }}
            onError={(message) => showToast(message, "error")}
          />
        )}
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
