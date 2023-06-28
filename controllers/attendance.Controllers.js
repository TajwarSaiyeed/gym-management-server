const Attendance = require("../models/attendance.Model");
const User = require("../models/user.Model");

// const days = [
//   "Sunday",
//   "Monday",
//   "Tuesday",
//   "Wednesday",
//   "Thursday",
//   "Friday",
//   "Saturday",
// ];

// setInterval(async () => {
//   // trainer or user
//   const users = await User.find({
//     $or: [{ role: "trainer" }, { role: "user" }],
//   });

//   users.forEach(async (user) => {
//     await Attendance.create({
//       email: user.email,
//       date: new Date().toLocaleDateString(),
//       day: days[new Date().getDay()],
//       attendanceStatus: false,
//       user: user._id,
//     });
//   });
// }, 24 * 60 * 60 * 1000);

module.exports.allAttendanceList = async (req, res) => {
  const result = await Attendance.find().populate("user");

  return res.status(200).json({
    status: "success",
    message: "Attendance list",
    data: result,
  });
};

// get attendance by email
module.exports.getAttendanceByEmail = async (req, res) => {
  const email = req.params.email;
  const filter = { email: email };

  const result = await Attendance.find(filter);

  return res.status(200).json({
    status: "success",
    message: "Attendance list by email",
    data: result,
  });
};

// update or create attendance
module.exports.updateAttendance = async (req, res) => {
  const email = req.params.email;
  const date = req.query.date;
  const { day, attendanceStatus } = req.body;
  const filter = { email: email, date: date };

  // find the document first
  const isExist = await Attendance.findOne(filter);

  // if document exists, update it

  if (isExist) {
    return;
  }

  // if document does not exist, create it

  const result = await Attendance.create({
    email,
    date,
    day,
    attendanceStatus,
    user: req.decoded._id,
  });

  return res
    .status(201)
    .json({ status: "success", message: "Attendance created", data: result });
};

module.exports.present = async (req, res) => {
  const email = req.params.email;
  const date = req.query.date;
  const { attendanceStatus } = req.body;
  const filter = { email: email, date: date };

  const result = await Attendance.findOneAndUpdate(
    filter,
    {
      attendanceStatus: attendanceStatus,
    },
    { upsert: true }
  );

  return res
    .status(201)
    .json({ status: "success", message: "Attendance updated", data: result });
};
