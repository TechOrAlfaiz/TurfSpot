/**
 * Server-Side In-Memory Cache with TTL & In-Flight Request Deduplication
 * Prevents redundant calls to external geocoding / places providers.
 */

class PlacesCache {
  constructor(defaultTtlMs = 24 * 60 * 60 * 1000) {
    this.cache = new Map(); // key -> { data, expiresAt }
    this.inFlight = new Map(); // key -> Promise
    this.defaultTtlMs = defaultTtlMs;
  }

  /**
   * Generates a spatial bucket key by rounding lat/lng to 2 decimal places (~1.1km)
   */
  generateKey(lat, lng, radiusMeters) {
    const roundedLat = Number(lat).toFixed(2);
    const roundedLng = Number(lng).toFixed(2);
    const roundedRadius = Math.round(Number(radiusMeters) / 1000) * 1000;
    return `${roundedLat}_${roundedLng}_${roundedRadius}`;
  }

  get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return entry.data;
  }

  set(key, data, ttlMs = this.defaultTtlMs) {
    this.cache.set(key, {
      data,
      expiresAt: Date.now() + ttlMs,
    });
  }

  /**
   * Execute with in-flight deduplication: if identical query is already pending,
   * share the same promise rather than issuing a duplicate upstream request.
   */
  async executeWithDeduplication(key, fetchFn) {
    const cached = this.get(key);
    if (cached) {
      return { data: cached, fromCache: true };
    }

    if (this.inFlight.has(key)) {
      const data = await this.inFlight.get(key);
      return { data, fromCache: true };
    }

    const fetchPromise = (async () => {
      try {
        const result = await fetchFn();
        this.set(key, result);
        return result;
      } finally {
        this.inFlight.delete(key);
      }
    })();

    this.inFlight.set(key, fetchPromise);
    const data = await fetchPromise;
    return { data, fromCache: false };
  }

  clear() {
    this.cache.clear();
    this.inFlight.clear();
  }
}

export const placesCache = new PlacesCache();
export default placesCache;
