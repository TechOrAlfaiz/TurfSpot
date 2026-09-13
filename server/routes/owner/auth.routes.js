import { Router } from "express";
import {
  registerOwner,
  loginOwner,
  ownerRequest,
} from "../../controllers/owner/auth.controller.js";
import {
  validateRegisterInput,
  validateLoginInput,
  validateOwnerRequestInput,
} from "../../middleware/validators/owner/authValidator.js";
import upload from "../../middleware/uploads/upload.middleware.js";

const authRouter = Router();
authRouter.post("/register", validateRegisterInput, registerOwner);
authRouter.post("/login", validateLoginInput, loginOwner);
authRouter.post(
  "/ownerRequest",
  upload.array("photos", 10),
  validateOwnerRequestInput,
  ownerRequest
);

export default authRouter;




