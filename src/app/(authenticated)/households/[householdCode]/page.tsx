"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";

import CreateResidentForm from "@/app/_components/residents/create-resident-form";
import { Button } from "@/app/_components/ui/button";
import { EmptyState } from "@/app/_components/ui/empty-state";
import { ErrorState } from "@/app/_components/ui/error-state";
import { Modal } from "@/app/_components/ui/modal";
import { PageHeader } from "@/app/_components/ui/page-header";
import { Toast, type ToastType } from "@/app/_components/ui/toast";
import { useHouseholdByCode } from "@/app/_lib/graphql/hooks/households/use-household-by-code";
import { useCurrentUser } from "@/app/_lib/graphql/hooks/use-current-user";
import { useResidents } from "@/app/_lib/graphql/hooks/residents/use-residents";
import { useDeleteResident } from "@/app/_lib/graphql/hooks/residents/use-delete-resident";
import type { Resident } from "@/app/_lib/graphql/queries/residents";
import EditResidentForm from "@/app/_components/residents/edit-resident-form";

interface ToastState {
  message: string;
  type: ToastType;
}

export default function HouseholdResidentsPage() {
  const params = useParams<{ householdCode: string }>();
  const householdCode = decodeURIComponent(params.householdCode)
    .trim()
    .toUpperCase();

  const {
    data: household,
    isLoading: isHouseholdLoading,
    isError: isHouseholdError,
    error: householdError,
  } = useHouseholdByCode(householdCode);

  const {
    data: residents = [],
    isLoading: isResidentsLoading,
    isError: isResidentsError,
    error: residentsError,
  } = useResidents(household?.id, {
    enabled: !isHouseholdLoading && Boolean(household),
  });

  const deleteResident = useDeleteResident();

  const { data: user } = useCurrentUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);
  const [residentToEdit, setResidentToEdit] = useState<Resident | null>(null);
  const [residentToDelete, setResidentToDelete] = useState<Resident | null>(
    null,
  );

  const canCreateEditResident =
    user?.role === "ADMIN" || user?.role === "STAFF";
  const canDeleteResident = user?.role === "ADMIN";

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const handleDeleteResident = async () => {
    if (!residentToDelete) return;

    try {
      await deleteResident.mutateAsync(residentToDelete.id);
      showToast(
        `${residentToDelete.first_name} ${residentToDelete.last_name} deleted successfully.`,
        "success",
      );
      setResidentToDelete(null);
    } catch (error) {
      showToast(
        error instanceof Error ? error.message : "Unable to delete resident.",
        "error",
      );
    }
  };

  if (isHouseholdLoading || isResidentsLoading) {
    return (
      <main className="p-6">
        <PageHeader
          title="Household Residents"
          description="Loading household residents..."
        />
      </main>
    );
  }

  if (isHouseholdError) {
    return (
      <main className="p-6">
        <PageHeader title="Household Residents" />
        <ErrorState
          title="Unable to load household"
          message={
            householdError instanceof Error
              ? householdError.message
              : "Something went wrong while loading this household."
          }
        />
      </main>
    );
  }

  if (!household) {
    return (
      <main className="p-6">
        <PageHeader title="Household not found" />
        <ErrorState
          title="Household not found"
          message="The selected household could not be found."
        />
      </main>
    );
  }

  if (isResidentsError) {
    return (
      <main className="p-6">
        <PageHeader
          title={household.household_name || household.household_code}
        />

        <ErrorState
          title="Unable to load residents"
          message={
            residentsError instanceof Error
              ? residentsError.message
              : "Something went wrong while loading residents."
          }
        />
      </main>
    );
  }

  return (
    <>
      <main className="p-6">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <PageHeader
            title={household.household_name || household.household_code}
            description={`${household.household_code} • ${household.barangay ?? "Barangay"} • ${household.municipality ?? "Municipality"}`}
          />

          <div className="flex gap-2">
            <Link
              href="/households"
              className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium text-slate-700 transition-colors hover:bg-slate-50"
            >
              Back to Households
            </Link>

            {canCreateEditResident && (
              <Button onClick={() => setIsCreateModalOpen(true)}>
                Create Resident
              </Button>
            )}
          </div>
        </div>

        <div className="mb-6 grid gap-4 md:grid-cols-3">
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Household Code
            </p>
            <p className="mt-2 font-semibold">{household.household_code}</p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Address
            </p>
            <p className="mt-2 font-semibold">
              {household.address ?? "No address set"}
            </p>
          </div>

          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs uppercase tracking-wide text-slate-500">
              Residents
            </p>
            <p className="mt-2 font-semibold">{residents.length}</p>
          </div>
        </div>

        {residents.length === 0 ? (
          <EmptyState
            title="No residents in this household"
            description="This household does not have any registered residents yet."
          />
        ) : (
          <div className="overflow-hidden rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  {(canCreateEditResident || canDeleteResident) && (
                    <th className="px-4 py-3 font-medium">Actions</th>
                  )}
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Sex</th>
                  <th className="px-4 py-3 font-medium">Relationship</th>
                  <th className="px-4 py-3 font-medium">Birth Date</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {residents.map((resident) => (
                  <tr key={resident.id}>
                    <td className="px-4 py-3">
                      <Link
                        href={`/residents/${resident.id}`}
                        className="inline-flex h-11 items-center justify-center rounded-lg border border-[var(--border)] bg-white px-4 text-sm font-medium text-slate-700 hover:bg-slate-50"
                      >
                        View
                      </Link>
                      {(canCreateEditResident || canDeleteResident) && (
                        <div className="flex gap-2">
                          {canCreateEditResident && (
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => setResidentToEdit(resident)}
                            >
                              Edit
                            </Button>
                          )}

                          {canDeleteResident && (
                            <Button
                              type="button"
                              variant="danger"
                              onClick={() => setResidentToDelete(resident)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-medium">
                      {resident.first_name} {resident.middle_name ?? ""}{" "}
                      {resident.last_name}
                    </td>

                    <td className="px-4 py-3">{resident.sex}</td>

                    <td className="px-4 py-3">{resident.relationship}</td>

                    <td className="px-4 py-3">
                      {new Date(resident.birth_date).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Modal
        open={!!residentToEdit}
        onClose={() => setResidentToEdit(null)}
        title="Edit Resident"
      >
        {residentToEdit && (
          <EditResidentForm
            resident={residentToEdit}
            onCancel={() => setResidentToEdit(null)}
            onSuccess={() => {
              setResidentToEdit(null);
              showToast("Resident updated successfully.", "success");
            }}
            onError={(message) => showToast(message, "error")}
          />
        )}
      </Modal>

      <Modal
        open={!!residentToDelete}
        onClose={() => {
          if (!deleteResident.isPending) setResidentToDelete(null);
        }}
        title="Delete Resident"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Delete{" "}
            <strong>
              {residentToDelete?.first_name} {residentToDelete?.last_name}
            </strong>
            ? This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={deleteResident.isPending}
              onClick={() => setResidentToDelete(null)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="danger"
              loading={deleteResident.isPending}
              onClick={handleDeleteResident}
            >
              Delete Resident
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Resident"
      >
        <CreateResidentForm
          defaultHouseholdId={household.id}
          onCancel={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);
            showToast("Resident created successfully.", "success");
          }}
          onError={(message) => {
            showToast(message, "error");
          }}
        />
      </Modal>

      {toast && (
        <div className="fixed bottom-4 right-4 z-50">
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
