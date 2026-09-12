import { useSelector, useDispatch } from "react-redux";
import { setTurfs, setLoading, setError } from "../redux/slices/turfSlice";
import axiosInstance from "../hooks/useAxiosInstance";
import { useEffect, useMemo, useCallback } from "react";
import {
  JAIPUR_TURFS,
  calculateClientHaversineDistance,
  formatDistance,
} from "../data/jaipurTurfs";
import useUserLocation from "./useUserLocation";

const useTurfData = (customParams = {}) => {
  const dispatch = useDispatch();
  const { turfs, loading, error } = useSelector((state) => state.turf);
  const { lat, lng, radius } = useUserLocation();

  const fetchTurfData = useCallback(async () => {
    try {
      dispatch(setLoading(true));
      const queryLat = customParams.lat !== undefined ? customParams.lat : lat;
      const queryLng = customParams.lng !== undefined ? customParams.lng : lng;
      const queryRadius = customParams.radius !== undefined ? customParams.radius : radius;

      let endpoint = `/api/user/turf/nearby?lat=${queryLat}&lng=${queryLng}&radius=${queryRadius}`;
      if (customParams.sport) endpoint += `&sport=${customParams.sport}`;
      if (customParams.lateNight) endpoint += `&lateNight=${customParams.lateNight}`;
      if (customParams.search) endpoint += `&search=${encodeURIComponent(customParams.search)}`;

      let response;
      try {
        response = await axiosInstance.get(endpoint);
      } catch (e) {
        // Fallback to all endpoint
        response = await axiosInstance.get("/api/user/turf/all");
      }

      const data = response?.data?.turfs;
      if (Array.isArray(data) && data.length > 0) {
        dispatch(setTurfs(data));
      } else {
        dispatch(setTurfs(JAIPUR_TURFS));
      }
    } catch (err) {
      dispatch(setTurfs(JAIPUR_TURFS));
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch, lat, lng, radius, customParams.lat, customParams.lng, customParams.radius, customParams.sport, customParams.lateNight, customParams.search]);

  useEffect(() => {
    fetchTurfData();
  }, [fetchTurfData]);

  // Ensure all turfs have accurate client distance attached based on user's active coordinates
  const processedTurfs = useMemo(() => {
    const rawTurfs = Array.isArray(turfs) && turfs.length > 0 ? turfs : JAIPUR_TURFS;

    return rawTurfs.map((t) => {
      const turf = { ...t };
      const coords = turf.location?.coordinates || turf.coordinates;

      if (lat && lng && Array.isArray(coords) && coords.length >= 2) {
        const [turfLng, turfLat] = coords;
        const dist = calculateClientHaversineDistance(lat, lng, turfLat, turfLng);
        turf.distanceKm = dist;
        turf.distanceString = formatDistance(dist);
      } else {
        turf.distanceKm = turf.distanceKm || null;
        turf.distanceString = turf.distanceString || null;
      }

      // Ensure quick preview slots exist
      if (!turf.quickSlots) {
        turf.quickSlots = [
          { time: "8 PM", booked: false },
          { time: "9 PM", booked: turf.pricePerHour > 1000 },
          { time: "10 PM", booked: false },
          { time: "11 PM", booked: !turf.lateNightAvailable && turf.closeTime === "23:00" },
        ];
      }

      return turf;
    });
  }, [turfs, lat, lng]);

  return {
    turfs: processedTurfs,
    loading,
    error,
    refetch: fetchTurfData,
  };
};

export default useTurfData;

