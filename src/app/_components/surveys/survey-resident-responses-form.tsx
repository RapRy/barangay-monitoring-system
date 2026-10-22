"use client";

import { useEffect, useState } from "react";

import { Button } from "@/app/_components/ui/button";
import { useResidents } from "@/app/_lib/graphql/hooks/residents/use-residents";
import { useSaveSurveyResidentResponses } from "@/app/_lib/graphql/hooks/surveys/use-save-survey-resident-responses";
import { useSurveyResidentResponses } from "@/app/_lib/graphql/hooks/surveys/use-survey-resident-responses";
import type { Survey } from "@/app/_lib/graphql/queries/surveys";

interface SurveyResidentResponsesFormProps {
  survey: Survey;
  onCancel: () => void;
  onSuccess: () => void;
  onError: (message: string) => void;
}

interface ResponseDraft {
  employment_status: string;
  educational_status: string;
  health_concerns: string;
}

export default function SurveyResidentResponsesForm({
  survey,
  onCancel,
  onSuccess,
  onError,
}: SurveyResidentResponsesFormProps) {
  const residentsQuery = useResidents(survey.household_id);
  const responsesQuery = useSurveyResidentResponses(survey.id);
  const saveResponses = useSaveSurveyResidentResponses();

  const residents = residentsQuery.data ?? [];
  const responses = responsesQuery.data ?? [];

  const [drafts, setDrafts] = useState<Record<string, ResponseDraft>>({});

  useEffect(() => {
    if (residentsQuery.isLoading || responsesQuery.isLoading) return;

    const savedByResidentId = new Map(
      responses
        .filter(
          (response): response is typeof response & { resident_id: string } =>
            response.resident_id !== null,
        )
        .map((response) => [response.resident_id, response]),
    );

    const nextDrafts: Record<string, ResponseDraft> = {};

    for (const resident of residents) {
      const saved = savedByResidentId.get(resident.id);

      nextDrafts[resident.id] = {
        employment_status: saved?.employment_status ?? "",
        educational_status: saved?.educational_status ?? "",
        health_concerns: saved?.health_concerns ?? "",
      };
    }

    setDrafts(nextDrafts);
  }, [
    residents,
    responses,
    residentsQuery.isLoading,
    responsesQuery.isLoading,
  ]);

  const updateDraft = (
    residentId: string,
    field: keyof ResponseDraft,
    value: string,
  ) => {
    setDrafts((current) => ({
      ...current,
      [residentId]: {
        ...current[residentId],
        [field]: value,
      },
    }));
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      // Send every current household resident. The API upserts submitted rows;
      // it does not delete responses omitted from this list.
      await saveResponses.mutateAsync({
        surveyId: survey.id,
        inputs: residents.map((resident) => {
          const draft = drafts[resident.id];

          return {
            resident_id: resident.id,
            employment_status: draft.employment_status.trim() || null,
            educational_status: draft.educational_status.trim() || null,
            health_concerns: draft.health_concerns.trim() || null,
          };
        }),
      });

      onSuccess();
    } catch (error) {
      onError(
        error instanceof Error
          ? error.message
          : "Unable to save resident responses.",
      );
    }
  };

  if (residentsQuery.isLoading || responsesQuery.isLoading) {
    return (
      <p className="text-sm text-slate-600">Loading resident responses…</p>
    );
  }

  if (residentsQuery.isError || responsesQuery.isError) {
    const error = residentsQuery.error ?? responsesQuery.error;

    return (
      <div className="space-y-4">
        <p className="text-sm text-[var(--danger)]">
          {error instanceof Error
            ? error.message
            : "Unable to load resident responses."}
        </p>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  if (residents.length === 0) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-slate-600">
          This household has no residents to record responses for.
        </p>
        <div className="flex justify-end">
          <Button variant="outline" onClick={onCancel}>
            Close
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-slate-600">
        Record employment, education, and health information for each household
        resident.
      </p>

      <div className="max-h-[60vh] space-y-5 overflow-y-auto pr-2">
        {residents.map((resident) => {
          const name = [
            resident.first_name,
            resident.middle_name,
            resident.last_name,
          ]
            .filter(Boolean)
            .join(" ");

          const draft = drafts[resident.id] ?? {
            employment_status: "",
            educational_status: "",
            health_concerns: "",
          };

          return (
            <section
              key={resident.id}
              className="space-y-4 rounded-lg border p-4"
            >
              <h3 className="font-semibold">{name}</h3>

              <div className="grid gap-4 md:grid-cols-2">
                <label className="space-y-1 text-sm">
                  <span className="font-medium">Employment status</span>
                  <input
                    value={draft.employment_status}
                    onChange={(event) =>
                      updateDraft(
                        resident.id,
                        "employment_status",
                        event.target.value,
                      )
                    }
                    maxLength={200}
                    className="h-11 w-full rounded-lg border border-[var(--border)] px-3"
                    placeholder="e.g. Employed, unemployed, student"
                  />
                </label>

                <label className="space-y-1 text-sm">
                  <span className="font-medium">Educational status</span>
                  <input
                    value={draft.educational_status}
                    onChange={(event) =>
                      updateDraft(
                        resident.id,
                        "educational_status",
                        event.target.value,
                      )
                    }
                    maxLength={200}
                    className="h-11 w-full rounded-lg border border-[var(--border)] px-3"
                    placeholder="e.g. Elementary, high school, graduate"
                  />
                </label>

                <label className="space-y-1 text-sm md:col-span-2">
                  <span className="font-medium">Health concerns</span>
                  <textarea
                    value={draft.health_concerns}
                    onChange={(event) =>
                      updateDraft(
                        resident.id,
                        "health_concerns",
                        event.target.value,
                      )
                    }
                    maxLength={2000}
                    rows={3}
                    className="w-full rounded-lg border border-[var(--border)] p-3"
                    placeholder="Optional health concerns"
                  />
                </label>
              </div>
            </section>
          );
        })}
      </div>

      <div className="flex justify-end gap-3 border-t pt-4">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={saveResponses.isPending}
        >
          Cancel
        </Button>
        <Button type="submit" loading={saveResponses.isPending}>
          Save Responses
        </Button>
      </div>
    </form>
  );
}
