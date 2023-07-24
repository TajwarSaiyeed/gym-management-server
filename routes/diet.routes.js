const express = require("express");
const router = express.Router();
const dietController = require("../controllers/diet.Controllers");
const { verifyAdminOrTrainer } = require("../middleware/verifyAdminOrTrainer");

router
  .route("/")
  .get(dietController.getDietDataByEmail)
  .put(verifyAdminOrTrainer, dietController.addDiet);

module.exports = router;
