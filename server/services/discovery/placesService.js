import placesCache from "./placesCache.js";
import { fetchFromOsmOverpass } from "./osmOverpassProvider.js";
import { fetchFromGooglePlaces } from "./googlePlacesProvider.js";
import Turf from "../../models/turf.model.js";

// Haversine distance in meters
function getDistanceMeters(lat1, lon1, lat2, lon2) {
  const R = 6371000;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function normalizeName(name = "") {
  return name.toLowerCase().replace(/[^a-z0-9]/g, "");
}

/**
 * Deduplicates external discovery venues against real platform turfs
 * Suppresses discovery pins if within 150m or sharing very similar names
 */
function deduplicateAgainstRealTurfs(discoveryVenues, realTurfs) {
  return discoveryVenues.filter((disc) => {
    const discCoords = disc.location?.coordinates; // [lng, lat]
    if (!discCoords || discCoords.length < 2) return false;

    const discLng = discCoords[0];
    const discLat = discCoords[1];
    const normDiscName = normalizeName(disc.name);

    for (const real of realTurfs) {
      const realCoords = real.location?.coordinates;
      if (!realCoords || realCoords.length < 2) continue;

      const realLng = realCoords[0];
      const realLat = realCoords[1];
      const dist = getDistanceMeters(discLat, discLng, realLat, realLng);

      // If within 150m, consider it the same physical venue
      if (dist <= 150) {
        return false;
      }

      // If within 500m and names are virtually identical
      const normRealName = normalizeName(real.name);
      if (dist <= 500 && normRealName && normDiscName) {
        if (normRealName.includes(normDiscName) || normDiscName.includes(normRealName)) {
          return false;
        }
      }
    }

    return true;
  });
}

/**
 * Main Discovery Service: Swappable Provider + 24-Hour Cache + Real-Turf Deduplication
 */
export async function getNearbyDiscoveryVenues(lat, lng, radiusMeters = 8000) {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const hasGoogleKey =
    Boolean(apiKey) &&
    !apiKey.includes("your_google") &&
    !apiKey.startsWith("AIzaSy...your");

  const providerName = hasGoogleKey ? "google" : "osm";
  const cacheKey = placesCache.generateKey(lat, lng, radiusMeters);

  // Fetch or retrieve from 24h cache with in-flight deduplication
  const { data: rawVenues, fromCache } = await placesCache.executeWithDeduplication(
    cacheKey,
    async () => {
      try {
        if (hasGoogleKey) {
          return await fetchFromGooglePlaces(lat, lng, radiusMeters, apiKey);
        } else {
          return await fetchFromOsmOverpass(lat, lng, radiusMeters);
        }
      } catch (err) {
        console.warn(`Discovery fetch failed for provider [${providerName}]:`, err.message);
        // If primary provider failed, try fallback
        if (hasGoogleKey) {
          try {
            return await fetchFromOsmOverpass(lat, lng, radiusMeters);
          } catch (e2) {
            return [];
          }
        }
        return [];
      }
    }
  );

  // Fetch real turfs from database to deduplicate
  let realTurfs = [];
  try {
    realTurfs = await Turf.find({ isActive: true }).select("name location").lean();
  } catch (err) {
    console.warn("Could not load real turfs for deduplication:", err.message);
  }

  // Deduplicate against platform turfs
  const cleanVenues = deduplicateAgainstRealTurfs(rawVenues, realTurfs);

  // Attach calculated distance in km
  const venuesWithDistance = cleanVenues.map((v) => {
    const coords = v.location.coordinates;
    const distM = getDistanceMeters(lat, lng, coords[1], coords[0]);
    return {
      ...v,
      distanceKm: parseFloat((distM / 1000).toFixed(1)),
    };
  });

  // Sort by distance
  venuesWithDistance.sort((a, b) => a.distanceKm - b.distanceKm);

  return {
    provider: hasGoogleKey ? "Google Places" : "OpenStreetMap (Overpass)",
    fromCache,
    total: venuesWithDistance.length,
    venues: venuesWithDistance,
  };
}
