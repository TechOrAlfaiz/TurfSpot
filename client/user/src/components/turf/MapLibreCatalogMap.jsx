import React, { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import { MapPin, Navigation, Star, ArrowRight, Compass, LocateFixed, Layers } from "lucide-react";
import useUserLocation from "../../hooks/useUserLocation";

const OPENFREEMAP_STYLE =
  import.meta.env.VITE_OPENFREEMAP_STYLE_URL ||
  "https://tiles.openfreemap.org/styles/liberty";

const MapLibreCatalogMap = ({
  turfs = [],
  selectedTurfId = null,
  onTurfSelect = null,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markersRef = useRef([]);
  const userMarkerRef = useRef(null);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { lat, lng, areaName, isGPS, requestCurrentLocation } = useUserLocation();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [activePopupTurf, setActivePopupTurf] = useState(null);

  // Default center: Mansarovar / Jaipur
  const defaultCenter = lat && lng ? [lng, lat] : [75.7684, 26.8533];

  // 1. Initialize MapLibre Map instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return; // Prevent duplicate instantiation

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OPENFREEMAP_STYLE,
      center: defaultCenter,
      zoom: 12,
      attributionControl: false,
    });

    // Add navigation controls (zoom, pitch, rotate)
    map.addControl(
      new maplibregl.NavigationControl({ showCompass: true, visualizePitch: true }),
      "top-right"
    );

    // Add custom attribution in bottom-right
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

    mapRef.current = map;

    return () => {
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 2. Handle User GPS Location Marker
  useEffect(() => {
    if (!mapRef.current || !lat || !lng) return;

    if (userMarkerRef.current) {
      userMarkerRef.current.setLngLat([lng, lat]);
    } else {
      const userEl = document.createElement("div");
      userEl.className = "custom-user-marker";
      userEl.innerHTML = `
        <div style="position: relative; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; width: 34px; height: 34px; border-radius: 50%; background: rgba(6, 182, 212, 0.35); animation: ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <div style="width: 18px; height: 18px; border-radius: 50%; background: #06b6d4; border: 3px solid #ffffff; box-shadow: 0 0 16px rgba(6, 182, 212, 0.95); position: relative; z-index: 2;"></div>
        </div>
      `;

      const userPopup = new maplibregl.Popup({ offset: 15, closeButton: false }).setHTML(`
        <div style="padding: 4px 8px; font-family: sans-serif; font-size: 11px; font-weight: bold; color: #0891b2; text-align: center;">
          📍 Your Location (${areaName || "Jaipur"})
        </div>
      `);

      const marker = new maplibregl.Marker({ element: userEl })
        .setLngLat([lng, lat])
        .setPopup(userPopup)
        .addTo(mapRef.current);

      userMarkerRef.current = marker;
    }
  }, [lat, lng, areaName, mapLoaded]);

  // 3. Render Turf Markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();
    let hasCoords = false;

    turfs.forEach((turf) => {
      const coords = turf.location?.coordinates || turf.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return;
      const [tLng, tLat] = coords;

      if (isNaN(tLng) || isNaN(tLat)) return;

      bounds.extend([tLng, tLat]);
      hasCoords = true;

      const isCricket = turf.sportTypes?.includes("Cricket");
      const isSelected = selectedTurfId === turf._id;
      const bookingUrl = isLoggedIn ? `/auth/turf/${turf._id}` : `/turf/${turf._id}`;

      // Create Custom Marker DOM Element
      const el = document.createElement("div");
      el.className = `turf-maplibre-marker ${isSelected ? "is-selected" : ""}`;
      el.style.cursor = "pointer";
      el.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 6px;
          background: ${isSelected ? "#059669" : "#0f172a"};
          color: white;
          padding: 5px 9px;
          border-radius: 9999px;
          border: 2px solid ${isSelected ? "#34d399" : isCricket ? "#f59e0b" : "#10b981"};
          box-shadow: 0 4px 14px rgba(0,0,0,0.5), 0 0 ${isSelected ? "20px #10b981" : "0px transparent"};
          transform: ${isSelected ? "scale(1.15)" : "scale(1)"};
          transition: all 0.2s ease-in-out;
          font-family: inherit;
        ">
          <span style="font-size: 13px;">${isCricket ? "🏏" : "⚽"}</span>
          <span style="font-size: 11px; font-weight: 800; white-space: nowrap;">₹${turf.pricePerHour || 900}</span>
        </div>
      `;

      // Create interactive popup
      const popupHtml = `
        <div style="min-width: 220px; max-width: 260px; font-family: inherit; color: #0f172a; padding: 4px;">
          <div style="position: relative; height: 100px; border-radius: 12px; overflow: hidden; margin-bottom: 8px; background: #1e293b;">
            <img src="${turf.image || "/banner-1.png"}" alt="${turf.name}" style="width: 100%; height: 100%; object-fit: cover;" />
            <div style="position: absolute; top: 6px; left: 6px; padding: 2px 6px; border-radius: 9999px; background: rgba(15,23,42,0.85); color: white; font-size: 10px; font-weight: bold;">
              ${isCricket ? "🏏 Cricket" : "⚽ Football"}
            </div>
            ${
              turf.distanceString
                ? `<div style="position: absolute; bottom: 6px; right: 6px; padding: 2px 6px; border-radius: 9999px; background: #059669; color: white; font-size: 10px; font-weight: 800;">
                    ${turf.distanceString}
                   </div>`
                : ""
            }
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; line-height: 1.2; margin-bottom: 2px;">
            ${turf.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            📍 ${turf.area || "Jaipur"}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-bottom: 8px;">
            <div>
              <span style="font-size: 14px; font-weight: 900; color: #059669;">₹${turf.pricePerHour || 900}</span>
              <span style="font-size: 10px; color: #64748b;">/hr</span>
            </div>
            <div style="font-size: 11px; font-weight: bold; color: #d97706; display: flex; align-items: center; gap: 3px;">
              ★ ${turf.rating || 4.8}
            </div>
          </div>
          <a href="${bookingUrl}" style="
            display: block;
            width: 100%;
            padding: 7px 0;
            border-radius: 10px;
            background: #059669;
            color: white;
            text-align: center;
            font-size: 11px;
            font-weight: bold;
            text-decoration: none;
            transition: background 0.15s;
          ">
            View & Book Slot →
          </a>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 20,
        closeButton: true,
        closeOnClick: false,
        className: "glass-maplibre-popup",
      }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([tLng, tLat])
        .setPopup(popup)
        .addTo(mapRef.current);

      el.addEventListener("click", () => {
        if (onTurfSelect) onTurfSelect(turf);
      });

      markersRef.current.push(marker);
    });

    // Auto-fit bounds if turfs exist
    if (hasCoords && !selectedTurfId) {
      if (lat && lng) bounds.extend([lng, lat]);
      try {
        mapRef.current.fitBounds(bounds, {
          padding: 60,
          maxZoom: 14,
          duration: 800,
        });
      } catch (e) {
        // Safe catch if container bounds are 0
      }
    }
  }, [turfs, mapLoaded, selectedTurfId, isLoggedIn, lat, lng, onTurfSelect]);

  // 4. Handle Selected Turf Center
  useEffect(() => {
    if (!mapRef.current || !selectedTurfId) return;

    const targetTurf = turfs.find((t) => t._id === selectedTurfId);
    if (!targetTurf) return;

    const coords = targetTurf.location?.coordinates || targetTurf.coordinates;
    if (Array.isArray(coords) && coords.length >= 2) {
      mapRef.current.flyTo({
        center: [coords[0], coords[1]],
        zoom: 14,
        essential: true,
        duration: 1200,
      });
    }
  }, [selectedTurfId, turfs]);

  // Center on User GPS
  const handleCenterOnUser = useCallback(async () => {
    if (lat && lng && mapRef.current) {
      mapRef.current.flyTo({
        center: [lng, lat],
        zoom: 14,
        essential: true,
        duration: 1000,
      });
    } else {
      const res = await requestCurrentLocation();
      if (res.success && res.location && mapRef.current) {
        mapRef.current.flyTo({
          center: [res.location.lng, res.location.lat],
          zoom: 14,
          essential: true,
          duration: 1000,
        });
      }
    }
  }, [lat, lng, requestCurrentLocation]);

  return (
    <div className="relative w-full h-[580px] rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-2xl z-0">
      {/* Top Floating Map Legend Bar */}
      <div className="absolute top-4 left-4 right-4 z-10 pointer-events-none flex flex-wrap items-center justify-between gap-2">
        <div className="pointer-events-auto px-4 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-white/15 shadow-xl flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5 font-bold text-white">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{turfs.length} Turfs in Jaipur</span>
          </div>
          <span className="text-slate-500">|</span>
          <div className="flex items-center gap-2 text-slate-300">
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-amber-400"></span> Cricket
            </span>
            <span className="flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-400"></span> Football
            </span>
            {isGPS && (
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-cyan-400"></span> Your GPS
              </span>
            )}
          </div>
        </div>

        {/* Quick GPS Re-center Action */}
        <button
          type="button"
          onClick={handleCenterOnUser}
          className="pointer-events-auto px-3.5 py-2 rounded-2xl bg-slate-950/90 hover:bg-slate-900 active:scale-95 backdrop-blur-xl border border-white/15 text-white hover:text-cyan-400 shadow-xl flex items-center gap-2 text-xs font-semibold transition-all"
          title="Center on my location"
        >
          <LocateFixed className="w-4 h-4 text-cyan-400" />
          <span className="hidden sm:inline">My Location</span>
        </button>
      </div>

      {/* MapLibre WebGL Canvas Container */}
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
};

export default MapLibreCatalogMap;
