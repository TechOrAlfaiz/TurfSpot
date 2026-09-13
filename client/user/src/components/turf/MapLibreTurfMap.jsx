import React, { useEffect, useRef, useState } from "react";
import * as maplibregl from "maplibre-gl";
import maplibreglWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";
import axiosInstance from "../../hooks/useAxiosInstance";
import { Navigation, MapPin, AlertCircle, Compass, ExternalLink, LocateFixed } from "lucide-react";
import useUserLocation from "../../hooks/useUserLocation";

// Ensure MapLibre Web Worker is resolved correctly in Vite (prevents 404 in .vite/deps)
if (typeof maplibregl.setWorkerUrl === "function") {
  maplibregl.setWorkerUrl(maplibreglWorkerUrl);
}

const OPENFREEMAP_STYLE =
  import.meta.env.VITE_OPENFREEMAP_STYLE_URL ||
  "https://tiles.openfreemap.org/styles/liberty";

const MapLibreTurfMap = ({ turf }) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const turfMarkerRef = useRef(null);
  const userMarkerRef = useRef(null);

  const { lat: userLat, lng: userLng, isGPS, requestCurrentLocation } = useUserLocation();
  const [straightDistance, setStraightDistance] = useState(null);
  const [distLoading, setDistLoading] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Extract turf coordinates: GeoJSON [longitude, latitude]
  const turfCoords =
    turf?.location?.coordinates && turf.location.coordinates.length >= 2
      ? [turf.location.coordinates[0], turf.location.coordinates[1]] // [lng, lat]
      : [75.7684, 26.8533]; // Fallback Jaipur coordinates

  const turfLat = turfCoords[1];
  const turfLng = turfCoords[0];

  // External directions URL for native device navigation
  const directionsUrl = `https://www.google.com/maps/dir/?api=1&destination=${turfLat},${turfLng}`;

  // 1. Initialize MapLibre GL Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OPENFREEMAP_STYLE,
      center: [turfLng, turfLat],
      zoom: 13,
      attributionControl: false,
    });

    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }),
      "top-right"
    );

    map.addControl(
      new maplibregl.AttributionControl({
        compact: true,
        customAttribution:
          '© <a href="https://openfreemap.org" target="_blank" rel="noopener">OpenFreeMap</a> © <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a>',
      }),
      "bottom-right"
    );

    map.on("load", () => {
      setMapLoaded(true);
      map.resize();
    });

    map.on("error", (e) => {
      if (e?.error?.message?.includes("style")) {
        setMapError(true);
      }
    });

    const resizeObserver = new ResizeObserver(() => {
      if (mapRef.current) {
        mapRef.current.resize();
      }
    });
    if (mapContainerRef.current) {
      resizeObserver.observe(mapContainerRef.current);
    }

    mapRef.current = map;

    return () => {
      resizeObserver.disconnect();
      if (turfMarkerRef.current) {
        turfMarkerRef.current.remove();
        turfMarkerRef.current = null;
      }
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, [turfLat, turfLng]);

  // 2. Add Turf Marker
  useEffect(() => {
    if (!mapRef.current) return;

    if (turfMarkerRef.current) {
      turfMarkerRef.current.setLngLat([turfLng, turfLat]);
    } else {
      const isCricket = turf?.sportTypes?.includes("Cricket");
      const turfEl = document.createElement("div");
      turfEl.className = "custom-turf-marker";
      turfEl.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          background: #0f172a;
          color: white;
          padding: 6px 12px;
          border-radius: 9999px;
          border: 3px solid #10b981;
          box-shadow: 0 4px 18px rgba(16, 185, 129, 0.6);
          font-family: inherit;
          font-weight: 800;
          font-size: 12px;
        ">
          <span>${isCricket ? "🏏" : "⚽"}</span>
          <span>${turf?.name || "Turf Spot"}</span>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 25, closeButton: false }).setHTML(`
        <div style="padding: 6px 8px; font-family: sans-serif; font-size: 12px; color: #0f172a;">
          <div style="font-weight: bold; margin-bottom: 2px;">${turf?.name || "Turf Spot"}</div>
          <div style="font-size: 11px; color: #64748b;">${turf?.address || turf?.area || "Jaipur"}</div>
          <div style="margin-top: 4px; font-weight: 800; color: #059669;">₹${turf?.pricePerHour || 900}/hr</div>
        </div>
      `);

      const marker = new maplibregl.Marker({ element: turfEl })
        .setLngLat([turfLng, turfLat])
        .setPopup(popup)
        .addTo(mapRef.current);

      turfMarkerRef.current = marker;
    }
  }, [turfLat, turfLng, turf, mapLoaded]);

  // 3. Add User Marker and Fit Bounds if User Location exists
  useEffect(() => {
    if (!mapRef.current || !userLat || !userLng) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([userLng, userLat]);
    } else {
      const userEl = document.createElement("div");
      userEl.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(6, 182, 212, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 18px; height: 18px; border-radius: 50%; background: #06b6d4; border: 3px solid #ffffff; box-shadow: 0 0 16px rgba(6, 182, 212, 0.95); position: relative; z-index: 2;"></div>
        </div>
      `;

      const popup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
        <div style="padding: 4px 8px; font-family: sans-serif; font-size: 11px; font-weight: bold; color: #0891b2;">
          📍 You are here
        </div>
      `);

      const marker = new maplibregl.Marker({ element: userEl })
        .setLngLat([userLng, userLat])
        .setPopup(popup)
        .addTo(mapRef.current);

      userMarkerRef.current = marker;
    }

    // Fit bounds between User and Turf
    const bounds = new maplibregl.LngLatBounds();
    bounds.extend([turfLng, turfLat]);
    bounds.extend([userLng, userLat]);

    try {
      mapRef.current.fitBounds(bounds, {
        padding: 60,
        maxZoom: 15,
        duration: 900,
      });
    } catch (e) {}
  }, [userLat, userLng, turfLat, turfLng, mapLoaded]);

  // 4. Fetch Server-side Distance
  useEffect(() => {
    if (!userLat || !userLng || !turf?._id) return;

    const fetchStraightDistance = async () => {
      setDistLoading(true);
      try {
        const response = await axiosInstance.get(
          `/api/user/turf/${turf._id}/distance?lat=${userLat}&lng=${userLng}`
        );
        if (response.data && response.data.distanceKm !== undefined) {
          setStraightDistance(response.data.distanceKm);
        }
      } catch (err) {
        // Fallback to direct calculation if endpoint is busy
        try {
          const res2 = await axiosInstance.get(
            `/api/turfs/${turf._id}/distance?lat=${userLat}&lng=${userLng}`
          );
          if (res2.data && res2.data.distanceKm !== undefined) {
            setStraightDistance(res2.data.distanceKm);
          }
        } catch (e) {}
      } finally {
        setDistLoading(false);
      }
    };

    fetchStraightDistance();
  }, [userLat, userLng, turf?._id]);

  return (
    <div className="space-y-4">
      {/* Header with Distance Badge & Get Directions Link */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <Navigation className="w-5 h-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">Location & Directions</h2>
        </div>

        <div className="flex items-center gap-3">
          {/* Distance Badge */}
          {distLoading ? (
            <span className="px-3 py-1 rounded-full bg-white/10 text-xs font-semibold text-slate-300 animate-pulse">
              Calculating distance...
            </span>
          ) : straightDistance !== null ? (
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-xs font-extrabold text-emerald-300 shadow-lg">
              <Compass className="w-4 h-4 text-emerald-400" />
              <span>{straightDistance} km away</span>
            </div>
          ) : null}

          {/* Direct Navigation Button */}
          <a
            href={directionsUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white text-xs font-bold shadow-lg transition-all"
          >
            <span>Get Directions</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      </div>

      {/* MapLibre Container */}
      <div className="relative h-[360px] rounded-3xl overflow-hidden border border-white/10 shadow-2xl z-0">
        <div ref={mapContainerRef} className="w-full h-full" />
        {mapError && (
          <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md p-6 text-center">
            <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
            <h4 className="text-white font-bold text-sm">Interactive Map Unavailable</h4>
            <p className="text-slate-400 text-xs max-w-xs mt-1">
              Tile provider unreachable. Use the "Get Directions" button above to navigate to the venue.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default MapLibreTurfMap;
