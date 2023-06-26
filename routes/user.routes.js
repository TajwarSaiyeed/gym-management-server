const express = require("express");
const userControllers = require("../controllers/user.Controllers");

const router = express.Router();

router.route("/").get(userControllers.allUsers);
router
  .route("/:email")
  .post(userControllers.addUser)
  .get(userControllers.getUser);
router.route("/students").get(userControllers.students);

module.exports = router;
