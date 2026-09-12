import jwt from "jsonwebtoken";

const verifyAdminToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization;
    if (!header) {
      return res.status(401).json({ message: "Invalid authorization" });
    }
    const token = header.split(" ")[1];
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "No token , authorization denied" });
    }
    const secret = process.env.JWT_SECRET || "turfspot_super_secure_jwt_secret_key_2025";
    const decoded = jwt.verify(token, secret);
    if (!decoded) {
      return res.status(403).json({
        success: false,
        message: "Invalid token, authorization denied",
      });
    }
    req.admin = decoded;
    if (req.admin.role !== "admin") {
      return res.status(403).json({ success: false, message: "Unauthorized: Admin privileges required" });
    }
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError" || error.name === "JsonWebTokenError") {
      return res.status(401).json({ success: false, message: "Invalid or expired authorization token" });
    }
    return res.status(500).json({ success: false, message: error.message });
  }
};


export default verifyAdminToken;
