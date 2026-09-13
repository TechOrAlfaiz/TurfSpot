import React, { useEffect, useRef, useState, useCallback } from "react";
import * as maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { MapPin, LocateFixed, Compass } from "lucide-react";

const OPENFREEMAP_STYLE =
  import.meta.env.VITE_OPENFREEMAP_STYLE_URL ||
  "https://tiles.openfreemap.org/styles/liberty";

const LocationPickerMap = ({
  location = { lat: 26.8533, lng: 75.7684 },
  onChange,
}) => {
  const mapContainerRef = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const [gpsLoading, setGpsLoading] = useState(false);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapRef.current) return;

    const initialLng = location?.lng || 75.7684;
    const initialLat = location?.lat || 26.8533;

    const map = new maplibregl.Map({
      container: mapContainerRef.current,
      style: OPENFREEMAP_STYLE,
      center: [initialLng, initialLat],
      zoom: 13,
      attributionControl: false,
    });

    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), "top-right");

    // Custom Draggable Marker
    const markerEl = document.createElement("div");
    markerEl.className = "cursor-grab active:cursor-grabbing";
    markerEl.innerHTML = `
      <div style="display: flex; flex-direction: column; align-items: center;">
        <div style="background: #10b981; color: white; padding: 4px 8px; border-radius: 9999px; font-size: 11px; font-weight: 800; border: 2px solid white; box-shadow: 0 4px 12px rgba(0,0,0,0.4); display: flex; align-items: center; gap: 4px; white-space: nowrap;">
          <span>📍 Turf Location</span>
        </div>
        <div style="width: 0; height: 0; border-left: 6px solid transparent; border-right: 6px solid transparent; border-top: 8px solid #10b981; margin-top: -1px;"></div>
      </div>
    `;

    const marker = new maplibregl.Marker({ element: markerEl, draggable: true })
      .setLngLat([initialLng, initialLat])
      .addTo(map);

    marker.on("dragend", () => {
      const lngLat = marker.getLngLat();
      if (onChange) {
        onChange({ lat: Number(lngLat.lat.toFixed(6)), lng: Number(lngLat.lng.toFixed(6)) });
      }
    });

    // Map click drops or moves the pin
    map.on("click", (e) => {
      marker.setLngLat(e.lngLat);
      if (onChange) {
        onChange({ lat: Number(e.lngLat.lat.toFixed(6)), lng: Number(e.lngLat.lng.toFixed(6)) });
      }
    });

    markerRef.current = marker;
    mapRef.current = map;

    return () => {
      marker.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Update marker position if location prop changes externally
  useEffect(() => {
    if (!markerRef.current || !location) return;
    const current = markerRef.current.getLngLat();
    if (
      Math.abs(current.lat - location.lat) > 0.0001 ||
      Math.abs(current.lng - location.lng) > 0.0001
    ) {
      markerRef.current.setLngLat([location.lng, location.lat]);
      mapRef.current?.flyTo({ center: [location.lng, location.lat], zoom: 14 });
    }
  }, [location?.lat, location?.lng]);

  const handleUseCurrentLocation = useCallback(() => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setGpsLoading(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setGpsLoading(false);
        const lat = Number(position.coords.latitude.toFixed(6));
        const lng = Number(position.coords.longitude.toFixed(6));

        if (markerRef.current && mapRef.current) {
          markerRef.current.setLngLat([lng, lat]);
          mapRef.current.flyTo({ center: [lng, lat], zoom: 15 });
        }

        if (onChange) {
          onChange({ lat, lng });
        }
      },
      (err) => {
        setGpsLoading(false);
        console.warn("Geolocation error:", err.message);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  }, [onChange]);

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between text-xs">
        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
          <MapPin size={14} className="text-emerald-400" />
          <span>Pin Turf Location on Map (Drag to adjust)</span>
        </span>

        <button
          type="button"
          onClick={handleUseCurrentLocation}
          disabled={gpsLoading}
          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-semibold transition-colors disabled:opacity-50"
        >
          <LocateFixed size={12} className={gpsLoading ? "animate-spin" : ""} />
          <span>{gpsLoading ? "Locating..." : "Use Current GPS"}</span>
        </button>
      </div>

      <div className="relative rounded-xl overflow-hidden border border-white/10 shadow-inner bg-slate-900 h-60">
        <div ref={mapContainerRef} className="w-full h-full" />
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 px-1">
        <span>Click anywhere on the map or drag the pin to set venue coordinates.</span>
        <span className="font-mono text-emerald-400 font-bold">
          {location?.lat?.toFixed(4)}° N, {location?.lng?.toFixed(4)}° E
        </span>
      </div>
    </div>
  );
};

export default LocationPickerMap;
