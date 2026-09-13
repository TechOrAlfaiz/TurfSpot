import { Router } from "express";
import {
  getOwnerTurfs,
  getOwnerBookings,
  updateTurfAvailability,
} from "../../controllers/owner/dashboardOverview.controller.js";
import verifyOwnerToken from "../../middleware/jwt/owner.middleware.js";

const ownerDashboardRouter = Router();

// Protect all owner dashboard routes with verifyOwnerToken
ownerDashboardRouter.use(verifyOwnerToken);

ownerDashboardRouter.get("/my-turfs", getOwnerTurfs);
ownerDashboardRouter.get("/bookings", getOwnerBookings);
ownerDashboardRouter.put("/turf/:id/availability", updateTurfAvailability);

export default ownerDashboardRouter;
