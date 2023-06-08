const User = require("../models/userModel");

// /api/user?search=trainer
const allUsers = async (req, res) => {
  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};
  const users = await User.find(keyword).find({
    email: { $ne: req.decoded.email },
  });

  res.json(users);
};

module.exports = { allUsers };
