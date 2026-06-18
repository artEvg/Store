const jwt = require("jsonwebtoken");

const auth = (requiredRole = null) => {
  return async (req, res, next) => {
    let token = req.headers["authorization"];
    if (!token) {
      return res
        .status(401)
        .json({ message: "Access denied. No token provided." });
    }
    token = token.split(" ")[1];
    jwt.verify(token, process.env.SECRET_KEY, (err, decoded) => {
      if (err) {
        return res.status(400).json({ message: "Invalid token." });
      } else {
        console.log(decoded);
        req.user = decoded;
        if (requiredRole && decoded.role !== requiredRole) {
          return res
            .status(403)
            .json({ message: "Access denied. Insufficient permissions." });
        }

        next();
      }
    });
  };
};

const cookieAuth = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({ message: "No token provided" });
    }

    const decoded = jwt.verify(token, process.env.SECRET_KEY);

    req.user = decoded;

    next();
  } catch (error) {
    return res.status(401).json({ message: "Invalid token" });
  }
};

module.exports = { auth, cookieAuth };
