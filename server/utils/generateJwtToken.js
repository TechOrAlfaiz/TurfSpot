import jwt from "jsonwebtoken";

export function generateUserToken(userOrId, role = "player") {
  const secret = process.env.JWT_SECRET || "turfspot_super_secure_jwt_secret_key_2025";
  const payload =
    typeof userOrId === "object"
      ? { user: userOrId._id || userOrId.id, id: userOrId._id || userOrId.id, role: userOrId.role || role }
      : { user: userOrId, id: userOrId, role };

  return jwt.sign(payload, secret, {
    expiresIn: "7d",
  });
}

export const generateOwnerToken = (owner) => {
  const secret = process.env.JWT_SECRET || "turfspot_super_secure_jwt_secret_key_2025";
  const { role = "owner", id, _id } = owner;
  return jwt.sign({ id: id || _id, role }, secret, {
    expiresIn: "7d",
  });
};