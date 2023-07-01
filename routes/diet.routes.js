const express = require("express");
const router = express.Router();
const dietController = require("../controllers/diet.Controllers");
const { verifyAdminOrTrainer } = require("../middleware/verifyAdminOrTrainer");

router
  .route("/")
  .get(dietController.getDietDataByEmail)
  .put(verifyAdminOrTrainer, dietController.addDiet);

router
  .route("/:id")
  .delete(verifyAdminOrTrainer, dietController.deleteDietById);

module.exports = router;
