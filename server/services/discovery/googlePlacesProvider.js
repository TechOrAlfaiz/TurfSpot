/**
 * Google Places API Provider for Sports Venues
 * Used when GOOGLE_PLACES_API_KEY is configured in server environment.
 */

export async function fetchFromGooglePlaces(lat, lng, radiusMeters = 8000, apiKey) {
  if (!apiKey) {
    throw new Error("GOOGLE_PLACES_API_KEY is not configured");
  }

  const keywords = ["box cricket turf", "cricket ground", "football turf", "sports complex"];
  const seenPlaceIds = new Set();
  const venues = [];

  for (const keyword of keywords) {
    const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radiusMeters}&keyword=${encodeURIComponent(
      keyword
    )}&key=${apiKey}`;

    try {
      const response = await fetch(url);
      if (!response.ok) continue;

      const data = await response.json();
      if (data.status !== "OK" || !Array.isArray(data.results)) continue;

      for (const place of data.results) {
        if (seenPlaceIds.has(place.place_id)) continue;
        seenPlaceIds.add(place.place_id);

        const plat = place.geometry?.location?.lat;
        const plng = place.geometry?.location?.lng;
        if (!plat || !plng) continue;

        let sport = "Multi-Sport";
        const lowerName = (place.name || "").toLowerCase();
        if (lowerName.includes("cricket")) sport = "Cricket";
        else if (lowerName.includes("football") || lowerName.includes("futsal") || lowerName.includes("soccer")) sport = "Football";

        venues.push({
          id: `google_${place.place_id}`,
          name: place.name || "Sports Venue",
          sport,
          address: place.vicinity || "Jaipur, Rajasthan",
          rating: place.rating || null,
          userRatingsTotal: place.user_ratings_total || null,
          location: {
            type: "Point",
            coordinates: [plng, plat],
          },
          isExternal: true,
          source: "Google Places",
          googleMapsUrl: `https://www.google.com/maps/place/?q=place_id:${place.place_id}`,
        });
      }
    } catch (err) {
      console.warn("Google Places fetch error for keyword:", keyword, err.message);
    }
  }

  return venues;
}
