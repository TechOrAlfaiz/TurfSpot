import express from "express";
import { getDashboardData } from "../../controllers/owner/dashboard.controller.js";
import {
  getOwnerTurfs,
  getOwnerBookings,
  updateTurfAvailability,
} from "../../controllers/owner/dashboardOverview.controller.js";
import verifyOwnerToken from "../../middleware/jwt/owner.middleware.js";

const dashboardRouter = express.Router();

dashboardRouter.get("/", verifyOwnerToken, getDashboardData);
dashboardRouter.get("/my-turfs", verifyOwnerToken, getOwnerTurfs);
dashboardRouter.get("/bookings", verifyOwnerToken, getOwnerBookings);
dashboardRouter.put("/turf/:id/availability", verifyOwnerToken, updateTurfAvailability);

export default dashboardRouter;