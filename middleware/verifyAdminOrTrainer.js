const User = require("../models/user.Model");

module.exports.verifyAdminOrTrainer = async (req, res, next) => {
  const decodedEmail = req.decoded.email;
  const query = { email: decodedEmail };
  const user = await User.findOne(query);
  if (user?.role !== "admin" && user?.role !== "trainer") {
    return res.status(403).send({ error: 403, message: "forbidden access" });
  }
  next();
};
