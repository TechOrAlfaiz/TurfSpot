import React from "react";
import { Navigate, useLocation } from "react-router-dom";

export default function RoleRoute({ children, requiredRole }) {
  const location = useLocation();

  let token = null;
  let role = null;

  if (requiredRole === "admin") {
    token = localStorage.getItem("adminToken");
    role = localStorage.getItem("adminRole");
    if (!token || role !== "admin") {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  } else if (requiredRole === "owner") {
    token = localStorage.getItem("ownerToken");
    role = localStorage.getItem("ownerRole");
    if (!token || role !== "owner") {
      return <Navigate to="/login" state={{ from: location }} replace />;
    }
  }

  return children;
}
