
const jwt = require("jsonwebtoken");

module.exports = function (req, res, next) {
  if (!req.user) {
    return res.status(401).json({ error: "Autentificare necesară." });
  }
  if (req.user.role !== "admin") {
    return res.status(403).json({ error: "Acces doar pentru admini." });
  }
  next();
};