const express = require("express");
const { allUsers } = require("../controllers/user.Controllers");

const router = express.Router();

router.route("/").get(allUsers);

module.exports = router;
