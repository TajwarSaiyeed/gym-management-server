const asyncHandler = require("express-async-handler");
const Diet = require("../models/diet.Model");

const addDiet = asyncHandler(async (req, res) => {
  const { period, users } = req.body;

  users.forEach(async (user) => {
    const diet = await Diet.findOne({ email: user });
    if (diet) {
      diet.period = period;
      await diet.save();
    } else {
      await Diet.create({ email: user, workOut });
    }
  });

  users.forEach(async (user) => {
    await Notification.create({
      email: user,
      notificationType: "diet",
      notificationText: "New diet added",
      isRead: false,
      pathName: "/home/diet",
    });
  });

  res.status(201).json({
    status: "success",
    message: "Diet added successfully",
  });
});

const getDietDataByEmail = asyncHandler(async (req, res) => {});

module.exports = {
  addDiet,
  getDietDataByEmail,
};
