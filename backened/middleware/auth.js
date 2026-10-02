const jwt = require("jsonwebtoken");

/**
 * Optional Auth Middleware
 * Decodes JWT if Authorization header is present.
 * If token is invalid or expired, returns 401.
 * If valid, attaches req.userId.
 * If missing, sets req.userId = null and continues.
 */
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.userId = null;
    return next();
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = (process.env.JWT_SECRET || "fallback_secret_key_12345").trim();

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired authorization token." });
  }
};

/**
 * Strict Auth Middleware
 * Requires a valid Bearer token, otherwise returns 401.
 */
const requireAuth = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access denied. Authorization token required." });
  }

  const token = authHeader.split(" ")[1];
  const jwtSecret = (process.env.JWT_SECRET || "fallback_secret_key_12345").trim();

  try {
    const decoded = jwt.verify(token, jwtSecret);
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(401).json({ error: "Invalid or expired authorization token." });
  }
};

module.exports = {
  optionalAuth,
  requireAuth,
};
