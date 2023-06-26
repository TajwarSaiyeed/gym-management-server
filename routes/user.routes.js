const express = require("express");
const userControllers = require("../controllers/user.Controllers");

const router = express.Router();

router.route("/").get(userControllers.allUsers);
router.route("/students").get(userControllers.students);
router
  .route("/:email")
  .get(userControllers.getUser)
  .post(userControllers.addUser);

module.exports = router;
