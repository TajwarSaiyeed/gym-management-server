const asyncHandler = require("express-async-handler");
const Exercise = require("../models/exercise.Model");

const addExercise = asyncHandler(async (req, res) => {
  const { workOut, users } = req.body;

  users.forEach(async (user) => {
    const exercise = await Exercise.findOne({ email: user });
    if (exercise) {
      exercise.workOut = workOut;
      await exercise.save();
    } else {
      await Exercise.create({ email: user, workOut });
    }
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
