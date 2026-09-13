import { Router } from "express";
import authRouter from "./auth.routes.js";
import turfRouter from "./turf.routes.js";
import bookingRouter from "./booking.routes.js";
import reviewRouter from "./review.routes.js";
import discoveryRouter from "./discovery.routes.js";
import { authLimiter, bookingLimiter } from "../../middleware/security/rateLimiter.js";

const userRouter = Router();

userRouter.use("/auth", authLimiter, authRouter);
userRouter.use("/turf", turfRouter);
userRouter.use("/discovery", discoveryRouter);
userRouter.use("/booking", bookingLimiter, bookingRouter);
userRouter.use("/review", reviewRouter);

export default userRouter;