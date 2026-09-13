import jwt from "jsonwebtoken";

/**
 * Additive role verification middleware.
 * Checks JWT from Authorization header and verifies required role ('admin' or 'owner').
 * Operates alongside existing auth middlewares without modifying them.
 */
export const checkRole = (requiredRole) => {
  return async (req, res, next) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Authentication token missing or invalid",
        });
      }

      const token = authHeader.split(" ")[1];
      const secret = process.env.JWT_SECRET || "turfspot_super_secure_jwt_secret_key_2025";
      const decoded = jwt.verify(token, secret);

      if (!decoded || !decoded.role) {
        return res.status(403).json({
          success: false,
          message: "Invalid token payload",
        });
      }

      if (decoded.role !== requiredRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Requires '${requiredRole}' privileges.`,
        });
      }

      // Attach decoded context according to role
      if (requiredRole === "admin") {
        req.admin = decoded;
      } else if (requiredRole === "owner") {
        req.owner = decoded;
      }
      req.userRole = decoded.role;

      next();
    } catch (err) {
      if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
        return res.status(401).json({
          success: false,
          message: "Authorization token expired or invalid",
        });
      }
      return res.status(500).json({
        success: false,
        message: err.message || "Internal server error during authorization",
      });
    }
  };
};

export default checkRole;
