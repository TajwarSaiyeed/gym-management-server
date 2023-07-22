const mongoose = require("mongoose");

const exerciseSchema = mongoose.Schema(
  {
    email: { type: String, required: true },
    workOut: [
      {
        id: { type: String, required: true },
        exerciseName: { type: String, required: true },
        sets: { type: Number, required: true },
        steps: { type: Number, required: true },
        restTime: { type: Number, required: true },
        kg: { type: Number, required: true },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Exercise", exerciseSchema);
