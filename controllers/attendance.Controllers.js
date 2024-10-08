const mongoose = require("mongoose");
const moment = require("moment");

const Attendance = require("../models/attendance.Model");
const User = require("../models/user.Model");

setInterval(async () => {
  const date = moment().utc().format("YYYY-MM-DD");
  // get moment hour
  const hour = moment().utc().format("HH");
  // get moment minute
  const minute = moment().utc().format("mm");
  // get moment second
  const second = moment().utc().format("ss");

  if (hour === "00" && minute === "00" && second === "00") {
    const users = await User.find({
      role: "user",
    });

    users.forEach(async (user) => {
      await Attendance.create({
        email: user.email,
        user: user._id,
        date: date,
        isPresent: false,
      });
    });

    console.log("Attendance created");
  }
}, 1000);

const allAttendanceList = async (req, res) => {
  const gymId = req.query.gymId;

  const user = await User.findOne({ email: req.decoded.email });

  if (user.role === "admin" && user.superAdmin) {
    const result = await Attendance.find({}).populate("user");

    return res.status(200).json({
      status: "success",
      message: "Attendance list",
      data: result,
    });
  }

  let myGymUsersAttendance = [];
  const result = await Attendance.find({}).populate("user");

  result.forEach((user) => {
    if (user?.user?.gymId == gymId) {
      myGymUsersAttendance.push(user);
    }
  });

  return res.status(200).json({
    status: "success",
    message: "Attendance list",
    data: myGymUsersAttendance,
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

  const isExistattendance = await Attendance.findOne(filter);

  if (!isExistattendance) {
    res.status(404);
    throw new Error("Attendance not found");
  }

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
