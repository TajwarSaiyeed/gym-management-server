const express = require("express");
const attendanceControllers = require("../controllers/attendance.Controllers");
const router = express.Router();

router.route("/").get(attendanceControllers.allAttendanceList);
router.route("/:email").get(attendanceControllers.getAttendanceByEmail);

router.route("/:email/present").patch(attendanceControllers.present);

module.exports = router;
