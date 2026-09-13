import { getNearbyDiscoveryVenues } from "../../services/discovery/placesService.js";

/**
 * GET /api/user/discovery/nearby
 * Returns discovery-only sports venues near coordinates
 */
export async function getDiscoveryVenues(req, res) {
  try {
    const lat = parseFloat(req.query.lat);
    const lng = parseFloat(req.query.lng);
    const radiusMeters = parseInt(req.query.radiusMeters, 10) || 8000;

    if (isNaN(lat) || isNaN(lng)) {
      return res.status(400).json({
        success: false,
        message: "Valid lat and lng query parameters are required",
      });
    }

    const result = await getNearbyDiscoveryVenues(lat, lng, radiusMeters);

    return res.status(200).json({
      success: true,
      provider: result.provider,
      cached: result.fromCache,
      count: result.total,
      venues: result.venues,
    });
  } catch (error) {
    console.error("Discovery venues endpoint error:", error);
    // Graceful fallback: return empty list with success so frontend map does not break
    return res.status(200).json({
      success: true,
      provider: "Fallback",
      cached: false,
      count: 0,
      venues: [],
    });
  }
}
