/**
 * OpenStreetMap Overpass API Provider for Sports Venues & Pitches
 * Free, public, keyless fallback provider.
 */

const OVERPASS_MIRRORS = [
  "https://overpass-api.de/api/interpreter",
  "https://overpass.kumi.systems/api/interpreter",
  "https://overpass.private.coffee/api/interpreter",
];

export async function fetchFromOsmOverpass(lat, lng, radiusMeters = 8000) {
  // Query pitches, cricket grounds, football grounds, and sports centres
  const query = `[out:json][timeout:15];
(
  node["leisure"~"pitch|sports_centre"](around:${radiusMeters},${lat},${lng});
  way["leisure"~"pitch|sports_centre"](around:${radiusMeters},${lat},${lng});
);
out center 40;`;

  let lastError = null;

  for (const mirror of OVERPASS_MIRRORS) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const response = await fetch(mirror, {
        method: "POST",
        body: "data=" + encodeURIComponent(query),
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "User-Agent": "TurfSpot-Discovery/1.0 (Sports Discovery Engine; info@turfspot.in)",
        },
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        continue;
      }

      const text = await response.text();
      if (!text.startsWith("{")) continue;

      const data = JSON.parse(text);
      const elements = data.elements || [];

      return elements.map((el) => {
        const elat = el.lat || el.center?.lat;
        const elon = el.lon || el.center?.lon;
        const tags = el.tags || {};

        // Format sport
        let sport = tags.sport || tags.leisure || "Multi-Sport";
        sport = sport.replace(/_/g, " ");
        sport = sport.charAt(0).toUpperCase() + sport.slice(1);

        // Format venue name
        let name = tags.name || tags["name:en"];
        if (!name) {
          name = sport === "Multi-Sport" ? "Public Sports Ground" : `${sport} Ground`;
        }

        // Format address / area
        const address =
          tags["addr:full"] ||
          tags["addr:street"] ||
          tags["addr:suburb"] ||
          tags["addr:city"] ||
          "Jaipur, Rajasthan";

        return {
          id: `osm_${el.type}_${el.id}`,
          name,
          sport,
          address,
          location: {
            type: "Point",
            coordinates: [elon, elat],
          },
          isExternal: true,
          source: "OpenStreetMap",
          googleMapsUrl: `https://www.google.com/maps/search/?api=1&query=${elat},${elon}`,
        };
      });
    } catch (err) {
      lastError = err;
    }
  }

  throw lastError || new Error("All Overpass mirrors failed to respond");
}
