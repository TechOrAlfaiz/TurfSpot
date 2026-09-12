import { useState, useEffect, useCallback } from "react";
import {
  JAIPUR_LOCALITY_COORDINATES,
  calculateClientHaversineDistance,
} from "../data/jaipurTurfs";

const LOCATION_STORAGE_KEY = "turfspot_user_location";
const RADIUS_STORAGE_KEY = "turfspot_user_radius";

// Global listeners registry for multi-component syncing without heavy providers
const listeners = new Set();
let globalLocationState = {
  lat: 26.8533, // Default center: Mansarovar, Jaipur
  lng: 75.7684,
  areaName: "Mansarovar",
  city: "Jaipur",
  address: "Mansarovar, Jaipur, Rajasthan",
  isGPS: false,
  loading: false,
  error: null,
};
let globalRadius = 10; // Default 10 km

// Initialize from sessionStorage if exists
try {
  const savedLoc = sessionStorage.getItem(LOCATION_STORAGE_KEY);
  if (savedLoc) {
    globalLocationState = { ...globalLocationState, ...JSON.parse(savedLoc) };
  }
  const savedRadius = sessionStorage.getItem(RADIUS_STORAGE_KEY);
  if (savedRadius) {
    globalRadius = parseFloat(savedRadius) || 10;
  }
} catch (e) {
  // Ignore sessionStorage errors
}

const notifyListeners = () => {
  listeners.forEach((listener) =>
    listener({ ...globalLocationState, radius: globalRadius })
  );
};

export const useUserLocation = () => {
  const [state, setState] = useState({
    ...globalLocationState,
    radius: globalRadius,
  });

  useEffect(() => {
    const handleUpdate = (updatedState) => setState(updatedState);
    listeners.add(handleUpdate);
    return () => listeners.delete(handleUpdate);
  }, []);

  // Find closest known Jaipur locality from lat/lng
  const findClosestJaipurLocality = useCallback((lat, lng) => {
    let closestArea = "Jaipur";
    let minDistance = Infinity;

    Object.entries(JAIPUR_LOCALITY_COORDINATES).forEach(([area, coords]) => {
      const [lon2, lat2] = coords;
      const d = calculateClientHaversineDistance(lat, lng, lat2, lon2);
      if (d !== null && d < minDistance) {
        minDistance = d;
        closestArea = area;
      }
    });

    return { closestArea, minDistance };
  }, []);

  // Request GPS Location from Browser Geolocation API
  const requestCurrentLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      const updated = {
        ...globalLocationState,
        loading: false,
        error: "Geolocation is not supported by your browser.",
      };
      globalLocationState = updated;
      notifyListeners();
      return { success: false, error: updated.error };
    }

    globalLocationState = { ...globalLocationState, loading: true, error: null };
    notifyListeners();

    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;

          const { closestArea } = findClosestJaipurLocality(lat, lng);
          let resolvedArea = closestArea;
          let address = `${closestArea}, Jaipur`;

          // Reverse Geocoding via Nominatim API (with timeout & safe fallback)
          try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);

            const res = await fetch(
              `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`,
              {
                signal: controller.signal,
                headers: { "Accept-Language": "en" },
              }
            );
            clearTimeout(timeoutId);

            if (res.ok) {
              const data = await res.json();
              const suburb =
                data.address?.suburb ||
                data.address?.neighbourhood ||
                data.address?.residential ||
                data.address?.city_district;
              if (suburb) {
                resolvedArea = suburb;
                address = data.display_name?.split(",")?.slice(0, 3)?.join(",") || `${suburb}, Jaipur`;
              }
            }
          } catch (geoErr) {
            // Silently use closest Jaipur locality on network/CORS error
          }

          const newState = {
            lat,
            lng,
            areaName: resolvedArea,
            city: "Jaipur",
            address,
            isGPS: true,
            loading: false,
            error: null,
          };

          globalLocationState = newState;
          try {
            sessionStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newState));
          } catch (e) {}

          notifyListeners();
          resolve({ success: true, location: newState });
        },
        (err) => {
          let errorMessage = "Unable to retrieve your location.";
          if (err.code === 1) {
            errorMessage = "Location access denied. Please search your area manually.";
          } else if (err.code === 2) {
            errorMessage = "Location unavailable. Please select your Jaipur area manually.";
          } else if (err.code === 3) {
            errorMessage = "Location request timed out. Please try again.";
          }

          const updated = {
            ...globalLocationState,
            loading: false,
            error: errorMessage,
          };
          globalLocationState = updated;
          notifyListeners();
          resolve({ success: false, error: errorMessage });
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 30000 }
      );
    });
  }, [findClosestJaipurLocality]);

  // Set Manual Locality in Jaipur
  const setManualLocation = useCallback((areaName) => {
    let coords = JAIPUR_LOCALITY_COORDINATES[areaName] || JAIPUR_LOCALITY_COORDINATES["Mansarovar"];
    const [lng, lat] = coords;

    const newState = {
      lat,
      lng,
      areaName,
      city: "Jaipur",
      address: `${areaName}, Jaipur, Rajasthan`,
      isGPS: false,
      loading: false,
      error: null,
    };

    globalLocationState = newState;
    try {
      sessionStorage.setItem(LOCATION_STORAGE_KEY, JSON.stringify(newState));
    } catch (e) {}

    notifyListeners();
    return newState;
  }, []);

  // Update Search Radius (in km)
  const setRadius = useCallback((newRadius) => {
    const val = parseFloat(newRadius) || 10;
    globalRadius = val;
    try {
      sessionStorage.setItem(RADIUS_STORAGE_KEY, val.toString());
    } catch (e) {}
    notifyListeners();
  }, []);

  return {
    ...state,
    requestCurrentLocation,
    setManualLocation,
    setRadius,
  };
};

export default useUserLocation;
