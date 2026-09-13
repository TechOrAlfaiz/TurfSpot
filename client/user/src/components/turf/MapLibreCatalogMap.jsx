import React, { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import maplibreglWorkerUrl from "maplibre-gl/dist/maplibre-gl-worker.mjs?url";
import "maplibre-gl/dist/maplibre-gl.css";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import {
  MapPin,
  Navigation,
  Star,
  ArrowRight,
  Compass,
  LocateFixed,
  Layers,
  AlertCircle,
  ExternalLink,
  Globe,
} from "lucide-react";
import useUserLocation from "../../hooks/useUserLocation";
import axiosInstance from "../../hooks/useAxiosInstance";
import { calculateClientHaversineDistance } from "../../data/jaipurTurfs";

// Ensure MapLibre Web Worker is resolved correctly in Vite
if (typeof maplibregl.setWorkerUrl === "function") {
  maplibregl.setWorkerUrl(maplibreglWorkerUrl);
}

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
  const discoveryMarkersRef = useRef([]);
  const userMarkerRef = useRef(null);
  const lastDiscoveryCoordsRef = useRef(null);

  const isLoggedIn = useSelector((state) => state.auth.isLoggedIn);
  const { lat, lng, areaName, isGPS, requestCurrentLocation } = useUserLocation();
  const [mapLoaded, setMapLoaded] = useState(false);
  const [mapError, setMapError] = useState(false);

  // Discovery-only venues state
  const [discoveryVenues, setDiscoveryVenues] = useState([]);
  const [showDiscovery, setShowDiscovery] = useState(true);
  const [discoveryLoading, setDiscoveryLoading] = useState(false);

  // Default center: Mansarovar / Jaipur
  const defaultCenter = lat && lng ? [lng, lat] : [75.7684, 26.8533];

  // 1. Fetch nearby discovery-only sports grounds (debounced & cached)
  const fetchDiscoveryVenues = useCallback(
    async (centerLat, centerLng) => {
      if (!centerLat || !centerLng) return;

      // Throttle: don't re-fetch if moved less than 2.5 km from last queried center
      if (lastDiscoveryCoordsRef.current) {
        const distKm = calculateClientHaversineDistance(
          lastDiscoveryCoordsRef.current.lat,
          lastDiscoveryCoordsRef.current.lng,
          centerLat,
          centerLng
        );
        if (distKm !== null && distKm < 2.5 && discoveryVenues.length > 0) {
          return;
        }
      }

      lastDiscoveryCoordsRef.current = { lat: centerLat, lng: centerLng };
      setDiscoveryLoading(true);

      try {
        const response = await axiosInstance.get(
          `/api/user/discovery/nearby?lat=${centerLat}&lng=${centerLng}&radiusMeters=8000`
        );
        if (response.data?.success && Array.isArray(response.data.venues)) {
          setDiscoveryVenues(response.data.venues);
        }
      } catch (err) {
        console.warn("Discovery venues lookup failed gracefully:", err.message);
      } finally {
        setDiscoveryLoading(false);
      }
    },
    [discoveryVenues.length]
  );

  // 2. Initialize MapLibre Map instance
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
      markersRef.current.forEach((m) => m.remove());
      markersRef.current = [];
      discoveryMarkersRef.current.forEach((m) => m.remove());
      discoveryMarkersRef.current = [];
      if (userMarkerRef.current) {
        userMarkerRef.current.remove();
        userMarkerRef.current = null;
      }
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // 3. Initial discovery fetch on map load
  useEffect(() => {
    if (!mapLoaded) return;
    const cLat = lat || defaultCenter[1];
    const cLng = lng || defaultCenter[0];
    fetchDiscoveryVenues(cLat, cLng);
  }, [mapLoaded, lat, lng, fetchDiscoveryVenues]);

  // 4. Map moveend listener: throttled refresh of discovery pins on substantial pan
  useEffect(() => {
    if (!mapRef.current || !mapLoaded) return;
    const map = mapRef.current;

    let debounceTimer = null;
    const handleMoveEnd = () => {
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        const center = map.getCenter();
        fetchDiscoveryVenues(center.lat, center.lng);
      }, 700);
    };

    map.on("moveend", handleMoveEnd);
    return () => {
      clearTimeout(debounceTimer);
      map.off("moveend", handleMoveEnd);
    };
  }, [mapLoaded, fetchDiscoveryVenues]);

  // 5. Handle User GPS Location Marker
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

  // 6. Render Real TurfSpot Turf Markers (Green / Amber Branded Pills)
  useEffect(() => {
    if (!mapRef.current) return;

    // Remove existing real turf markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    const bounds = new maplibregl.LngLatBounds();
    let hasCoords = false;

    turfs.forEach((turf) => {
      const rawCoords = turf.location?.coordinates || turf.coordinates;
      if (!Array.isArray(rawCoords) || rawCoords.length < 2) return;
      let tLng = parseFloat(rawCoords[0]);
      let tLat = parseFloat(rawCoords[1]);

      if (isNaN(tLng) || isNaN(tLat)) return;

      // Auto-correct if coordinates were stored as [lat, lng] instead of GeoJSON standard [lng, lat]
      if (tLng < 45 && tLat > 60) {
        const temp = tLng;
        tLng = tLat;
        tLat = temp;
      }

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

      // Create interactive popup for bookable TurfSpot turf
      const popupHtml = `
        <div style="min-width: 220px; max-width: 260px; font-family: inherit; color: #0f172a; padding: 4px;">
          <div style="position: relative; height: 100px; border-radius: 12px; overflow: hidden; margin-bottom: 8px; background: #1e293b;">
            <img src="${turf.image || "/banner-1.png"}" alt="${turf.name}" onerror="this.onerror=null;this.src='/banner-1.png';" style="width: 100%; height: 100%; object-fit: cover;" />
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
            📍 ${turf.address || turf.area || "Jaipur"}
          </div>
          <div style="display: flex; align-items: center; justify-content: space-between; border-top: 1px solid #e2e8f0; padding-top: 6px; margin-bottom: 8px;">
            <span style="font-size: 13px; font-weight: 900; color: #059669;">₹${turf.pricePerHour || 900}<span style="font-size: 10px; font-weight: normal; color: #64748b;">/hr</span></span>
            <span style="font-size: 11px; font-weight: bold; color: #f59e0b;">★ ${turf.rating || 4.8}</span>
          </div>
          <a
            href="${bookingUrl}"
            style="display: block; width: 100%; padding: 7px 0; border-radius: 8px; background: #059669; color: white; font-size: 11px; font-weight: 800; text-align: center; text-decoration: none; box-shadow: 0 2px 6px rgba(5,150,105,0.3);"
          >
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
      } catch (e) {}
    }
  }, [turfs, mapLoaded, selectedTurfId, isLoggedIn, lat, lng, onTurfSelect]);

  // 7. Render Discovery-Only Markers (Distinct Grey Outline Badges)
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear previous discovery markers
    discoveryMarkersRef.current.forEach((m) => m.remove());
    discoveryMarkersRef.current = [];

    if (!showDiscovery || !Array.isArray(discoveryVenues)) return;

    discoveryVenues.forEach((venue) => {
      const coords = venue.location?.coordinates;
      if (!Array.isArray(coords) || coords.length < 2) return;
      const vLng = parseFloat(coords[0]);
      const vLat = parseFloat(coords[1]);
      if (isNaN(vLng) || isNaN(vLat)) return;

      const el = document.createElement("div");
      el.className = "discovery-map-marker";
      el.style.cursor = "pointer";
      el.innerHTML = `
        <div style="
          display: flex;
          align-items: center;
          gap: 5px;
          background: #1e293b;
          color: #cbd5e1;
          padding: 4px 8px;
          border-radius: 9999px;
          border: 1.5px dashed #64748b;
          box-shadow: 0 4px 12px rgba(0,0,0,0.45);
          font-family: inherit;
          transition: all 0.2s ease-in-out;
        ">
          <span style="font-size: 11px;">📍</span>
          <span style="font-size: 11px; font-weight: 700; white-space: nowrap; max-width: 130px; overflow: hidden; text-overflow: ellipsis;">
            ${venue.name}
          </span>
          <span style="font-size: 9px; font-weight: 700; padding: 1px 4px; border-radius: 4px; background: rgba(255,255,255,0.1); color: #94a3b8;">
            Public
          </span>
        </div>
      `;

      el.addEventListener("mouseenter", () => {
        if (el.firstElementChild) {
          el.firstElementChild.style.transform = "scale(1.08)";
          el.firstElementChild.style.borderColor = "#94a3b8";
        }
      });
      el.addEventListener("mouseleave", () => {
        if (el.firstElementChild) {
          el.firstElementChild.style.transform = "scale(1)";
          el.firstElementChild.style.borderColor = "#64748b";
        }
      });

      // Discovery Popup: Directions only, NO booking CTA
      const popupHtml = `
        <div style="min-width: 230px; max-width: 270px; font-family: inherit; color: #0f172a; padding: 6px;">
          <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 6px;">
            <span style="display: inline-flex; align-items: center; gap: 4px; padding: 2px 7px; border-radius: 9999px; background: #f1f5f9; color: #475569; font-size: 10px; font-weight: 800; border: 1px solid #cbd5e1;">
              🌐 Not yet on TurfSpot
            </span>
            <span style="font-size: 11px; font-weight: 800; color: #059669;">
              ${venue.distanceKm !== undefined ? venue.distanceKm + " km away" : ""}
            </span>
          </div>
          <div style="font-weight: 800; font-size: 13px; color: #0f172a; line-height: 1.25; margin-bottom: 3px;">
            ${venue.name}
          </div>
          <div style="font-size: 11px; color: #64748b; margin-bottom: 8px;">
            📍 ${venue.address || "Jaipur, Rajasthan"}
          </div>
          <div style="padding: 6px 8px; border-radius: 8px; background: #f8fafc; border: 1px dashed #cbd5e1; font-size: 10px; color: #64748b; margin-bottom: 8px; line-height: 1.3;">
            Public sports ground sourced from ${venue.source || "OpenStreetMap"}. Not available for instant TurfSpot reservations.
          </div>
          <a
            href="${venue.googleMapsUrl}"
            target="_blank"
            rel="noopener noreferrer"
            style="display: flex; align-items: center; justify-content: center; gap: 6px; width: 100%; padding: 7px 10px; border-radius: 8px; background: #0f172a; color: white; font-size: 11px; font-weight: 700; text-decoration: none; text-align: center; box-shadow: 0 2px 6px rgba(15,23,42,0.25);"
          >
            <span>Get Directions</span>
            <span>↗</span>
          </a>
        </div>
      `;

      const popup = new maplibregl.Popup({
        offset: 18,
        closeButton: true,
        maxWidth: "290px",
      }).setHTML(popupHtml);

      const marker = new maplibregl.Marker({ element: el })
        .setLngLat([vLng, vLat])
        .setPopup(popup)
        .addTo(mapRef.current);

      discoveryMarkersRef.current.push(marker);
    });
  }, [discoveryVenues, showDiscovery]);

  // 8. Handle Selected Turf Center
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
        <div className="pointer-events-auto px-4 py-2 rounded-2xl bg-slate-950/90 backdrop-blur-xl border border-white/15 shadow-xl flex flex-wrap items-center gap-3 text-xs">
          {/* TurfSpot Bookable Arenas */}
          <div className="flex items-center gap-1.5 font-bold text-white">
            <MapPin className="w-4 h-4 text-emerald-400" />
            <span>{turfs.length} TurfSpot Turfs</span>
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
          <span className="text-slate-500">|</span>
          {/* Discovery Venues Toggle Button */}
          <button
            type="button"
            onClick={() => setShowDiscovery((prev) => !prev)}
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
              showDiscovery
                ? "bg-slate-800 text-slate-200 border border-slate-600 shadow-sm"
                : "bg-white/5 text-slate-400 border border-transparent hover:text-white"
            }`}
            title="Toggle nearby public discovery sports venues"
          >
            <span className="w-2 h-2 rounded-full bg-slate-400 border border-dashed border-white"></span>
            <span>
              {discoveryLoading
                ? "Searching Grounds..."
                : `${discoveryVenues.length} Discovery Grounds`}
            </span>
          </button>
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

      {/* Fallback Overlay if Map Tiles Fail to Load */}
      {mapError && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-slate-950/85 backdrop-blur-md p-6 text-center">
          <AlertCircle className="w-10 h-10 text-amber-400 mb-2" />
          <h4 className="text-white font-bold text-sm">Interactive Map Offline</h4>
          <p className="text-slate-400 text-xs max-w-xs mt-1">
            Map tiles are temporarily unreachable. You can continue browsing and booking turfs directly using the list.
          </p>
        </div>
      )}
    </div>
  );
};

export default MapLibreCatalogMap;
