"use client";

import { useState } from "react";

import { useHouseholds } from "@/app/_lib/graphql/hooks/households/use-households";
import { useDeleteHousehold } from "@/app/_lib/graphql/hooks/households/use-delete-household";
import type { Household } from "@/app/_lib/graphql/queries/households";

import { Button } from "@/app/_components/ui/button";
import { Modal } from "@/app/_components/ui/modal";
import { Toast, type ToastType } from "@/app/_components/ui/toast";

import CreateHouseholdForm from "@/app/_components/households/create-household-form";
import EditHouseholdForm from "@/app/_components/households/edit-household-form";
import { useCurrentUser } from "@/app/_lib/graphql/hooks/use-current-user";

interface ToastState {
  message: string;
  type: ToastType;
}

export default function HouseholdsPage() {
  const { data: households, isLoading, isError, error } = useHouseholds();
  const deleteHousehold = useDeleteHousehold();
  const { data: user } = useCurrentUser();

  const canCreateEditHousehold =
    user?.role === "ADMIN" || user?.role === "STAFF";
  const canDeleteHousehold = user?.role === "ADMIN";

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedHousehold, setSelectedHousehold] = useState<Household | null>(
    null,
  );
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [householdToDelete, setHouseholdToDelete] = useState<Household | null>(
    null,
  );

  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({
      message,
      type,
    });
  };

  const openEditModal = (household: Household) => {
    setSelectedHousehold(household);
    setIsEditModalOpen(true);
  };

  const closeEditModal = () => {
    setSelectedHousehold(null);
    setIsEditModalOpen(false);
  };

  const handleDeleteHousehold = async () => {
    if (!householdToDelete) {
      return;
    }

    try {
      await deleteHousehold.mutateAsync(householdToDelete.id);

      setHouseholdToDelete(null);
      showToast("Household deleted successfully.", "success");
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unable to delete household.";

      showToast(message, "error");
    }
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Households</h1>

        <p className="mt-4 text-sm text-slate-500">Loading households...</p>
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6">
        <h1 className="text-2xl font-semibold">Households</h1>

        <p className="mt-4 text-sm text-[var(--danger)]">{error.message}</p>
      </main>
    );
  }

  return (
    <>
      <main className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold">Households</h1>

            <p className="mt-1 text-sm text-slate-500">
              Manage registered households.
            </p>
          </div>

          {canCreateEditHousehold && (
            <Button onClick={() => setIsCreateModalOpen(true)}>
              Create Household
            </Button>
          )}
        </div>

        {/* Table */}
        {households?.length === 0 ? (
          <div className="mt-6 rounded-xl border p-8 text-center">
            <p className="font-medium">No households found.</p>

            <p className="mt-1 text-sm text-slate-500">
              There are currently no households registered.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  {(canCreateEditHousehold || canDeleteHousehold) && (
                    <th className="px-4 py-3 font-medium">Actions</th>
                  )}
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
                    {canCreateEditHousehold && (
                      <td className="px-4 py-3">
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="outline"
                            onClick={() => openEditModal(household)}
                          >
                            Edit
                          </Button>
                          {canDeleteHousehold && (
                            <Button
                              type="button"
                              variant="danger"
                              onClick={() => setHouseholdToDelete(household)}
                            >
                              Delete
                            </Button>
                          )}
                        </div>
                      </td>
                    )}

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

      {/* Create Household Modal */}
      <Modal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Household"
      >
        <CreateHouseholdForm
          onCancel={() => setIsCreateModalOpen(false)}
          onSuccess={() => {
            setIsCreateModalOpen(false);

            showToast("Household created successfully.", "success");
          }}
          onError={(message) => {
            showToast(message, "error");
          }}
        />
      </Modal>

      <Modal
        open={isEditModalOpen && !!selectedHousehold}
        onClose={closeEditModal}
        title="Edit Household"
      >
        {selectedHousehold && (
          <EditHouseholdForm
            household={selectedHousehold}
            onCancel={closeEditModal}
            onSuccess={() => {
              closeEditModal();
              showToast("Household updated successfully.", "success");
            }}
            onError={(message) => {
              showToast(message, "error");
            }}
          />
        )}
      </Modal>

      {/* delete confirmation modal */}
      <Modal
        open={!!householdToDelete}
        onClose={() => {
          if (!deleteHousehold.isPending) {
            setHouseholdToDelete(null);
          }
        }}
        title="Delete Household"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete household{" "}
            <strong>{householdToDelete?.household_code}</strong>?
            <br />
            This action cannot be undone.
          </p>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              disabled={deleteHousehold.isPending}
              onClick={() => setHouseholdToDelete(null)}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="danger"
              loading={deleteHousehold.isPending}
              onClick={handleDeleteHousehold}
            >
              Delete Household
            </Button>
          </div>
        </div>
      </Modal>

      {/* Toast */}
      {toast && (
        <div className="pointer-events-none fixed right-6 top-6 z-[100]">
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
