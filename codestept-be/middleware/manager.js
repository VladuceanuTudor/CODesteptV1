
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const managerMiddleware = async (req, res, next) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    return res.status(401).json({ error: "Nu a fost furnizat niciun token." });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.userId);
    if (!user) {
      return res.status(404).json({ error: "Utilizatorul nu a fost găsit." });
    }
    if (user.role !== "manager") {
      return res.status(403).json({ error: "Acces neautorizat. Doar managerii pot accesa această resursă." });
    }
    req.user = user; // Attach user to request
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Token-ul a expirat. Te rugăm să te autentifici din nou." });
    }
    res.status(401).json({ error: "Token invalid." });
  }
};

module.exports = managerMiddleware;