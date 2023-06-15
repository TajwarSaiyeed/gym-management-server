const express = require("express");
const attendanceControllers = require("../controllers/attendance.Controllers");
const router = express.Router();

router.route("/").get(attendanceControllers.allAttendanceList);
router
  .route("/:email")
  .get(attendanceControllers.getAttendanceByEmail)
  .patch(attendanceControllers.updateAttendance);

module.exports = router;
