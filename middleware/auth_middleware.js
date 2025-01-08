const jwt = require("jsonwebtoken");
const STATUS_CODES = require("../constants.js");

function authenticateToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res.status(STATUS_CODES.UNAUTHORIZED).json({ message: "Authentication token required" });
  }

  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
    if (err) {
      if (err.name === "TokenExpiredError") {
        return res.status(STATUS_CODES.FORBIDDEN).json({ message: "Token has expired" });
      }
      return res.status(STATUS_CODES.FORBIDDEN).json({ message: "Invalid authentication token" });
    }
    req.user = user;
    next();
  });
}

module.exports = authenticateToken;
