const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
      default: "https://i.ibb.co/GPxVTtH/user.png",
    },
    role: {
      type: String,
      enum: ["user", "admin", "trainer"],
      required: true,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    gender: {
      type: String,
      enum: ["male", "female"],
      required: true,
    },
    age: {
      type: Number,
      default: 0,
    },
    height: {
      type: Number,
      default: 0,
    },
    weight: {
      type: Number,
      default: 0,
    },
    goal: {
      type: String,
      enum: [
        "gain weight",
        "lose weight",
        "get fitter",
        "gain more flexible",
        "learn the basics",
      ],
      default: "learn the basics",
    },
    level: {
      type: String,
      enum: ["rookie", "beginner", "intermediate", "advanced", "true beast"],
      default: "rookie",
    },
    assignedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    admin: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    gymId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Gym",
    },
    superAdmin: {
      type: Boolean,
      enum: [true, false],
      required: true,
      defalut: false,
    },
    approved: {
      type: Boolean,
      enum: [true, false],
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model("User", userSchema);

module.exports = User;
