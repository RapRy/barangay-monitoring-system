"use client";

import { use, useState } from "react";

import CreateResidentForm from "@/app/_components/residents/create-resident-form";
import { Button } from "@/app/_components/ui/button";
import { EmptyState } from "@/app/_components/ui/empty-state";
import { ErrorState } from "@/app/_components/ui/error-state";
import { Modal } from "@/app/_components/ui/modal";
import { PageHeader } from "@/app/_components/ui/page-header";
import { Toast, type ToastType } from "@/app/_components/ui/toast";
import { useCurrentUser } from "@/app/_lib/graphql/hooks/use-current-user";
import { useResidents } from "@/app/_lib/graphql/hooks/residents/use-residents";
import { useDeleteResident } from "@/app/_lib/graphql/hooks/residents/use-delete-resident";
import { Resident } from "@/app/_lib/graphql/queries/residents";
import EditResidentForm from "@/app/_components/residents/edit-resident-form";

interface ToastState {
  message: string;
  type: ToastType;
}

export default function ResidentsPage() {
  const { data: residents = [], isLoading, isError, error } = useResidents();
  const deleteResident = useDeleteResident();
  const { data: user } = useCurrentUser();
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [residentToDelete, setResidentToDelete] = useState<Resident | null>(
    null,
  );
  const [toast, setToast] = useState<ToastState | null>(null);

  const canCreateEditResident =
    user?.role === "ADMIN" || user?.role === "STAFF";
  const canDeleteResident = user?.role === "ADMIN";

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const toggleEditModal = (resident: Resident) => {
    setSelectedResident(isEditModalOpen ? null : resident);
    setIsEditModalOpen(!isEditModalOpen);
  };

  const handleDeleteResident = async () => {
    if (!residentToDelete) return;

    try {
      await deleteResident.mutateAsync(residentToDelete.id);
      showToast(
        `${residentToDelete.first_name} ${residentToDelete.last_name} deleted successfully`,
        "success",
      );
      setResidentToDelete(null);
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : `Unable to delete ${residentToDelete.first_name} ${residentToDelete.last_name}.`;

      showToast(message, "error");
    }
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <PageHeader title="Residents" description="Loading residents..." />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6">
        <PageHeader title="Residents" />

        <ErrorState
          title="Unable to load residents"
          message={
            error instanceof Error
              ? error.message
              : "Something went wrong while loading residents."
          }
        />
      </main>
    );
  }

  return (
    <>
      <main className="p-6">
        <div className="flex items-center justify-between gap-4">
          <PageHeader
            title="Residents"
            description="View all residents across households."
          />

          {canCreateEditResident && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create Resident
            </Button>
          )}
        </div>

        {residents.length === 0 ? (
          <div className="mt-6">
            <EmptyState
              title="No residents found"
              description="There are no household residents registered yet."
            />
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  {(canCreateEditResident || canDeleteResident) && (
                    <th className="px-4 py-3 font-medium">Actions</th>
                  )}
                  <th className="px-4 py-3 font-medium">Name</th>
                  <th className="px-4 py-3 font-medium">Household</th>
                  <th className="px-4 py-3 font-medium">Sex</th>
                  <th className="px-4 py-3 font-medium">Relationship</th>
                  <th className="px-4 py-3 font-medium">Birth Date</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {residents.map((resident) => (
                  <tr key={resident.id}>
                    {canCreateEditResident && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => toggleEditModal(resident)}
                          >
                            Edit
                          </Button>
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
                      </td>
                    )}
                    <td className="px-4 py-3 font-medium">
                      {resident.first_name} {resident.middle_name ?? ""}{" "}
                      {resident.last_name}
                    </td>

                    <td className="px-4 py-3">{resident.household_name}</td>

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
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Resident"
      >
        <CreateResidentForm
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

      <Modal
        open={!!residentToDelete}
        onClose={() => {
          if (!deleteResident.isPending) setResidentToDelete(null);
        }}
        title="Delete Resient"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete resident{" "}
            <strong>{`${residentToDelete?.first_name} ${residentToDelete?.last_name}`}</strong>
            ?
            <br />
            This action cannot be undone.
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
              Delete Household
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={isEditModalOpen && !!selectedResident}
        onClose={() => toggleEditModal(selectedResident as Resident)}
        title="Edit Resident"
      >
        {selectedResident && (
          <EditResidentForm
            resident={selectedResident}
            onCancel={() => toggleEditModal(selectedResident)}
            onSuccess={() => {
              showToast(`Resident updated successfully`, "success");
              toggleEditModal(selectedResident);
            }}
            onError={(message) => {
              showToast(message, "error");
            }}
          />
        )}
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
