import React from "react";
import MapLibreCatalogMap from "./MapLibreCatalogMap";

/**
 * TurfCatalogMap Component
 * Migrated to MapLibre GL JS + OpenFreeMap (Free Vector Tiles, Zero Google API Key required)
 */
const TurfCatalogMap = (props) => {
  return <MapLibreCatalogMap {...props} />;
};

export default TurfCatalogMap;
