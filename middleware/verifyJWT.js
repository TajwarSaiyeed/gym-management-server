const jwt = require("jsonwebtoken");

const verifyJWT = (req, res, next) => {
  const authHeader = req.headers.authorization;
  // console.log(authHeader);
  if (!authHeader) {
    return res.status(401).send({ error: 401, message: "Unauthorized Access" });
  }
  const token = authHeader.split(" ")[1];
  jwt.verify(token, process.env.ACCESS_TOKEN, (err, decoded) => {
    if (err) {
      return res.status(403).send({ error: 403, message: "Forbidded Access" });
    }
    req.decoded = decoded;
    next();
  });
};

module.exports = verifyJWT;
