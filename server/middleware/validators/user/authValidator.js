import { body } from "express-validator";

export const validateRegisterInput = [
  body("name").trim().notEmpty().withMessage("Name is required"),
  body("email").trim().isEmail().withMessage("Enter a valid email address"),
  body("phone").optional().trim(),
  body("password").notEmpty().withMessage("Password is required").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
  body("confirmPassword").optional().custom((value, { req }) => {
    if (value && value !== req.body.password) {
      throw new Error("Passwords do not match");
    }
    return true;
  }),
];

export const validateLoginInput = [
  body("email").trim().isEmail().withMessage("Enter a valid email address"),
  body("password").notEmpty().withMessage("Password is required"),
];

