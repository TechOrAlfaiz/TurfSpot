import { Router } from "express";
import { getDiscoveryVenues } from "../../controllers/user/discovery.controller.js";

const discoveryRouter = Router();

discoveryRouter.get("/nearby", getDiscoveryVenues);

export default discoveryRouter;
