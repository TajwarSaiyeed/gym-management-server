const express = require("express");
const { superAdmin } = require("../middleware/superAdmin.middleware");
const {
  getGyms,
  createGym,
  deleteGym,
} = require("../controllers/gym.Controllers");

const router = express.Router();

router
  .route("/")
  .get(superAdmin, getGyms)
  .post(superAdmin, createGym)
  .delete(superAdmin, deleteGym);

module.exports = router;
