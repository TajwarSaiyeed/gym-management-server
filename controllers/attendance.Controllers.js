const Attendance = require("../models/attendance.Model");

module.exports.allAttendanceList = async (req, res) => {
  const result = await Attendance.find();

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
    return res.status(400).json({
      status: "fail",
      message: "Attendance already exists",
    });
  }

  // if document does not exist, create it

  const result = await Attendance.create({
    email,
    date,
    day,
    attendanceStatus,
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
