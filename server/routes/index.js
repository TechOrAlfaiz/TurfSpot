import { Router } from "express";
import userRouter from "./user/user.routes.js";
import ownerRouter from "./owner/owner.routes.js";
import adminRouter from "./admin/admin.routes.js";
import userTurfRouter from "./user/turf.routes.js";

const rootRouter = Router();

rootRouter.use("/user", userRouter);
rootRouter.use("/owner", ownerRouter);
rootRouter.use("/admin", adminRouter);
rootRouter.use("/turfs", userTurfRouter);

export default rootRouter;
