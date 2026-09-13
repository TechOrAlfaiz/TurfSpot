import { Router } from "express";
import { getAllTurfs, toggleTurfActiveStatus } from "../../controllers/admin/turf.controller.js";
import verifyAdminToken from "../../middleware/jwt/admin.middleware.js";

const turfRouter = Router();

turfRouter.get("/all", verifyAdminToken, getAllTurfs);
turfRouter.patch("/:id/toggle-active", verifyAdminToken, toggleTurfActiveStatus);

export default turfRouter;