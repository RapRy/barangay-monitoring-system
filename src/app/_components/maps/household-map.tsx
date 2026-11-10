"use client";

import { useEffect } from "react";
import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
  ZoomControl,
} from "react-leaflet";

import type { Household } from "@/app/_lib/graphql/queries/households";

interface HouseholdMapProps {
  households: Household[];
  basemap: "street" | "satellite";
}

function MapResizeHandler() {
  const map = useMap();

  useEffect(() => {
    const container = map.getContainer();
    const observer = new ResizeObserver(() => {
      map.invalidateSize({ pan: false });
    });

    observer.observe(container);
    requestAnimationFrame(() => map.invalidateSize({ pan: false }));

    return () => observer.disconnect();
  }, [map]);

  return null;
}

export default function HouseholdMap({
  households,
  basemap,
}: HouseholdMapProps) {
  const locatedHouseholds = households.filter(
    (
      household,
    ): household is Household & {
      latitude: number;
      longitude: number;
    } =>
      typeof household.latitude === "number" &&
      typeof household.longitude === "number",
  );

  const positions = locatedHouseholds.map(
    (household) =>
      [household.latitude, household.longitude] as [number, number],
  );

  if (locatedHouseholds.length === 0) {
    return (
      <div className="absolute inset-0 flex items-center justify-center bg-(--surface-muted) p-6 text-center text-sm text-(--muted)">
        No households with coordinates match this filter.
      </div>
    );
  }

  return (
    <MapContainer
      center={positions[0]}
      zoom={locatedHouseholds.length === 1 ? 18 : 13}
      bounds={positions.length > 1 ? positions : undefined}
      boundsOptions={{ padding: [30, 30], maxZoom: 19 }}
      maxZoom={19}
      zoomControl={false}
      scrollWheelZoom
      className="absolute inset-0 h-full w-full rounded-none"
    >
      <MapResizeHandler />

      {basemap === "satellite" ? (
        <TileLayer
          url="https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}"
          attribution="Tiles &copy; Esri"
          maxNativeZoom={18}
          maxZoom={19}
        />
      ) : (
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          maxNativeZoom={19}
          maxZoom={19}
        />
      )}

      <ZoomControl position="bottomleft" />

      {locatedHouseholds.map((household) => (
        <CircleMarker
          key={household.id}
          center={[household.latitude, household.longitude]}
          radius={8}
          pathOptions={{
            color: "#1768c4",
            fillColor: "#2782f6",
            fillOpacity: 0.9,
          }}
        >
          <Popup>
            <div className="space-y-1">
              <p className="font-semibold">
                {household.household_name} ({household.household_code})
              </p>
              <p>{household.address ?? "Address not recorded"}</p>
              <p>
                {household.purok ? `${household.purok} · ` : ""}
                {household.barangay}
              </p>
            </div>
          </Popup>
        </CircleMarker>
      ))}
    </MapContainer>
  );
}
