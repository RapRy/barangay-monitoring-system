"use client";

import dynamic from "next/dynamic";
import { useMemo, useState } from "react";

import { PageHeader } from "@/app/_components/ui/page-header";
import { useHouseholds } from "@/app/_lib/graphql/hooks/households/use-households";

const HouseholdMap = dynamic(
  () => import("@/app/_components/maps/household-map"),
  {
    ssr: false,
    loading: () => (
      <div className="absolute inset-0 flex items-center justify-center bg-(--surface-muted) text-sm text-(--muted)">
        Loading map…
      </div>
    ),
  },
);

export default function MapPage() {
  const [selectedPurok, setSelectedPurok] = useState("");
  const [basemap, setBasemap] = useState<"street" | "satellite">("satellite");
  const { data: households = [], isLoading, isError, error } = useHouseholds();

  const puroks = useMemo(
    () =>
      [
        ...new Set(
          households.map((household) => household.purok).filter(Boolean),
        ),
      ].sort((a, b) => a.localeCompare(b)),
    [households],
  );

  const filteredHouseholds = useMemo(
    () =>
      households.filter(
        (household) => !selectedPurok || household.purok === selectedPurok,
      ),
    [households, selectedPurok],
  );

  const locatedCount = filteredHouseholds.filter(
    (household) =>
      typeof household.latitude === "number" &&
      typeof household.longitude === "number",
  ).length;

  if (isLoading) {
    return (
      <main className="p-6">
        <PageHeader title="Barangay map" description="Loading households…" />
      </main>
    );
  }

  if (isError) {
    return (
      <main className="p-6">
        <PageHeader title="Barangay map" />
        <p className="text-sm text-(--danger)">
          {error instanceof Error
            ? error.message
            : "Unable to load households."}
        </p>
      </main>
    );
  }

  return (
    <main className="map-page h-[calc(100dvh-4rem)] min-h-136">
      <section className="relative h-full min-h-0 overflow-hidden bg-(--surface-muted)">
        <HouseholdMap households={filteredHouseholds} basemap={basemap} />

        <div
          className="app-panel absolute left-4 right-4 top-4 flex flex-col gap-4 bg-white/95 p-4 backdrop-blur sm:left-6 sm:right-6 sm:top-6 sm:flex-row sm:items-center sm:justify-between sm:px-5"
          style={{ zIndex: 1100 }}
        >
          <div className="min-w-0">
            <h1 className="text-lg font-semibold tracking-tight text-(--foreground)">
              Barangay map
            </h1>
            <p className="mt-1 text-sm text-(--muted)">
              View household locations across the barangay.
            </p>
          </div>

          <div className="flex flex-wrap items-end gap-3 sm:gap-4">
            <div className="flex min-w-40 flex-col gap-1.5 sm:w-52">
              <label
                htmlFor="purok-filter"
                className="text-xs font-medium text-(--muted)"
              >
                Filter by Purok
              </label>
              <select
                id="purok-filter"
                value={selectedPurok}
                onChange={(event) => setSelectedPurok(event.target.value)}
                className="app-control w-full"
              >
                <option value="">All Puroks</option>
                {puroks.map((purok) => (
                  <option key={purok} value={purok}>
                    {purok}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex min-w-36 flex-col gap-1.5 sm:w-44">
              <label
                htmlFor="map-view"
                className="text-xs font-medium text-(--muted)"
              >
                Map view
              </label>
              <select
                id="map-view"
                value={basemap}
                onChange={(event) =>
                  setBasemap(event.target.value as "street" | "satellite")
                }
                className="app-control w-full"
              >
                <option value="satellite">Satellite imagery</option>
                <option value="street">Street map</option>
              </select>
            </div>
            <span
              className="inline-flex h-11 items-center whitespace-nowrap rounded-full bg-(--accent) px-3 text-xs font-medium text-(--accent-foreground)"
              aria-live="polite"
            >
              {locatedCount} mapped household{locatedCount === 1 ? "" : "s"}
            </span>
          </div>
        </div>
      </section>
    </main>
  );
}
