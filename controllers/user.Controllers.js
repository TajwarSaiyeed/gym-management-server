const { auth } = require("firebase-admin");
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
    const students = await User.find({ role: "user" });

    res.status(200).json({
      status: "success",
      data: students,
    });
  } catch (error) {
    res.status(500).json({
      status: "fail",
      message: error.message,
    });
  }
});

module.exports.addUser = asyncHandler(async (req, res) => {
  let firebaseUser;
  const email = req.params.email;
  const { password, name } = req.body;
  const isExist = await User.findOne({ email: email });

  if (isExist) {
    res.status(400);
    throw new Error("User already exist");
  }

  auth()
    .createUser({
      email: email,
      password,
      displayName: name,
    })
    .then((userRecord) => {
      // console.log("Successfully created new user:", userRecord.uid);
    })
    .catch((error) => {
      console.error("Error creating new user:", error);
    });

  const user = await User.create({
    ...req.body,
    assignedBy: req.decoded._id,
  });

  res.status(201).json({
    status: "success",
    data: user,
  });
});
