"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type Point = {
  id: number;
  name: string;
  cause: string;
  city: string;
  lat: number;
  lng: number;
};

export function MapView({
  points,
  height = 480,
}: {
  points: Point[];
  height?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !ref.current) return;

      // Leaflet's default marker icons resolve by bundler path; use CDN URLs.
      const icon = L.icon({
        iconUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      map = L.map(ref.current);
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: "&copy; OpenStreetMap",
      }).addTo(map);

      const bounds = L.latLngBounds([]);
      for (const p of points) {
        const ll: [number, number] = [p.lat, p.lng];
        bounds.extend(ll);
        L.marker(ll, { icon })
          .addTo(map)
          .bindPopup(`<strong>${p.name}</strong><br/>${p.cause} · ${p.city}`);
      }
      if (points.length === 1) {
        map.setView([points[0].lat, points[0].lng], 15);
      } else if (bounds.isValid()) {
        map.fitBounds(bounds.pad(0.25));
      } else {
        map.setView([-20.3155, -40.3128], 11);
      }
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [points]);

  if (points.length === 0) {
    return (
      <p className="text-sm text-black/50">
        Nenhum ponto de coleta cadastrado ainda.
      </p>
    );
  }

  return (
    <div
      ref={ref}
      style={{ height }}
      className="w-full rounded-2xl border border-black/10 shadow-sm"
    />
  );
}
