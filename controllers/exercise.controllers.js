const asyncHandler = require("express-async-handler");
const Exercise = require("../models/exercise.Model");
const Notification = require("../models/notification.Model");

const addExercise = asyncHandler(async (req, res) => {
  const { workOut, users, from, to } = req.body;

  users.forEach(async (user) => {
    const exercise = await Exercise.findOne({ email: user });
    if (exercise) {
      exercise.workOut = workOut;
      exercise.from = from;
      exercise.to = to;
      await exercise.save();
    } else {
      await Exercise.create({ email: user, workOut, from, to });
    }
  });

  users.forEach(async (user) => {
    await Notification.create({
      email: user,
      notificationType: "exercise",
      notificationText: "New exercise added",
      isRead: false,
      pathName: "/home/user-exercises",
    });
  });

  res.status(201).json({
    status: "success",
    message: "Exercise added successfully",
  });
});

const getExerciseDataByEmail = asyncHandler(async (req, res) => {
  const { email } = req.query;
  const exercise = await Exercise.findOne({ email });

  if (exercise) {
    res.status(200).json({
      status: "success",
      data: exercise,
    });
  } else {
    res.status(404);
    throw new Error("Exercise not found");
  }
});

module.exports = {
  addExercise,
  getExerciseDataByEmail,
};
