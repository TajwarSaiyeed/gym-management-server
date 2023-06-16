const User = require("../models/user.Model");

const asyncHandler = require("express-async-handler");
// /api/user?search=trainer

module.exports.allUsers = asyncHandler(async (req, res) => {
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
});

module.exports.students = asyncHandler(async (req, res) => {
  try {
    const students = await User.find({ role: "student" });
    res.json(students);
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
});
