"use client";

import { useState } from "react";

import { useHouseholds } from "@/app/_lib/graphql/hooks/households/use-households";

import { Button } from "@/app/_components/ui/button";
import { Modal } from "@/app/_components/ui/modal";
import { Toast, type ToastType } from "@/app/_components/ui/toast";

import CreateHouseholdForm from "@/app/_components/households/create-household-form";

interface ToastState {
  message: string;
  type: ToastType;
}

export default function HouseholdsPage() {
  const { data: households, isLoading, isError, error } = useHouseholds();

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  const [toast, setToast] = useState<ToastState | null>(null);

  const showToast = (message: string, type: ToastType) => {
    setToast({
      message,
      type,
    });
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

          <Button onClick={() => setIsCreateModalOpen(true)}>
            Create Household
          </Button>
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
