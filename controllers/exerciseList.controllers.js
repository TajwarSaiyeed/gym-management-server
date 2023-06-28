const asyncHandler = require("express-async-handler");
const ExerciseList = require("../models/exerciseList.Model");

module.exports.addNewExercise = asyncHandler(async (req, res) => {
  const { exerciseName } = req.body;

  try {
    if (!exerciseName) {
      res.status(400);
      throw new Error("Please enter exercise name");
    } else {
      // if exercise name already exists

      const isExist = await ExerciseList.findOne({ exerciseName });

      if (isExist) {
        res.status(400);
        throw new Error("Exercise name already exists");
      }

      const exercise = await ExerciseList.create({
        exerciseName,
      });
      if (exercise) {
        res.status(201).json({
          success: true,
          data: exercise,
        });
      }

      res.status(400);
    }
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

// get all exercise in an array
module.exports.getAllExercise = asyncHandler(async (req, res) => {
  try {
    const exercise = await ExerciseList.find({});
    if (exercise) {
      res.status(200).json({
        success: true,
        data: exercise,
      });
    }
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});

// delete exercise
module.exports.deleteExercise = asyncHandler(async (req, res) => {
  const { id } = req.params;
  try {
    const exercise = await ExerciseList.deleteOne({ _id: id });
    if (exercise) {
      res.status(200).json({
        success: true,
        data: exercise,
      });
    } else {
      res.status(400);
      throw new Error("Exercise not found");
    }
  } catch (error) {
    res.status(400);
    throw new Error(error);
  }
});
