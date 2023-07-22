const Attendance = require("../models/attendance.Model");
const User = require("../models/user.Model");
const schedule = require("node-schedule");
const moment = require("moment");

const startOfDayRule = new schedule.RecurrenceRule();
startOfDayRule.hour = 2;
startOfDayRule.minute = 40;
startOfDayRule.second = 0;

console.log(startOfDayRule);

console.log("before interval", moment().utc().format("YYYY-MM-DD HH:mm:ss"));

setInterval(() => {
  console.log("inside interval", moment().utc().format("YYYY-MM-DD HH:mm:ss"));
}, 1000 * 60);

schedule.scheduleJob(startOfDayRule, async () => {
  const date = moment().utc().format("YYYY-MM-DD");

  console.log("inside schedule job", date);

  try {
    const users = await User.find({
      role: "user",
    });

    console.log("hit");

    users.forEach(async (user) => {
      await Attendance.create({
        email: user.email,
        user: user._id,
        date: date,
        isPresent: false,
      });
    });

    console.log("Attendance created");
  } catch (err) {
    return res.status(500).json({
      status: "error",
      message: "Internal server error",
      data: err,
    });
  }
});
const allAttendanceList = async (req, res) => {
  const result = await Attendance.find().populate("user");

  return res.status(200).json({
    status: "success",
    message: "Attendance list",
    data: result,
  });
};

// get attendance by email
const getAttendanceByEmail = async (req, res) => {
  const email = req.params.email;
  const filter = { email: email };

  const result = await Attendance.find(filter);

  return res.status(200).json({
    status: "success",
    message: "Attendance list by email",
    data: result,
  });
};

const present = async (req, res) => {
  const email = req.params.email;
  const date = new Date().toISOString().slice(0, 10);
  const { attendanceStatus } = req.body;
  const filter = { email: email, date: date };

  const result = await Attendance.findOneAndUpdate(
    filter,
    {
      isPresent: attendanceStatus,
    },
    { upsert: true }
  );

  return res
    .status(201)
    .json({ status: "success", message: "Attendance updated", data: result });
};

module.exports = {
  allAttendanceList,
  getAttendanceByEmail,
  present,
};
