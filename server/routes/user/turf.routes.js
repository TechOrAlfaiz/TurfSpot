import { Router } from "express";
import {
  getAllTurfs,
  getTurfById,
  getTimeSlotByTurfId,
  getTurfDistance,
  getTurfSlots,
  getNearbyTurfs,
} from "../../controllers/user/turf.controller.js";

const turfRouter = Router();

// 1. Static endpoints must be declared BEFORE parameterized :id routes
turfRouter.get("/nearby", getNearbyTurfs);
turfRouter.get("/search", getNearbyTurfs);
turfRouter.get("/all", getAllTurfs);

// Timeslot queries via query parameters
turfRouter.get("/timeSlot", getTimeSlotByTurfId);
turfRouter.get("/timeslot", getTimeSlotByTurfId);
turfRouter.get("/timeslots", getTimeSlotByTurfId);
turfRouter.get("/slots", getTurfSlots);
turfRouter.get("/distance", getTurfDistance);

// 2. Specific nested routes for turf id
turfRouter.get("/:id/distance", getTurfDistance);
turfRouter.get("/:id/slots", getTurfSlots);
turfRouter.get("/:id/timeslots", getTimeSlotByTurfId);
turfRouter.get("/:id/timeslot", getTimeSlotByTurfId);
turfRouter.get("/:id/timeSlot", getTimeSlotByTurfId);
turfRouter.get("/details/:id", getTurfById);

// 3. Fallthrough parameterized turf by ID route
turfRouter.get("/:id", getTurfById);

export default turfRouter;
