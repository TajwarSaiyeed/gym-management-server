const mongoose = require("mongoose");

const exerciseListSchema = mongoose.Schema(
  {
    exerciseName: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const ExerciseList = mongoose.model("ExerciseList", exerciseListSchema);

module.exports = ExerciseList;
