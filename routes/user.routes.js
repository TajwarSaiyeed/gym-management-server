const express = require("express");
const userControllers = require("../controllers/user.Controllers");
const verifyJWT = require("../middleware/verifyJWT");
const { superAdmin } = require("../middleware/superAdmin.middleware");

const router = express.Router();

router.route("/").get(verifyJWT, userControllers.allUsers);
router.route("/allUsers").get(verifyJWT, userControllers.AllUsers);
router.route("/students").get(verifyJWT, userControllers.students);
router.route("/trainers").get(verifyJWT, userControllers.trainers);
router
  .route("/admins")
  .get(verifyJWT, superAdmin, userControllers.adminsforsuperAdmin);
router
  .route("/:email")
  .get(verifyJWT, userControllers.getUser)
  .post(verifyJWT, userControllers.addUser)
  .patch(verifyJWT, userControllers.updateUser);

router.route("/signup/:email").put(userControllers.signupUser);

module.exports = router;
