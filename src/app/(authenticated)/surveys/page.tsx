"use client";

import { useState } from "react";

import CreateSurveyForm from "@/app/_components/surveys/create-survey-form";
import EditSurveyForm from "@/app/_components/surveys/edit-survey-form";
import SurveyResidentResponsesForm from "@/app/_components/surveys/survey-resident-responses-form";
import { Button } from "@/app/_components/ui/button";
import { Modal } from "@/app/_components/ui/modal";
import { PageHeader } from "@/app/_components/ui/page-header";
import { Toast, type ToastType } from "@/app/_components/ui/toast";
import { useHouseholds } from "@/app/_lib/graphql/hooks/households/use-households";
import { useCurrentUser } from "@/app/_lib/graphql/hooks/use-current-user";
import { useDeleteSurvey } from "@/app/_lib/graphql/hooks/surveys/use-delete-survey";
import { useSurveys } from "@/app/_lib/graphql/hooks/surveys/use-surveys";
import type { Survey } from "@/app/_lib/graphql/queries/surveys";

interface ToastState {
  message: string;
  type: ToastType;
}

export default function SurveysPage() {
  const { data: surveys = [], isLoading, isError, error } = useSurveys();
  const { data: households = [] } = useHouseholds();
  const deleteSurvey = useDeleteSurvey();
  const { data: user } = useCurrentUser();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [surveyToEdit, setSurveyToEdit] = useState<Survey | null>(null);
  const [surveyToDelete, setSurveyToDelete] = useState<Survey | null>(null);
  const [surveyForResponses, setSurveyForResponses] = useState<Survey | null>(
    null,
  );
  const [toast, setToast] = useState<ToastState | null>(null);

  const canCreateEdit = user?.role === "ADMIN" || user?.role === "STAFF";
  const canDelete = user?.role === "ADMIN";

  const householdMap = new Map(
    households.map((household) => [household.id, household]),
  );

  const showToast = (message: string, type: ToastType) => {
    setToast({ message, type });
  };

  const handleDelete = async () => {
    if (!surveyToDelete) return;

    try {
      await deleteSurvey.mutateAsync(surveyToDelete.id);

      setSurveyToDelete(null);
      showToast("Survey deleted successfully.", "success");
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Unable to delete survey.";

      showToast(message, "error");
    }
  };

  if (isLoading) {
    return (
      <main className="p-6">
        <PageHeader title="Surveys" description="Loading surveys..." />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6">
        <PageHeader title="Surveys" />
        <p className="text-sm text-(-danger)">
          {error instanceof Error ? error.message : "Unable to load surveys."}
        </p>
      </main>
    );
  }

  return (
    <>
      <main className="p-6">
        <div className="flex items-center justify-between gap-4">
          <PageHeader
            title="Surveys"
            description="Track household survey records and family conditions."
          />

          {canCreateEdit && (
            <Button onClick={() => setIsCreateOpen(true)}>Create Survey</Button>
          )}
        </div>

        {surveys.length === 0 ? (
          <div className="mt-6 rounded-xl border p-8 text-center">
            <p className="font-medium">No surveys found.</p>
            <p className="mt-1 text-sm text-slate-500">
              There are no survey records yet.
            </p>
          </div>
        ) : (
          <div className="mt-6 overflow-hidden rounded-xl border bg-white">
            <table className="w-full text-left text-sm">
              <thead className="border-b bg-slate-50">
                <tr>
                  <th className="px-4 py-3 font-medium">Actions</th>

                  <th className="px-4 py-3 font-medium">Household</th>
                  <th className="px-4 py-3 font-medium">Survey Date</th>
                  <th className="px-4 py-3 font-medium">Family Members</th>
                  <th className="px-4 py-3 font-medium">Monthly Income</th>
                  <th className="px-4 py-3 font-medium">Water Source</th>
                </tr>
              </thead>

              <tbody className="divide-y">
                {surveys.map((survey) => (
                  <tr key={survey.id}>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-2">
                        {canCreateEdit && (
                          <Button
                            variant="outline"
                            onClick={() => setSurveyForResponses(survey)}
                          >
                            Responses
                          </Button>
                        )}
                        {canCreateEdit && (
                          <Button
                            variant="outline"
                            onClick={() => {
                              setSurveyToEdit(survey);
                              setIsEditOpen(true);
                            }}
                          >
                            Edit
                          </Button>
                        )}

                        {canDelete && (
                          <Button
                            variant="danger"
                            onClick={() => setSurveyToDelete(survey)}
                          >
                            Delete
                          </Button>
                        )}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      {householdMap.get(survey.household_id)?.household_code ??
                        survey.household_id}
                    </td>

                    <td className="px-4 py-3">
                      {survey.survey_date
                        ? new Date(
                            `${survey.survey_date}T00:00:00`,
                          ).toLocaleDateString()
                        : "—"}
                    </td>

                    <td className="px-4 py-3">
                      {survey.number_of_family_members}
                    </td>

                    <td className="px-4 py-3">
                      {survey.monthly_income !== null &&
                      survey.monthly_income !== undefined
                        ? `₱${survey.monthly_income.toLocaleString()}`
                        : "—"}
                    </td>

                    <td className="px-4 py-3">{survey.water_source ?? "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>

      <Modal
        open={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Survey"
      >
        <CreateSurveyForm
          onCancel={() => setIsCreateOpen(false)}
          onSuccess={() => {
            setIsCreateOpen(false);
            showToast("Survey created successfully.", "success");
          }}
          onError={(message) => {
            showToast(message, "error");
          }}
        />
      </Modal>

      <Modal
        open={isEditOpen && !!surveyToEdit}
        onClose={() => setIsEditOpen(false)}
        title="Edit Survey"
      >
        {surveyToEdit && (
          <EditSurveyForm
            survey={surveyToEdit}
            onCancel={() => setIsEditOpen(false)}
            onSuccess={() => {
              setIsEditOpen(false);
              setSurveyToEdit(null);
              showToast("Survey updated successfully.", "success");
            }}
            onError={(message) => {
              showToast(message, "error");
            }}
          />
        )}
      </Modal>

      <Modal
        open={!!surveyToDelete}
        onClose={() => {
          if (!deleteSurvey.isPending) {
            setSurveyToDelete(null);
          }
        }}
        title="Delete Survey"
      >
        <div className="space-y-6">
          <p className="text-sm text-slate-600">
            Are you sure you want to delete this survey record?
          </p>

          <div className="flex justify-end gap-3 border-t pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => setSurveyToDelete(null)}
              disabled={deleteSurvey.isPending}
            >
              Cancel
            </Button>

            <Button
              type="button"
              variant="danger"
              loading={deleteSurvey.isPending}
              onClick={handleDelete}
            >
              Delete Survey
            </Button>
          </div>
        </div>
      </Modal>

      <Modal
        open={!!surveyForResponses}
        onClose={() => setSurveyForResponses(null)}
        title="Resident Survey Responses"
        className="max-w-5xl"
      >
        {surveyForResponses && (
          <SurveyResidentResponsesForm
            survey={surveyForResponses}
            onCancel={() => setSurveyForResponses(null)}
            onSuccess={() => {
              setSurveyForResponses(null);
              showToast("Resident responses saved successfully.", "success");
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
