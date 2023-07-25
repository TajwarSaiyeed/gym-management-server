const asyncHandler = require("express-async-handler");
const Diet = require("../models/diet.Model");
const Notification = require("../models/notification.Model");

const addDiet = asyncHandler(async (req, res) => {
  const { period, users, from, to } = req.body;

  users.forEach(async (user) => {
    try {
      const diet = await Diet.findOne({ email: user });

      if (diet) {
        diet.period = period;
        await diet.save();
      } else {
        await Diet.create({ email: user, period, from, to });
      }
    } catch (error) {
      console.log("error", error);
    }
  });

  users.forEach(async (user) => {
    try {
      await Notification.create({
        email: user,
        notificationType: "diet",
        notificationText: "New diet added",
        isRead: false,
        pathName: "/home/user-diet",
      });
    } catch (error) {
      console.log("error", error);
    }
  });

  res.status(201).json({
    status: "success",
    message: "Diet added successfully",
  });
});

const getDietDataByEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;
  const diet = await Diet.findOne({ email });

  if (diet) {
    res.status(200).json({
      status: "success",
      data: diet,
    });
  } else {
    res.status(404);
    throw new Error("Diet not found");
  }
});

module.exports = {
  addDiet,
  getDietDataByEmail,
};
