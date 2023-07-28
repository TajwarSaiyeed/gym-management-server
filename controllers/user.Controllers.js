const { auth } = require("firebase-admin");
const User = require("../models/user.Model");

const asyncHandler = require("express-async-handler");
// /api/user?search=trainer
// getAllUser for messages section without the logged in user
module.exports.allUsers = asyncHandler(async (req, res) => {
  const gymId = req.query.gymId;

  const user = await User.findOne({ email: req.decoded.email });

  if (user.role === "admin" && user.superAdmin) {
    const keyword = req.query.search
      ? {
          $or: [
            { name: { $regex: req.query.search, $options: "i" } },
            { email: { $regex: req.query.search, $options: "i" } },
          ],
        }
      : {};
    const users = await User.find(keyword)
      .find({ email: { $ne: req.decoded.email } })
      .populate("assignedBy")
      .populate("admin");

    return res.json(users);
  }

  const keyword = req.query.search
    ? {
        $or: [
          { name: { $regex: req.query.search, $options: "i" } },
          { email: { $regex: req.query.search, $options: "i" } },
        ],
      }
    : {};

  const users = await User.find(keyword)
    .find({ gymId: gymId, email: { $ne: req.decoded.email } })
    .populate("assignedBy")
    .populate("admin");

  res.json(users);
});

module.exports.AllUsers = asyncHandler(async (req, res) => {
  const gymId = req.query.gymId;
  const user = await User.findOne({ email: req.decoded.email });

  if (user.role === "admin" && user.superAdmin) {
    const users = await User.find({}).populate("assignedBy").populate("admin");
    return res.json(users);
  }

  const users = await User.find({ gymId: gymId })
    .populate("assignedBy")
    .populate("admin");

  res.json(users);
});

module.exports.trainers = asyncHandler(async (req, res) => {
  const gymId = req.query.gymId;
  const user = await User.findOne({ email: req.decoded.email });

  if (user.role === "admin" && user.superAdmin) {
    const trainers = await User.find({ role: "trainer" }).populate(
      "assignedBy"
    );

    return res.status(200).json({
      status: "success",
      data: trainers,
    });
  }

  const trainers = await User.find({ gymId: gymId, role: "trainer" }).populate(
    "assignedBy"
  );

  res.status(200).json({
    status: "success",
    data: trainers,
  });
});

module.exports.students = asyncHandler(async (req, res) => {
  const gymId = req.query.gymId;
  const user = await User.findOne({ email: req.decoded.email });

  if (user.role === "admin" && user.superAdmin) {
    const students = await User.find({ role: "user" }).populate("assignedBy");

    return res.status(200).json({
      status: "success",
      data: students,
    });
  }

  const students = await User.find({ gymId: gymId, role: "user" }).populate(
    "assignedBy"
  );

  res.status(200).json({
    status: "success",
    data: students,
  });
});

module.exports.addUser = asyncHandler(async (req, res) => {
  const email = req.params.email;
  const { password, name, gymId } = req.body;
  const isExist = await User.findOne({ email: email });

  if (isExist) {
    res.status(400);
    throw new Error("User already exist");
  }

  const superAdmin = await User.findOne({ role: "admin", superAdmin: true });

  const admin = await User.findOne({ gymId: gymId, role: "admin" });

  await auth().createUser({ email: email, password, displayName: name });

  const user = await User.create({
    ...req.body,
    assignedBy: superAdmin._id === req.decoded.id ? null : req.decoded.id,
    admin: admin ? admin._id : null,
    superAdmin: false,
  });

  res.status(201).json({
    status: "succes",
    data: user,
  });
});

// signup user
module.exports.signupUser = asyncHandler(async (req, res) => {
  const email = req.params.email;
  const isExist = await User.findOne({ email: email });

  if (isExist) {
    res.status(400);
    throw new Error("User already exist");
  }

  const user = await User.create({
    ...req.body,
    superAdmin: false,
  });

  res.status(201).json({
    status: "success",
    data: user,
  });
});

module.exports.getUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email })
      .populate("assignedBy")
      .populate("admin");
    if (!user) {
      res.status(404);
      throw new Error("User not found");
    }

    res.status(200).json({
      status: "success",
      data: user,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error?.message,
    });
  }
});

module.exports.updateUser = asyncHandler(async (req, res) => {
  try {
    const user = await User.findOne({ email: req.params.email });
    if (!user) {
      res.status(404).json({
        status: "fail",
        message: "User not found",
      });
    }

    const updatedUser = await User.findOneAndUpdate(
      { email: req.params.email },
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      status: "success",
      data: updatedUser,
    });
  } catch (err) {
    res.status(500).json({
      status: "fail",
      message: err?.message,
    });
  }
});

module.exports.adminsforsuperAdmin = asyncHandler(async (req, res) => {
  const admins = await User.find({ role: "admin", superAdmin: false }).populate(
    "gymId"
  );

  return res.status(200).json({
    status: "success",
    data: admins,
  });
});
