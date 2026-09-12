import jwt from "jsonwebtoken";

export const verifyUserToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Access token is missing or malformed",
      });
    }

    const token = header.split(" ")[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Access token is missing",
      });
    }

    const secret = process.env.JWT_SECRET || "turfspot_super_secure_jwt_secret_key_2025";
    const decoded = jwt.verify(token, secret);
    
    if (!decoded) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized: Invalid token",
      });
    }

    // Attach decoded user information
    req.user = decoded.user ? { id: decoded.user, ...decoded } : decoded;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        code: "TOKEN_EXPIRED",
        message: "Session expired. Please log in again.",
      });
    }
    if (err.name === "JsonWebTokenError") {
      return res.status(401).json({
        success: false,
        code: "INVALID_TOKEN",
        message: "Invalid authentication token.",
      });
    }
    return res.status(401).json({
      success: false,
      message: "Unauthorized authentication error.",
    });
  }
};

export const requireRole = (allowedRoles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }
    const userRole = req.user.role || "player";
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return res.status(403).json({
        success: false,
        message: `Forbidden: Insufficient privileges. Required: [${allowedRoles.join(", ")}]`,
      });
    }
    next();
  };
};

export default verifyUserToken;

