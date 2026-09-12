import React from "react";
import MapLibreTurfMap from "./MapLibreTurfMap";

/**
 * TurfMap Component
 * Migrated to MapLibre GL JS + OpenFreeMap (Free Vector Tiles, Zero Google API Key required)
 */
const TurfMap = (props) => {
  return <MapLibreTurfMap {...props} />;
};

export default TurfMap;
