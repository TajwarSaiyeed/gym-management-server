const { mongoose } = require("mongoose");

const attendanceModel = mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    isPresent: {
      type: Boolean,
      required: true,
      default: false,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model("Attendance", attendanceModel);

module.exports = Attendance;
