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
    day: {
      type: String,
      required: true,
    },
    attendanceStatus: {
      type: Boolean,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const Attendance = mongoose.model("Attendance", attendanceModel);

module.exports = Attendance;
